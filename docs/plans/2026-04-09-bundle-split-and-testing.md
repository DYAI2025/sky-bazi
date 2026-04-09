# Bundle-Split & Testing Infrastructure — Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce main chunk from 517 kB to <300 kB via `React.lazy()` and establish a Vitest + React Testing Library baseline covering the service layer and critical components.

**Architecture:** Route-level code splitting for all pages (already behind React Router), and component-level lazy loading for below-the-fold homepage sections (ISS, Asteroids, Impact, Planets, Articles). Tests cover the NASA service cache/rate-limit logic (pure functions, no network) and the ErrorBoundary (renders correctly on throw).

**Tech Stack:** Vitest 3, @testing-library/react, @testing-library/jest-dom, happy-dom, React.lazy + Suspense

---

## Phase 1: Testing Infrastructure (Tasks 1–7)

### Task 1: Install test dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install**

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom happy-dom
```

**Step 2: Verify install succeeded**

```bash
npx vitest --version
```

Expected: prints version number, no errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add vitest + react testing library"
```

---

### Task 2: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `"test"` script)
- Create: `src/test/setup.ts`

**Step 1: Create Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

**Step 2: Create test setup file**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

**Step 3: Add test script to package.json**

Add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 4: Run test command (expect zero tests found)**

```bash
npm test
```

Expected: "No test files found" or similar — no errors.

**Step 5: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json
git commit -m "chore: configure vitest with happy-dom"
```

---

### Task 3: Test NASA cache layer (pure functions)

**Files:**
- Create: `src/services/nasa.test.ts`

These tests target the `getCached` / `setCache` / `isRateLimited` / `markRateLimited` logic.
The functions are currently module-private. We'll export them for testability.

**Step 1: Export cache helpers**

Modify `src/services/nasa.ts` — add `export` to the four cache/rate-limit functions:

```ts
export function getCached<T>(key: string, ttlMs: number): T | null {
// ... existing code unchanged
```

```ts
export function setCache<T>(key: string, data: T): void {
// ... existing code unchanged
```

```ts
export function isRateLimited(cacheKey: string): boolean {
// ... existing code unchanged
```

```ts
export function markRateLimited(cacheKey: string): void {
// ... existing code unchanged
```

**Step 2: Write failing tests**

Create `src/services/nasa.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCached, setCache, isRateLimited, markRateLimited } from "./nasa";

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  length: 0,
  key: () => null,
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("NASA cache layer", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  describe("getCached / setCache", () => {
    it("returns null when cache is empty", () => {
      expect(getCached("test", 60_000)).toBeNull();
    });

    it("returns cached data within TTL", () => {
      setCache("test", { hello: "world" });
      expect(getCached<{ hello: string }>("test", 60_000)).toEqual({ hello: "world" });
    });

    it("returns null when TTL expired", () => {
      setCache("test", { hello: "world" });
      // Fast-forward 2 minutes
      const raw = JSON.parse(store["sky:test"]);
      raw.timestamp = Date.now() - 120_000;
      store["sky:test"] = JSON.stringify(raw);
      expect(getCached("test", 60_000)).toBeNull();
    });

    it("handles corrupt localStorage gracefully", () => {
      store["sky:broken"] = "not-json{{{";
      expect(getCached("broken", 60_000)).toBeNull();
    });
  });

  describe("rate limiting", () => {
    it("is not rate-limited by default", () => {
      expect(isRateLimited("apod")).toBe(false);
    });

    it("is rate-limited after markRateLimited", () => {
      markRateLimited("apod");
      expect(isRateLimited("apod")).toBe(true);
    });

    it("rate limit expires after TTL", () => {
      markRateLimited("apod");
      // Fast-forward 31 minutes
      const raw = JSON.parse(store["sky:rl:apod"]);
      raw.timestamp = Date.now() - 31 * 60 * 1000;
      store["sky:rl:apod"] = JSON.stringify(raw);
      expect(isRateLimited("apod")).toBe(false);
    });
  });
});
```

**Step 3: Run tests — expect PASS**

```bash
npm test
```

Expected: 6 tests, all PASS.

**Step 4: Commit**

```bash
git add src/services/nasa.ts src/services/nasa.test.ts
git commit -m "test: add unit tests for NASA cache/rate-limit layer"
```

---

### Task 4: Test ErrorBoundary component

**Files:**
- Create: `src/components/ErrorBoundary.test.tsx`

**Step 1: Write test**

Create `src/components/ErrorBoundary.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary, NASAApiErrorBoundary } from "./ErrorBoundary";

// A component that always throws
function Bomb(): JSX.Element {
  throw new Error("Kaboom!");
}

// Suppress console.error from React during expected throws
const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/NASA-Daten temporär nicht verfügbar/)).toBeInTheDocument();
    expect(screen.getByText(/Erneut versuchen/)).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });
});

