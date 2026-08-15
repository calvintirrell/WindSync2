# WindSync2 — Progress

React/Vite/TypeScript rebuild of WindSync for native GitHub Pages hosting.
Local-only until the GitHub repo is created (planned URL: calvintirrell.github.io/windsync2).

## Phase plan

- [x] **P0 — Scaffold**: Vite + React 19 + TS + Tailwind 4, sidebar shell with 5 views, Vitest, Pages deploy workflow (inert until repo exists). 3 tests.
- [x] **P1 — Data layer**: Dexie schema (technicians/assets/workOrders/logs/notifications), seed ported verbatim from `database_setup.py` (Alex Ray, 3 turbines, 4 work orders), `ensureSeeded` on app start + `resetToSeed`. 6 tests total.
- [x] **P2 — Plan of Day**: active work orders w/ priority sort + filter checkboxes, suggested secondary task (haversine ≤10 mi, strictly lower priority), Leaflet/OSM map with priority-colored markers. Simulate buttons deferred to P4 (need notification store). 17 tests total.
- [ ] **P3 — Work Order Details**: checklist tap-to-log, AI diagnostic banner, tribal knowledge, photo/note logging (IndexedDB blobs).
- [ ] **P4 — Notifications**: store, priority queue, sidebar badge, notification center, toasts, demo simulate buttons, clear/reset.
- [ ] **P5 — Dashboards**: technician + manager views (Recharts).
- [ ] **P6 — Offline/PWA + polish**: service worker, installable, final pass.

Gate: tests green → update this file → commit → wait for approval before next phase.
