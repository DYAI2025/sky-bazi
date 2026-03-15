# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server on http://localhost:3002
npm run build      # Type-check + production build (tsc -b && vite build)
npm run preview    # Preview production build
npm run lint       # Type-check only (tsc --noEmit), no ESLint configured
```

No test runner is configured. All source lives under `sky-bazi/`.

## Environment

Copy `.env.example` to `.env.local`:
```
VITE_NASA_API_KEY=DEMO_KEY      # Free key at api.nasa.gov (DEMO_KEY = 30 req/hr, full key = 1000 req/hr)
VITE_BAZODIAC_URL=https://bazodiac.space
```

## Architecture

Single-page React 19 + TypeScript app, Vite 6, Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `tailwind.config.js`).

**Purpose:** Top-of-funnel landing page for [bazodiac.space](https://bazodiac.space). Shows real NASA data and live planet positions to drive users to the main Bazodiac app via `FunnelCta` components interspersed throughout the page.

### Routing (React Router DOM 7)

```
/                 → HomePage (linear funnel: Header → ApodHero → FunnelCta → SpaceWeather → FunnelCta → NearEarthObjects → ImpactRisks → PlanetPositions → FunnelCta → ArticleTeaser → Footer)
/artikel          → ArticlesPage (markdown article listing from content/articles/)
/artikel/:slug    → ArticlePage (single markdown article)
/erde             → EarthPage (NASA EPIC — live Earth from L1 point)
/mars-rover       → MarsRoverPage (Curiosity rover latest photos)
/*                → HomePage (404 fallback)
```

### Data flow

```
NASA APOD API       → fetchApod()               → ApodHero
NASA DONKI API      → fetchSpaceWeather()        → SpaceWeather (Kp index, flares, CMEs, storms)
NASA NEO API        → fetchNeoFeed()             → NearEarthObjects (asteroids)
JPL Sentry API      → fetchSentryData()          → ImpactRisks (impact probabilities)
NASA EPIC API       → fetchEpicLatest()          → EarthPage
NASA Mars Rover API → fetchMarsLatestPhotos()    → MarsRoverPage
astronomy-engine    → calculatePlanetPositions() → PlanetPositions (real-time)
```

### API caching layer (`src/services/nasa.ts`)

All NASA calls go through a `localStorage` cache (`sky:*` keys) with per-endpoint TTLs: APOD 12h, Weather 4h, NEO 12h, Sentry 24h, EPIC 4h, Mars 8h. Additional protections:
- **Rate-limit detection**: 429 responses trigger a 30-minute cooldown (`markRateLimited()` / `isRateLimited()`)
- **In-flight deduplication**: `fetchOnce()` prevents duplicate concurrent requests from multiple component mounts
- **Demo key awareness**: `IS_DEMO_KEY` flag enables rate-limit warnings in UI

### Vite dev proxy

`/api/sentry` proxies to `https://ssd-api.jpl.nasa.gov/sentry.api` to avoid CORS in development.

### Key files

| Path | Role |
|------|------|
| `src/lib/i18n.ts` | `useLang()` hook — de/en toggle, `t(key)` translation function |
| `src/lib/zodiac.ts` | Zodiac sign data + `signFromLongitude()` helper |
| `src/lib/parseArticle.ts` | Markdown frontmatter parser for article content |
| `src/services/nasa.ts` | All NASA/JPL API calls, localStorage cache, rate-limit handling |
| `src/services/planets.ts` | `astronomy-engine` wrappers for planet/sun/moon ecliptic positions |

### i18n

Default language is German (`"de"`). All UI strings live in `src/lib/i18n.ts` as a typed `translations` object. Components receive `t` as a prop and call `t("key")`. Language type: `Lang = "de" | "en"`.

### Component conventions

- Props interfaces named `ComponentNameProps`, always include `lang: Lang` and `t: (key: string) => string`
- `bazodiacUrl` prop flows from `App.tsx` (from env var) to funnel CTAs
- Styling: Tailwind v4 utilities + custom `.sky-*` classes defined in `src/index.css`

### Theming

Dark observatory aesthetic defined in `src/index.css`:
- Gold accent: `#D4AF37`, dark navy backgrounds: `#020509`–`#040c1f`, starlight text: `rgba(215, 230, 255, 0.92)`
- Custom classes: `.sky-card` (glassmorphism), `.sky-grain` (film grain overlay), `.sky-divider`, `.sky-skeleton`
- Fonts: Cormorant Garamond (serif/headings), Sora (sans/body)

### Content

Static markdown articles in `content/articles/` with frontmatter (title, description, date, slug). Rendered via `react-markdown` + `remark-gfm`.

### Deployment

Netlify (`public/_redirects` present). Build output: `dist/`. Custom domain via `CNAME`.