describe("NASAApiErrorBoundary", () => {
  it("shows API name in fallback when child throws", () => {
    render(
      <NASAApiErrorBoundary apiName="ISS Tracker">
        <Bomb />
      </NASAApiErrorBoundary>,
    );
    expect(screen.getByText(/ISS Tracker ist momentan nicht verfügbar/)).toBeInTheDocument();
  });
});
```

**Step 2: Run tests**

```bash
npm test
```

Expected: 4 new tests PASS (10 total).

**Step 3: Commit**

```bash
git add src/components/ErrorBoundary.test.tsx
git commit -m "test: add ErrorBoundary rendering tests"
```

---

### Task 5: Test DailySpaceFacts (pure logic + render)

**Files:**
- Create: `src/components/DailySpaceFacts.test.tsx`

**Step 1: Write test**

Create `src/components/DailySpaceFacts.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DailySpaceFacts } from "./DailySpaceFacts";

// Minimal t() stub that returns the key — verifies i18n keys are used
const t = (key: string) => key;

describe("DailySpaceFacts", () => {
  it("renders the section with i18n keys (not hardcoded strings)", () => {
    render(<DailySpaceFacts lang="de" t={t} />);
    // The title should be the i18n key, not a hardcoded German string
    expect(screen.getByText("facts.title")).toBeInTheDocument();
    expect(screen.getByText("facts.subtitle")).toBeInTheDocument();
  });

  it("renders exactly 3 pagination dots", () => {
    render(<DailySpaceFacts lang="en" t={t} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3);
  });

  it("displays a source for the current fact", () => {
    render(<DailySpaceFacts lang="de" t={t} />);
    // Source label should be the i18n key
    expect(screen.getByText(/facts\.source/)).toBeInTheDocument();
  });
});
```

**Step 2: Run tests**

```bash
npm test
```

Expected: 3 new tests PASS (13 total).

**Step 3: Commit**

```bash
git add src/components/DailySpaceFacts.test.tsx
git commit -m "test: add DailySpaceFacts render tests"
```

---

### Task 6: Test i18n hook

**Files:**
- Create: `src/lib/i18n.test.ts`

**Step 1: Write test**

Create `src/lib/i18n.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLang } from "./i18n";

// Mock localStorage
const store: Record<string, string> = {};
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    length: 0,
    key: () => null,
  },
});

describe("useLang", () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
  });

  it("defaults to 'de'", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current.lang).toBe("de");
  });

  it("t() returns German string by default", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current.t("nav.ring")).toBe("Deine Signatur");
  });

  it("switches to English", () => {
    const { result } = renderHook(() => useLang());
    act(() => result.current.setLang("en"));
    expect(result.current.lang).toBe("en");
    expect(result.current.t("nav.ring")).toBe("Your Signature");
  });

  it("returns the key for unknown translations", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current.t("nonexistent.key")).toBe("nonexistent.key");
  });

  it("translates ISS keys (verifies new keys exist)", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current.t("iss.title")).toBe("ISS Live-Position");
    act(() => result.current.setLang("en"));
    expect(result.current.t("iss.title")).toBe("ISS Live Position");
  });

  it("translates Facts keys (verifies new keys exist)", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current.t("facts.solar.title")).toBe("Die Sonne als Fusionsreaktor");
    act(() => result.current.setLang("en"));
    expect(result.current.t("facts.solar.title")).toBe("The Sun as a Fusion Reactor");
  });
});
```

**Step 2: Run tests**

```bash
npm test
```

Expected: 6 new tests PASS (19 total).

**Step 3: Commit**

```bash
git add src/lib/i18n.test.ts
git commit -m "test: add i18n hook tests including ISS + Facts keys"
```

---

### Task 7: Add test to CI script

**Files:**
- Modify: `package.json`

**Step 1: Update build script to include type-check + test**

In `package.json`, add:

```json
"ci": "tsc --noEmit && vitest run && vite build"
```

**Step 2: Run it**

```bash
npm run ci
```

Expected: type-check ✅, tests ✅, build ✅.

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add ci script (lint + test + build)"
```

