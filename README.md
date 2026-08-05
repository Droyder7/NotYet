# NotYet

A local-first web app implementing the Signal-to-Commitment System: a personal pipeline that turns raw signals (hunches, frustrations, ideas) into bounded intents, explorations, and experiments — and only then into active projects. Based on the spec in [`docs/SYSTEM.md`](docs/SYSTEM.md).

The name is the operating rule (spec §3.4): **the default is "not now."** Not everything deserves your attention today — NotYet helps you hold signals cheaply until evidence says otherwise.

The core idea: **attention is finite, so the pipeline enforces limits.** Every entity has an attention state, cheap rejection is a first-class outcome, and nothing becomes a project without passing a Worthy/Ready/Now assessment.

## The Pipeline

```
Signal → Intent → Exploration → Experiment → ProjectCandidate → ActiveProject
  (capture)  (approach)  (reduce uncertainty)  (test)  (assess WRN)  (commit)
```

Every step is optional and every movement writes a transition record with reason and evidence. Full detail: [`docs/SYSTEM.md`](docs/SYSTEM.md).

### The six entities
| Entity | Question it answers |
|---|---|
| **Signal** | What caught my attention? |
| **Intent** | What might I do about it, and what do I expect to change? |
| **Exploration** | What do I need to understand before acting? (time-budgeted) |
| **Experiment** | What's the cheapest test of the critical assumption? |
| **ProjectCandidate** | Worthy? Ready? Now? (with reasons) |
| **ActiveProject** | Committed work — max 1 major + 2 minor |

States: `INBOX → ACTIVE → WAITING → DORMANT → CLOSED`

## Stack

Next.js 15.5 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL · React Flow (graph view) · Server Actions for mutations · pnpm

Single user, no auth. The app is deployable to Vercel with a hosted PostgreSQL database.

## Getting started

```bash
cp .env.example .env         # fill DATABASE_URL and DIRECT_URL (point at your dev DB)
pnpm install
pnpm approve-builds --all    # allow prisma/tsx postinstall scripts
pnpm db:migrate              # apply committed migrations to the dev database
pnpm db:seed                 # load the demo dataset (optional but recommended)
pnpm dev                     # http://localhost:3000
```

### Useful scripts
| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve (build runs `prisma migrate deploy`) |
| `pnpm db:migrate` | Create + apply a migration against the dev DB (`prisma migrate dev`) |
| `pnpm db:deploy` | Apply committed migrations to the DB in `.env` (`prisma migrate deploy`) |
| `pnpm db:status` | Show applied/pending migration state |
| `pnpm db:seed` | Load demo data (destructive: clears first) |
| `pnpm db:studio` | Prisma Studio DB browser |
| `pnpm lint` | ESLint |

### Schema workflow

Schema changes flow through **migrations**, not `db push`:

1. Edit `prisma/schema.prisma`.
2. `pnpm db:migrate --name describe_change` — generates a migration and applies it to the **dev** DB (validated against a shadow database).
3. Commit the new folder under `prisma/migrations/`.
4. Deploy — the build runs `prisma migrate deploy`, which applies pending migrations to that environment's database.

Never use `db:push` on a database you care about; it mutates the schema without a migration record and breaks history.

## App map

| Route | Purpose |
|---|---|
| `/` | Dashboard — WIP limits, active items, demo banner |
| `/signals` `/intents` `/explorations` `/experiments` `/candidates` `/projects` | List + detail pages with state buttons & transition history |
| `/graph` | Interactive relationship graph (React Flow) |
| `/review/weekly` | Guided weekly review (states, stale items) |
| `/review/monthly` | Guided monthly review (closed/archived, patterns) |

## Vercel deployment

The project uses **two Neon databases** to isolate environments:

| Database | Vercel environments | Purpose |
|---|---|---|
| `notyet-db` | **Production** | Live data |
| `notyet-db-dev` | **Preview, Development** | Schema testing + demo data, safe to reset |

Local `.env` points at the dev database (`DATABASE_URL` pooled, `DIRECT_URL` unpooled direct connection, `DATABASE_SSL=true`).

### Setup
1. Provision both databases via the Neon marketplace integration, connecting `notyet-db` to **production** and `notyet-db-dev` to **preview** + **development**. The integration injects `DATABASE_URL`/`DATABASE_URL_UNPOOLED` automatically; set `DIRECT_URL` (the unpooled URL) per environment so Prisma CLI migrations use a direct connection.
2. Commit migrations to git (see Schema workflow above).
3. Deploy. `vercel.json` runs `pnpm install --frozen-lockfile` and `prisma migrate deploy && prisma generate && next build` — pending migrations apply to that environment's database **before** the app builds.

Do not run `pnpm db:seed` against the production database; seeding is destructive and loads demo content.

## Demo data

The seed tells six stories across the pipeline: a full signal→project chain (voice-capture app), a career exploration in progress, a cheap rejection, a waiting experiment, an unprocessed inbox signal, and direct-entry candidates. Load it from the dashboard banner or `pnpm db:seed`; clear it from the same banner.

## Project layout

```
prisma/schema.prisma   # 6 entity models + Transition/Relationship lookup tables
vercel.json            # Vercel install/build configuration
.env.example           # Required database environment variables
src/
  app/                 # App Router pages (list/detail/new per entity, graph, reviews)
  components/          # Forms, state buttons, graph, demo banner
  lib/                 # *-actions.ts server actions per entity, demo-data.ts, db.ts
scripts/seed.ts        # CLI seeding
docs/
  SYSTEM.md            # The source specification
  ARCHITECTURE.md      # Current system design and constraints
  ROADMAP.md           # Current features and future direction
```

**Schema note:** `Transition` and `Relationship` are plain log tables — entity IDs/types are stored as data with no cross-table foreign keys, and history is fetched with direct queries. This keeps the graph flexible.
