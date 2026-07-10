# Festival Wristband 🎟️

Your personal, offline-first companion for **every** festival you go to — one wristband for all of them.

Track countdowns, packing checklists, budgets, weather, timetables and memories across
multiple festivals. Each festival injects **its own accent color** into the whole UI when
you open it (blood red for Hellfest, violet for Tomorrowland, green for Solidays…), and the
one that's happening *today* takes over the app with a live banner and a pulsing map dot.

No account. No backend. Everything lives in your browser's `localStorage` and can be
exported / imported as JSON. Installable as a PWA and works offline (except live weather
and map tiles, which need the network).

## Features

- **Dashboard** — live-festival banner, next-up countdown, and global stats (festivals attended, countries, km traveled).
- **Festivals** — all your festivals as RFID-style **wristband chips**, filterable by status and type.
- **Festival hub** — per festival: Overview, Checklist, Budget, Weather, Timetable and Notes tabs.
- **Map** — a dark full-screen map with a glowing dot per festival; the live one pulses.
- **History** — a vertical timeline of festivals you've attended, with ratings and journal excerpts.
- **Settings** — JSON export/import, language toggle (🇫🇷/🇬🇧), full reset.

## Design

Dark theme only, editorial bold-uppercase typography, festival-night energy. The accent color
is a single CSS variable (`--color-accent`) swapped at runtime per active/viewed festival; a
contrast-aware `--color-on-accent` keeps buttons legible on any color. Mobile-first, with a
centered phone frame on desktop.

## Tech stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · React Router 7 (HashRouter) ·
react-i18next (FR default / EN) · Leaflet + CartoDB dark tiles · Open-Meteo (weather) ·
manual service worker PWA. No auth, no database.

## Getting started

```bash
npm install
npm run dev        # dev server
npm run build      # type-check + production build + inject SW precache list
npm run preview    # preview the production build
npm run test       # unit tests (vitest)
npm run lint       # eslint
npm run icons      # regenerate PWA icons + favicon from public/icon-source.png
```

## Data model

A single `localStorage` key (`festival-wristband-data`) holds `{ version, festivals[] }`.
The app starts empty on first run — you add your own festivals.
See [`src/lib/types.ts`](src/lib/types.ts) for the full `Festival` shape (dates, location,
type, accentColor, genres, rating, checklist, budget, timetable, note journal…).

### Importing a timetable

The Timetable tab accepts a JSON array of sets:

```json
[
  { "artist": "…", "stage": "…", "day": "2026-06-19", "startTime": "21:00", "endTime": "22:30" }
]
```

Overlapping sets on the same day are flagged as conflicts automatically.

## Deployment

Configured for GitHub Pages under the `/festival-wristband/` base path. Pushing to `main`
triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## License

MIT © 2026 Aurélien Moote
