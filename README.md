# WindSync

A field maintenance management web app for wind farm technicians — view work orders, log task progress, and receive priority-based notifications. Rebuilt as a fully client-side React SPA so it runs on GitHub Pages with no backend, works offline, and installs to a phone home screen as a PWA.

This is a static rebuild of [windsync](https://github.com/calvintirrell/windsync) (Python/Streamlit). All data lives in the browser via IndexedDB — every visitor gets their own isolated demo data, seeded on first visit.

## Features

- **Plan of Day** — assigned work orders with priority sort/filter, suggested secondary tasks (nearby lower-priority jobs within 10 miles), and a Leaflet/OpenStreetMap site map
- **Work Order Details** — AI-powered fault diagnostics, tribal knowledge notes, tap-to-log checklist, and photo/text logging (photos stored as IndexedDB blobs)
- **Technician Dashboard** — personal metrics and task-completion chart
- **Manager Dashboard** — downtime cost-savings analytics and broadcast notification controls
- **Notifications** — priority-based alerts (Critical / High / Medium / Low) with read/acknowledge state, sidebar badge, and a notification center
- **Offline-first** — service worker precaches the app; previously viewed map tiles are cached. Installable as a PWA.

## Stack

Vite · React 19 · TypeScript · Tailwind 4 · Dexie (IndexedDB) · Leaflet · Recharts · Vitest

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # run the test suite (Vitest)
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

## Deployment

Pushing to `main` runs the GitHub Actions workflow (`.github/workflows/deploy.yml`): tests → build → deploy to GitHub Pages. The Vite `base` is `/windsync2/`.

## Demo controls

- Sidebar → **Clear Logs & Notifications** resets logs/notifications and restores the seeded work orders
- Plan of Day → simulate a high-wind safety alert or a work order priority change
- Manager Dashboard → send an emergency broadcast or shift update
