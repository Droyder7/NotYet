# Roadmap

Status of the Signal-to-Commitment System app: what's built, what's planned next, and what's possible but unplanned. The authority on scope is `system-v1.md` §18 (Version 1 boundaries).

## ✅ Implemented (current state)

**Core pipeline (spec §2, §16)**
- 6 entities with full CRUD: Signal, Intent, Exploration, Experiment, ProjectCandidate, ActiveProject
- Attention-state machine `INBOX → ACTIVE → WAITING → DORMANT → CLOSED` on every entity, with state-change buttons
- Transition records for every meaningful movement (spec §17): from/to entity + state, reason, evidence, date — shown as history on detail pages
- Worthy/Ready/Now assessment with reasons (spec §6); `activateCandidate` creates an ActiveProject from a passing candidate
- Parent→child linkage along the pipeline (signal→intent, intent→exploration/experiment, etc.) and direct entry at any stage

**Views & reviews (spec §14, §15)**
- Dashboard with WIP-limit indicators (explorations, experiments, project slots 1 major + 2 minor)
- List + detail pages for all entities; state-filtered lists
- Interactive relationship graph at `/graph` (React Flow)
- Guided weekly review (`/review/weekly`) and monthly review (`/review/monthly`)

**Demo & tooling**
- Demo dataset: six stories covering the full chain, cheap rejection, waiting/dormant states, direct entry — via dashboard banner or `pnpm db:seed`
- Local SQLite + Prisma schema; pnpm scripts for db push/seed/studio

## 🔜 Planned next (v1 polish — still within spec §18 "Included")

- [ ] **WIP-limit enforcement** — dashboard currently *shows* over-limit; make activation/stage-advancement block (with override + reason) when at limit
- [ ] **Deadline & staleness surfacing** — experiment decision dates and exploration end dates highlighted on dashboard/weekly review when due or stale
- [ ] **Dashboard over-limit prominence** — make breach states loud, not just numeric
- [ ] **Experiment decision outcomes** — Continue/Change/Stop/Hold with reasoning captured at decision time (spec §5)
- [ ] **Search & filtering** — by title, state, date across each list
- [ ] Edit forms for all entities (currently create + state transitions; in-place edit of fields)
- [ ] Better empty states and form validation messages

## 📋 Deferred by spec (v2+ candidates, from §18 "Deferred to later versions")

These are intentionally out of v1 scope but are the natural next versions:

- Goal & life-area entities with alignment links (spec §7, §8) — schema has `primaryAlignment` as a string field only
- Detailed project task management / milestone & dependency planning
- Calendar & scheduling integration
- Detailed habit tracking, streaks, reminders, behavioural analytics
- Complete goal-setting methodology; automatic numerical scoring
- Capacity forecasting; energy-based workload planning
- Portfolio simulations; advanced analytics & performance metrics
- Team collaboration / multi-user ownership
- Full execution dashboards

> Spec note: v1 should decide **what deserves commitment** and hand execution to an existing task-management system — most "deferred" items should stay deferred unless that handoff proves painful.

## 💡 Unplanned possibilities (not in spec — ideas only)

Ideas worth considering but with no commitment or design yet:

- Quick-capture: keyboard shortcut / global hotkey or share-sheet target for zero-friction signal entry (spec §3.1 makes capture cheapness a principle)
- Export/backup: JSON dump of the DB; Markdown export of an entity + its history
- Soft-archive view: browse CLOSED/dormant items with resurrection path (spec §13 archive semantics)
- Transition timeline visualization per entity (vs. the current list)
- Light analytics derived from transition history (time-in-state, cheap-rejection rate) — **note:** spec explicitly defers "Advanced analytics", so keep this minimal
- Notifications/nudges for decision dates (local only)
- An "inbox zero" clarifier flow: step through INBOX signals one at a time

---

Legend: ✅ done · 🔜 planned short-term · 📋 spec-deferred long-term · 💡 unplanned idea. Item order within sections is loose priority, top = sooner/more valuable.
