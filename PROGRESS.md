# WindSync2 — Progress

React/Vite/TypeScript rebuild of WindSync for native GitHub Pages hosting.
Local-only until the GitHub repo is created (planned URL: calvintirrell.github.io/windsync2).

## Phase plan

- [x] **P0 — Scaffold**: Vite + React 19 + TS + Tailwind 4, sidebar shell with 5 views, Vitest, Pages deploy workflow (inert until repo exists). 3 tests.
- [x] **P1 — Data layer**: Dexie schema (technicians/assets/workOrders/logs/notifications), seed ported verbatim from `database_setup.py` (Alex Ray, 3 turbines, 4 work orders), `ensureSeeded` on app start + `resetToSeed`. 6 tests total.
- [x] **P2 — Plan of Day**: active work orders w/ priority sort + filter checkboxes, suggested secondary task (haversine ≤10 mi, strictly lower priority), Leaflet/OSM map with priority-colored markers. Simulate buttons deferred to P4 (need notification store). 17 tests total.
- [x] **P3 — Work Order Details**: selector, AI diagnostic banner (+ create-notification button), tribal knowledge, tap-to-log checklist (log-once, derived from logs table), completion notification, custom note/photo logging (Blob in IndexedDB), activity log. Toaster component + `createNotification` helper. 25 tests total.
- [x] **P4 — Notifications**: center view (metrics, quick actions, priority/read filters, accent-colored cards, mark-read/acknowledge), sidebar unread badge + critical alert list + "Clear Logs & Notifications" reset, simulate buttons on Plan of Day. 39 tests total.
- [x] **P5 — Dashboards**: technician metrics + priority bar chart (single hue, live-updating), manager cost-savings grouped bar chart (validated CVD-safe pair `#c2410c`/`#0284c7`, legend + tooltips + table fallback), emergency broadcast + shift update controls. Shared Metric component. 45 tests total.
  - P6 note: bundle is 251 kB gzip in one chunk — consider React.lazy for recharts/leaflet views.
- [x] **P6 — Offline/PWA + polish**: vite-plugin-pwa (autoUpdate SW, 23 precached entries, OSM tile runtime cache), manifest + generated icon set (192/512/maskable/apple-touch/favicon), lazy-loaded views (first paint 95 kB gzip, was 251), real README, meta/theme-color. Verified serving at /windsync2/ subpath via `vite preview`. 45 tests.

All build phases complete. Remaining: create GitHub repo `windsync2`, push, enable Pages (Actions source) → live at calvintirrell.github.io/windsync2.

Gate: tests green → update this file → commit → wait for approval before next phase.
