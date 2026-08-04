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
cp .env.example .env         # fill DATABASE_URL and DIRECT_URL
pnpm install
pnpm approve-builds --all    # allow prisma/tsx postinstall scripts
pnpm db:push                 # create the PostgreSQL schema
pnpm db:seed                 # load the demo dataset (optional but recommended)
pnpm dev                     # http://localhost:3000
```

### Useful scripts
| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm db:push` | Sync schema to the configured PostgreSQL database |
| `pnpm db:migrate` | Create and apply a development migration |
| `pnpm db:deploy` | Apply committed migrations in production |
| `pnpm db:seed` | Load demo data (destructive: clears first) |
| `pnpm db:studio` | Prisma Studio DB browser |
| `pnpm lint` | ESLint |

## App map

| Route | Purpose |
|---|---|
| `/` | Dashboard — WIP limits, active items, demo banner |
| `/signals` `/intents` `/explorations` `/experiments` `/candidates` `/projects` | List + detail pages with state buttons & transition history |
| `/graph` | Interactive relationship graph (React Flow) |
| `/review/weekly` | Guided weekly review (states, stale items) |
| `/review/monthly` | Guided monthly review (closed/archived, patterns) |

## Vercel deployment

1. Create a persistent PostgreSQL database, such as Vercel Postgres.
2. Configure these Vercel environment variables for Production and Preview:
   - `DATABASE_URL`: pooled PostgreSQL connection string used by the application
   - `DIRECT_URL`: direct PostgreSQL connection string used by Prisma schema operations
   - `DATABASE_SSL`: leave as `true` for hosted PostgreSQL; set to `false` only for local PostgreSQL without SSL
3. Deploy the repository. `vercel.json` runs `pnpm install --frozen-lockfile`, `prisma generate`, and `next build`.
4. Apply the schema to the production database before opening the app:

```bash
DATABASE_URL="<production pooled URL>" DIRECT_URL="<production direct URL>" pnpm db:push
```

Do not run `pnpm db:seed` against a database containing real data; seeding is destructive.

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

**Schema note:** `Transition` and `Relationship` are plain log tables — entity IDs/types are stored as data with no cross-table foreign keys, and history is fetched with direct queries. This keeps the graph flexible (and is why `db:push` constraints can't block seeding).
