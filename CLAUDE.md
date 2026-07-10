# Festival Wristband

## Project overview

A personal, single-user, offline-first companion for **multiple** festivals. No auth, no
backend — all data in `localStorage`, fully export/importable as JSON. Installable PWA.

Shares its foundation (build tooling, PWA service worker, i18n setup, phone-frame layout,
`@theme` token system) with the sibling `defqon-companion` project, but is festival-agnostic
and single-user: Firebase/Auth are replaced by a `localStorage` context.

## Tech stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 8
- **Styling**: Tailwind CSS 4 (`@tailwindcss/vite`, tokens in `@theme` in `src/index.css`)
- **Routing**: React Router 7 (`HashRouter`, lazy pages)
- **i18n**: react-i18next — **French default**, English translation
- **Map**: Leaflet (used directly, no react-leaflet) + CartoDB dark tiles
- **Weather**: Open-Meteo (no key)
- **Storage**: `localStorage` (key `festival-wristband-data`)
- **Offline**: manual service worker (`public/sw.js`, precache list injected at build)

## Project structure

```
src/
  components/        # WristbandChip, FestivalCard, MapView, CountdownTimer, StatTile,
                     # RatingStars, StatusBadge, PageShell, BottomNav, Icons, LanguageToggle
    tabs/            # Overview/Checklist/Budget/Weather/Timetable/Notes tabs
  contexts/          # FestivalsContext (localStorage CRUD, export/import, active detection)
  data/              # checklistTemplates.ts (camping/day/urban packing templates)
  lib/               # types, storage, accent (dynamic color), geo (km), festival (status/dates), format
  pages/             # Dashboard, FestivalList, FestivalForm, FestivalDetail, Map, History, Settings
  i18n/              # en.json, fr.json, index.ts
  test/              # vitest unit + boot tests
public/              # manifest, sw.js, icons, favicon
```

## Key commands

```bash
npm run dev      # dev server
npm run build    # tsc -b && vite build && inject SW precache
npm run test     # vitest
npm run lint     # eslint
npm run icons    # regenerate PWA PNG icons + favicon from public/icon-source.png (needs sharp)
```

## Architecture decisions

- **Dynamic accent** — `--color-accent` (+ contrast-aware `--color-on-accent`) is overridden
  on `:root` at runtime via `lib/accent.ts`. Tailwind 4 compiles `bg-accent/10` etc. to
  `color-mix` on the variable, so every tint tracks the override. The active festival sets the
  global base (in `FestivalsContext`); `FestivalDetail` and `FestivalForm` temporarily override
  to their own color and restore on unmount. Individual `WristbandChip`s use their *own*
  `accentColor` inline so they keep identity inside a list.
- **Active festival** — the festival whose date range contains today. Drives the home banner,
  the global accent, and the pulsing map dot.
- **No sample data** — the app starts empty; the user adds their own festivals. (There is no
  seed; earlier demo data was removed at the owner's request.)
- **Leaflet** used directly with `divIcon` glowing dots (avoids react-leaflet peer friction and
  the broken-default-marker asset problem). Map popups navigate via `#/festivals/:id` hash links.
- **Graceful degradation** — everything works offline except live weather (Open-Meteo) and map
  tiles (CartoDB).
- **React 19 lint rules** — no synchronous `setState` in effect bodies and no impure calls
  (`Date.now()`/`new Date()`) directly in render. Time-relative values go through helpers in
  `lib/festival.ts` or are initialized from props.

## Conventions

- All documentation in English.
- Component files PascalCase; data/lib files camelCase.
- Translations: nested JSON keys; **English is the source of truth for structure, French is default at runtime**. Every UI string must be translated — no hardcoded FR/EN in JSX.
- Colors use the semantic `--color-*` tokens (`surface`, `surface-card`, `border`,
  `text-primary/secondary/muted`, `accent`, `on-accent`).
- Mobile-first and ergonomics-first (generous tap targets, thumb-reachable bottom nav and
  primary actions, sticky tab bars) — the app is used mostly on phones.
```
