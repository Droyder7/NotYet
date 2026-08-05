# NotYet Architecture

This document describes the architecture implemented in the current codebase. Product rules and domain rationale live in [`SYSTEM.md`](SYSTEM.md); delivered and proposed capabilities live in [`ROADMAP.md`](ROADMAP.md).

## System Context

NotYet is a local-first, single-user decision-support application. It helps one person capture possible opportunities, reduce uncertainty, and decide which opportunities deserve commitment.

The application runs as a Next.js web process and stores data in a hosted PostgreSQL database when deployed. It has no authentication, remote API, synchronization service, or multi-user boundary.

```text
Browser
  |
  | React Server Components + Server Actions
  v
Next.js application
  |
  | Prisma Client
  v
PostgreSQL (DATABASE_URL)
```

## Technology Stack

| Layer | Implementation |
|---|---|
| Web framework | Next.js 15.5 App Router with React 19 |
| Language | TypeScript |
| UI | Tailwind CSS and local reusable components |
| Forms | React Hook Form with Zod validation |
| Persistence | Prisma ORM 6 with PostgreSQL |
| Graph visualization | React Flow |
| Mutations | Next.js Server Actions |
| Package manager | pnpm |

## Application Structure

```text
src/
  app/
    layout.tsx             Shared shell and navigation
    page.tsx               Dashboard and WIP overview
    <entity>/              List, create, and detail routes
    graph/                 Relationship graph
    review/                Weekly and monthly reviews
  components/              Shared UI and interactive client components
  lib/
    db.ts                  Prisma client singleton
    *-actions.ts           Entity queries and Server Actions
    demo-data.ts           Demo dataset and database reset logic
    demo-actions.ts        UI-facing demo Server Actions
prisma/
  schema.prisma            PostgreSQL datasource and domain schema
  migrations/              Versioned SQL migrations + migration_lock.toml
scripts/
  seed.ts                  CLI demo seeding entry point
```

Pages are Server Components unless browser interactivity requires a Client Component. Route pages query through entity action modules or Prisma directly. Mutations are Server Actions that write through Prisma, revalidate affected routes, and redirect when a workflow changes pages.

## Domain Model

The six core entities represent increasing levels of commitment:

```text
Signal -> Intent -> Exploration -> Experiment -> ProjectCandidate -> ActiveProject
```

This is a conceptual progression, not a mandatory linear workflow. Some parent links are optional, allowing direct entry and more than one route through the model.

| Entity | Parent relationships |
|---|---|
| `Signal` | None |
| `Intent` | Required `Signal` |
| `Exploration` | Optional `Signal`, optional `Intent` |
| `Experiment` | Optional `Intent`, optional `Exploration` |
| `ProjectCandidate` | Optional `Experiment` |
| `ActiveProject` | Optional, unique `ProjectCandidate` |

Every core entity has an `AttentionState`: `INBOX`, `ACTIVE`, `WAITING`, `DORMANT`, or `CLOSED`. Candidates also store separate Worthy, Ready, and Now assessments. Active projects occupy either a `MAJOR` or `MINOR` slot.

## Transitions and Relationships

`Transition` is an append-oriented history record. It stores polymorphic entity IDs and `EntityType` values rather than foreign keys to all six entity tables. This avoids an invalid constraint where a polymorphic ID would need to exist in multiple tables.

State-change actions generally use a Prisma transaction to update the entity and create its transition record atomically. Entity detail queries fetch history directly by matching either `fromEntityId` or `toEntityId`.

`Relationship` follows the same polymorphic lookup-table design. It is reserved for graph links that cannot be represented by the typed core foreign keys.

The current `/graph` page does not query `Relationship`. It constructs edges from the typed parent fields in the six core models, which provides referential integrity for the relationships currently displayed.

### Integrity Trade-off

PostgreSQL and Prisma enforce the typed parent-child relationships in the core pipeline. They cannot enforce references stored in `Transition` or `Relationship`; application code is responsible for writing valid entity IDs and matching `EntityType` values. Deleting a core entity does not automatically remove polymorphic log records.

## Data Access and Mutations

`src/lib/db.ts` exposes one Prisma client backed by a `pg` connection pool and `@prisma/adapter-pg`. The client and pool are cached on `globalThis` during development to avoid creating a new connection pool on every hot reload. The runtime requires `DATABASE_URL`; Prisma CLI schema operations also require `DIRECT_URL`.