---

## Phase 2: Bundle Splitting (Tasks 8–11)

### Task 8: Lazy-load route pages

**Files:**
- Modify: `src/App.tsx`

**Step 1: Replace static page imports with React.lazy**

At the top of `src/App.tsx`, replace the page imports:

```tsx
// REMOVE these static imports:
// import { ArticlesPage } from "./pages/ArticlesPage";
// import { ArticlePage } from "./pages/ArticlePage";
// import { EarthPage } from "./pages/EarthPage";
// import { MarsRoverPage } from "./pages/MarsRoverPage";
// import { ImpressumPage } from "./pages/ImpressumPage";
// import { DatenschutzPage } from "./pages/DatenschutzPage";
// import { NotFoundPage } from "./pages/NotFoundPage";

// ADD lazy imports:
import { lazy, Suspense } from "react";

const ArticlesPage = lazy(() => import("./pages/ArticlesPage").then(m => ({ default: m.ArticlesPage })));
const ArticlePage = lazy(() => import("./pages/ArticlePage").then(m => ({ default: m.ArticlePage })));
const EarthPage = lazy(() => import("./pages/EarthPage").then(m => ({ default: m.EarthPage })));
const MarsRoverPage = lazy(() => import("./pages/MarsRoverPage").then(m => ({ default: m.MarsRoverPage })));
const ImpressumPage = lazy(() => import("./pages/ImpressumPage").then(m => ({ default: m.ImpressumPage })));
const DatenschutzPage = lazy(() => import("./pages/DatenschutzPage").then(m => ({ default: m.DatenschutzPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
```

**Step 2: Wrap Routes in Suspense**

In the `App()` return, wrap the `<Routes>` block:

```tsx
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    {/* ... unchanged ... */}
  </Routes>
</Suspense>
```

Add a minimal PageSkeleton above the App function:

```tsx
function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-24">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-[rgba(70,130,220,0.15)] rounded w-1/3" />
        <div className="h-4 bg-[rgba(70,130,220,0.10)] rounded w-2/3" />
        <div className="h-4 bg-[rgba(70,130,220,0.10)] rounded w-1/2" />
      </div>
    </div>
  );
}
```

**Step 3: Build and verify chunk split**

```bash
npm run build 2>&1 | grep dist/
```

Expected: new separate chunks for pages (ArticlesPage, EarthPage, etc.). Main chunk should be smaller.

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "perf: lazy-load route pages for code splitting"
```

---

### Task 9: Lazy-load below-the-fold homepage components

**Files:**
- Modify: `src/App.tsx`

**Step 1: Replace static homepage component imports**

Replace these imports with lazy versions:

```tsx
// REMOVE static imports for below-the-fold components:
// import { ISSTracker } from "./components/ISSTracker";
// import { DailySpaceFacts } from "./components/DailySpaceFacts";
// import { NearEarthObjects } from "./components/NearEarthObjects";
// import { ImpactRisks } from "./components/ImpactRisks";
// import { PlanetPositions } from "./components/PlanetPositions";
// import { ArticleTeaser } from "./components/ArticleTeaser";

