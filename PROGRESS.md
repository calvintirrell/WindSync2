# WindSync2 — Progress

React/Vite/TypeScript rebuild of WindSync for native GitHub Pages hosting.
Local-only until the GitHub repo is created (planned URL: calvintirrell.github.io/windsync2).

## Phase plan

- [x] **P0 — Scaffold**: Vite + React 19 + TS + Tailwind 4, sidebar shell with 5 views, Vitest, Pages deploy workflow (inert until repo exists). 3 tests.
- [ ] **P1 — Data layer**: IndexedDB (Dexie) schema, seed data ported from `database_setup.py`, reset-to-seed.
- [ ] **P2 — Plan of Day**: work order list w/ priority sort+filter, proximity grouping (haversine), Leaflet/OpenStreetMap map.
- [ ] **P3 — Work Order Details**: checklist tap-to-log, AI diagnostic banner, tribal knowledge, photo/note logging (IndexedDB blobs).
- [ ] **P4 — Notifications**: store, priority queue, sidebar badge, notification center, toasts, demo simulate buttons, clear/reset.
- [ ] **P5 — Dashboards**: technician + manager views (Recharts).
- [ ] **P6 — Offline/PWA + polish**: service worker, installable, final pass.

Gate: tests green → update this file → commit → wait for approval before next phase.
