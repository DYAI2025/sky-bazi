# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server on http://localhost:3002
npm run build      # Type-check + production build (tsc -b && vite build)
npm run preview    # Preview production build
npm run lint       # Type-check only (tsc --noEmit), no ESLint configured
```

## Environment

Copy `.env.example` to `.env.local`:
```
VITE_NASA_API_KEY=DEMO_KEY      # Free key at api.nasa.gov (DEMO_KEY = 30 req/hr)
VITE_BAZODIAC_URL=https://bazodiac.space
```

## Architecture

Single-page React 19 + TypeScript app, Vite 6, Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `tailwind.config.js`).

**Purpose:** Top-of-funnel landing page for [bazodiac.space](https://bazodiac.space). Shows real NASA data and live planet positions to drive users to the main Bazodiac app.

### Data flow

```
NASA APOD API  ──►  fetchApod()          ──►  ApodHero
NASA DONKI API ──►  fetchSpaceWeather()  ──►  SpaceWeather
astronomy-engine   calculatePlanetPositions()
               ──►  calculateSunPosition()   ──►  PlanetPositions
               ──►  calculateMoonPosition()
```

Both NASA services use a `localStorage` cache layer (`sky:apod`, `sky:weather`) with TTLs (APOD: 6 h, weather: 1 h) to avoid hitting rate limits.

### Key files

| Path | Role |
|------|------|
| `src/lib/i18n.ts` | `useLang()` hook — de/en toggle, `t(key)` translation function |
| `src/lib/zodiac.ts` | Zodiac sign data + `signFromLongitude()` helper |
| `src/services/nasa.ts` | NASA APOD + DONKI API calls, localStorage cache, activity classifiers |
| `src/services/planets.ts` | `astronomy-engine` wrappers for planet/sun/moon positions |
| `src/App.tsx` | Layout: Header → ApodHero → FunnelCta (×3) → SpaceWeather → PlanetPositions → Footer |

### i18n

Default language is German (`"de"`). All UI strings live in `src/lib/i18n.ts` as a typed `translations` object. Pass `t` down as a prop; components call `t("key")`.

### Funnel CTAs

`FunnelCta` appears three times in the page with two variants (`default` and `weather`). Both link to `VITE_BAZODIAC_URL`. The `bazodiacUrl` prop flows down from `App.tsx` via the env var.