// ADD lazy imports:
const ISSTracker = lazy(() => import("./components/ISSTracker").then(m => ({ default: m.ISSTracker })));
const DailySpaceFacts = lazy(() => import("./components/DailySpaceFacts").then(m => ({ default: m.DailySpaceFacts })));
const NearEarthObjects = lazy(() => import("./components/NearEarthObjects").then(m => ({ default: m.NearEarthObjects })));
const ImpactRisks = lazy(() => import("./components/ImpactRisks").then(m => ({ default: m.ImpactRisks })));
const PlanetPositions = lazy(() => import("./components/PlanetPositions").then(m => ({ default: m.PlanetPositions })));
const ArticleTeaser = lazy(() => import("./components/ArticleTeaser").then(m => ({ default: m.ArticleTeaser })));
```

**Step 2: Wrap HomePage content in Suspense**

In `HomePage()`:

```tsx
function HomePage({ lang, t }: { lang: "de" | "en"; t: (k: string) => string }) {
  return (
    <>
      {/* Above the fold — static imports, load immediately */}
      <NASAApiErrorBoundary apiName="APOD">
        <ApodHero t={t} />
      </NASAApiErrorBoundary>

      <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} />

      {/* Below the fold — lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <NASAApiErrorBoundary apiName="Space Facts">
          <DailySpaceFacts lang={lang} t={t} />
        </NASAApiErrorBoundary>

        <NASAApiErrorBoundary apiName="Solar Activity">
          <SolarPressureWidget t={t} lang={lang} />
          <SpaceWeather t={t} lang={lang} />
        </NASAApiErrorBoundary>

        <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} variant="weather" />

        <NASAApiErrorBoundary apiName="ISS Tracker">
          <ISSTracker lang={lang} t={t} />
        </NASAApiErrorBoundary>

        <NASAApiErrorBoundary apiName="Asteroid Data">
          <NearEarthObjects lang={lang} />
          <ImpactRisks lang={lang} />
        </NASAApiErrorBoundary>

        <NASAApiErrorBoundary apiName="Planet Positions">
          <PlanetPositions lang={lang} t={t} />
        </NASAApiErrorBoundary>

        <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} />
        <ArticleTeaser lang={lang} t={t} />
      </Suspense>
    </>
  );
}
```

Add a small SectionSkeleton:

```tsx
function SectionSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      <div className="sky-card p-6 animate-pulse space-y-4">
        <div className="h-6 bg-[rgba(212,175,55,0.15)] rounded w-1/4" />
        <div className="h-4 bg-[rgba(70,130,220,0.10)] rounded w-3/4" />
        <div className="h-4 bg-[rgba(70,130,220,0.10)] rounded w-1/2" />
      </div>
    </div>
  );
}
```

**Step 3: Build and verify**

```bash
npm run build 2>&1 | grep dist/
```

Expected: main chunk (index-*.js) well below 500 kB. Several new chunk files visible.

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "perf: lazy-load below-the-fold homepage components"
```

---

### Task 10: Verify final bundle sizes

**Files:** none (read-only verification)

**Step 1: Run full CI**

```bash
npm run ci
```

Expected: all steps pass (type-check, tests, build).

**Step 2: Check main chunk**

```bash
npm run build 2>&1 | grep -E "index-.*\.js"
```

Expected: main chunk < 300 kB (from 517 kB). If still > 500 kB, investigate with:

```bash
npx vite-bundle-visualizer
```

**Step 3: Smoke-test in browser**

```bash
npm run preview
```

Open `http://localhost:3002/`, verify:
- Homepage loads fast (APOD hero visible first)
- Scroll down: ISS Tracker, Space Facts appear (lazy-loaded)
- Navigate to `/artikel` — page loads after short delay
- Navigate to `/erde` — page loads after short delay
- Language toggle DE/EN works everywhere
- No console errors

---

### Task 11: Final commit & push

**Step 1: Check nothing is uncommitted**

```bash
git status
```

**Step 2: Push**

```bash
git push origin master
```

---

## Summary

| Phase | Tasks | Outcome |
|-------|-------|---------|
| **1. Testing** | 1–7 | Vitest + RTL installed, ~19 tests covering cache layer, ErrorBoundary, DailySpaceFacts, i18n |
| **2. Bundle Split** | 8–11 | Main chunk < 300 kB via lazy pages + lazy homepage sections |

**Total estimated time:** 60–90 minutes.