Each `src/lib/*-actions.ts` module owns operations for one entity:

- Create and delete mutations
- Attention-state changes and transition logging
- List and detail queries
- Candidate assessment and project activation workflows
- Cache revalidation and navigation redirects

There is no separate REST or GraphQL layer. Server Components and Server Actions form the application boundary.

Candidate activation creates an `ActiveProject`, closes the source candidate, and records a cross-entity transition. This workflow should remain atomic as it evolves; the current implementation performs separate writes and is a candidate for consolidation into one Prisma transaction.

## Rendering and Client Boundaries

Most data-heavy pages render on the server. Interactive controls use client components where required:

- Forms and state controls
- Demo-data controls
- React Flow graph interaction

The graph route is forced dynamic so it always reads current database state. Server Actions call `revalidatePath` after mutations to refresh affected server-rendered views.

## Demo Data

The demo dataset uses the same Prisma models as normal application data. It can be loaded through the dashboard or `pnpm db:seed`.

`src/lib/demo-data.ts` contains framework-independent seed and reset functions. `src/lib/demo-actions.ts` wraps them with cache revalidation for the UI, while `scripts/seed.ts` exposes the same behavior to the CLI.

Loading demo data clears existing application data first. This is acceptable for the current local demonstration workflow but should be reconsidered before supporting persistent user datasets.

## Deployment

Vercel is the reference deployment target. `vercel.json` installs dependencies with pnpm's frozen lockfile and builds with `prisma migrate deploy && prisma generate && next build`. Pending committed migrations are applied to the target environment's database **before** Next.js compiles, so a failed migration fails the deploy and the previous build stays live.

### Environments and databases

Schema and data are isolated per environment using two Neon databases:

| Database | Connected Vercel environments | Purpose |
|---|---|---|
| `notyet-db` | Production | Live data |
| `notyet-db-dev` | Preview, Development | Demo data and schema-change testing; safe to reset |

Local `.env` targets the dev database, so `pnpm db:migrate` never touches production.

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection used by the Next.js runtime |
| `DIRECT_URL` | Direct (unpooled) connection used by Prisma CLI operations and `migrate deploy` |
| `DATABASE_SSL` | Optional; `false` disables SSL only for a local PostgreSQL without SSL |

### Migration workflow

Schema changes flow through committed migrations, not `prisma db push`:

1. Edit `prisma/schema.prisma`.
2. `pnpm db:migrate --name <change>` — generates a migration and applies it to the dev DB, validated against a shadow database.
3. Commit `prisma/migrations/<ts>_<name>/migration.sql`.
4. Deploy — `prisma migrate deploy` applies pending migrations to that environment's database.

`db:push` mutates the schema without a migration record and is not used in the normal workflow; it is only acceptable for a truly disposable scratch database.

## Runtime and Deployment Assumptions

- One trusted local user
- Two hosted databases: production (prod) and shared dev/preview
- No concurrent multi-user editing
- No authentication or authorization boundary
- Schema migrations are automated via committed files + `prisma migrate deploy` at build
- Active project execution is expected to move to an external task-management system

These assumptions keep v1 small. Authentication, shared deployment, synchronization, or concurrent writers would require explicit changes to storage, authorization, conflict handling, and operational design.

## Architectural Constraints

- WIP limits are currently presented by the UI, not enforced as database invariants.
- Polymorphic transition and relationship references are application-enforced.
- Core entities are separate tables rather than a shared entity supertype; generic features must account for all six models.
- PostgreSQL is configured through pooled and direct URLs so Prisma runtime connections and CLI schema operations use the appropriate endpoints.
- Server Actions couple mutations to the Next.js application, which is deliberate while no external API clients exist.

## Change Guidelines

- Keep product behavior aligned with [`SYSTEM.md`](SYSTEM.md).
- Put entity-specific persistence logic in the corresponding action module.
- Write state changes and transition records in one transaction.
- Prefer typed core relations when a relationship is part of the stable domain model.
- Use `Relationship` only for genuinely polymorphic or additional graph links.
- Treat demo reset behavior as destructive and keep it clearly separated from normal CRUD workflows.
- Update this document when changing system boundaries, persistence strategy, or cross-entity workflows.
