# Signal-to-Commitment System (S2C)

A local-first web app implementing the Signal-to-Commitment System: a personal pipeline that turns raw signals (hunches, frustrations, ideas) into bounded intents, explorations, and experiments — and only then into active projects. Based on the spec in [`system-v1.md`](system-v1.md).

The core idea: **attention is finite, so the pipeline enforces limits.** Every entity has an attention state, cheap rejection is a first-class outcome, and nothing becomes a project without passing a Worthy/Ready/Now assessment.

## The Pipeline

```
Signal → Intent → Exploration → Experiment → ProjectCandidate → ActiveProject
  (capture)  (approach)  (reduce uncertainty)  (test)  (assess WRN)  (commit)
```

Every step is optional and every movement writes a transition record with reason and evidence. Full detail: `system-v1.md`.

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

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite · React Flow (graph view) · Server Actions for mutations · pnpm

Local-only, single user, no auth.

## Getting started

```bash
pnpm install
pnpm approve-builds --all   # allow prisma/tsx postinstall scripts
pnpm db:push                # create SQLite schema (prisma/dev.db)
pnpm db:seed                # load the demo dataset (optional but recommended)
pnpm dev                    # http://localhost:3000
```

### Useful scripts
| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm db:push` | Sync schema to SQLite |
| `pnpm db:seed` | Load demo data (idempotent-ish: clears first) |
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

## Demo data

The seed tells six stories across the pipeline: a full signal→project chain (voice-capture app), a career exploration in progress, a cheap rejection, a waiting experiment, an unprocessed inbox signal, and direct-entry candidates. Load it from the dashboard banner or `pnpm db:seed`; clear it from the same banner.

## Project layout

```
prisma/schema.prisma   # 6 entity models + Transition/Relationship lookup tables
src/
  app/                 # App Router pages (list/detail/new per entity, graph, reviews)
  components/          # Forms, state buttons, graph, demo banner
  lib/                 # *-actions.ts server actions per entity, demo-data.ts, db.ts
scripts/seed.ts        # CLI seeding
system-v1.md           # The spec this implements
PLAN.md                # Build plan / design decisions
```

**Schema note:** `Transition` and `Relationship` are plain log tables — entity IDs/types are stored as data with no cross-table foreign keys, and history is fetched with direct queries. This keeps the graph flexible (and is why `db:push` constraints can't block seeding).
