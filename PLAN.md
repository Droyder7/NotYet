# Signal-to-Commitment System — Implementation Plan

## 1. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 14** (App Router, TypeScript) |
| Database | **SQLite** via **Prisma ORM** |
| UI | **Tailwind CSS** + shadcn/ui components |
| Graph | **React Flow** |
| Forms | **React Hook Form** + Zod |
| Auth | None (local-only, single-user) |

## 2. Domain Model — 6 Core Entities

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **Signal** | Something noticed that may deserve attention | title, body, context |
| **Intent/Approach** | One possible direction for responding to a signal | approach, expectedChange, assumption |
| **Exploration** | Bounded investigation when unclear | unclearWhat, scope, budget, endDate, stoppingCondition, expectedOutput |
| **Experiment** | Bounded test to reduce uncertainty for a decision | decisionGoal, nextCommitment, criticalAssumption, testMethod, observableEvidence, budget, decisionDate |
| **ProjectCandidate** | Possible finite commitment, not yet activated | proposedOutcome, evidenceOfValue, primaryAlignment, acceptanceCriteria, constraints, roughEstimate, worthy, ready, now |
| **ActiveProject** | Finite, funded commitment with execution | desiredOutcome, acceptanceCriteria, primaryAlignment, deadline, currentMilestone, nextConcreteAction, majorDependency, projectSlot |

## 3. Supporting Types

### Attention States
`INBOX` → `ACTIVE` → `WAITING` → `DORMANT` → `CLOSED`

### Worthy/Ready/Now Assessment
`UNASSESSED` → `YES` or `NO`

### Transition Records
Every meaningful movement creates a record with: fromEntity, toEntity, fromType, toType, fromState, toState, reason, evidence, date. Implemented as a plain lookup table — entity IDs/types are data (no cross-table FKs), history fetched via `prisma.transition.findMany({ where: { OR: [{ toEntityId: id }, { fromEntityId: id }] } })`.

### Relationships
Graph relationships between entities: signal→intent, intent→exploration, etc. Also a plain lookup table (no FKs into entity tables).

## 4. App Structure

```
app/
├── layout.tsx              # Sidebar nav + header
├── page.tsx                # Dashboard (inbox + active items overview)
├── signals/                # Signal CRUD pages
├── intents/                # Intent CRUD pages
├── explorations/           # Exploration CRUD pages
├── experiments/            # Experiment CRUD pages
├── candidates/             # Project Candidate pages
├── projects/               # Active Project pages
├── graph/                  # Interactive relationship graph (React Flow)
└── review/
    ├── weekly/             # Guided weekly review
    └── monthly/            # Guided monthly portfolio review
```

## 5. Implementation Order

1. Scaffold Next.js + TypeScript + Tailwind + Prisma
2. Database schema + migrations
3. Prisma client + server actions
4. Shell layout with sidebar
5. Signal CRUD (quick capture)
6. Intent CRUD + relationship to signals
7. Exploration CRUD
8. Experiment CRUD
9. Project Candidate CRUD + Worthy/Ready/Now assessment
10. Active Project CRUD
11. Transition engine (smart buttons, WIP limits)
12. Dashboard with WIP limits
13. Graph visualization
14. Weekly review view
15. Monthly review view
16. Polish + responsive design
17. End-to-end testing

## 6. Design System

- Neutral grays with state-based color coding
- Inbox: gray, Active: green, Waiting: amber, Dormant: purple, Closed: dark gray
- Clean, minimal productivity aesthetic — calm decision-support tool
- Sidebar navigation, content area, detail panels

## 7. V1 Boundaries (per spec §18)

Does NOT include: detailed task management, calendar integration, habit tracking (streaks/reminders), goal-setting methodology, numerical scoring/AI, multi-user, advanced analytics.
