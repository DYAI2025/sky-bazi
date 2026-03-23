# Mobile Optimization Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Raise Lighthouse mobile performance from 44/100 to 70+ by fixing LCP, CLS, and font loading, plus add a mobile hamburger menu.

**Architecture:** Targeted edits to existing components — responsive image selection, fixed aspect ratios for layout stability, font preloading, and a mobile nav drawer.

**Tech Stack:** React 19, Tailwind CSS v4, no new dependencies

---

## Task 1: Use standard-res APOD image on mobile (LCP fix)

The hero image uses `apod.hdurl` (5-20 MB) on all devices. On mobile this is the #1 LCP killer.

**Files:**
- Modify: `src/components/ApodHero.tsx` (line 75)

**Step 1: Replace the static src with a responsive choice**

Change line 74-75:
```tsx
<img
  src={apod.hdurl || apod.url}
```
to:
```tsx
<img
  src={apod.url}
  srcSet={apod.hdurl ? `${apod.url} 960w, ${apod.hdurl} 1920w` : undefined}
  sizes="100vw"
```

This loads the standard-res image (~100-300 KB) by default and only loads HD on large screens.

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/ApodHero.tsx
git commit -m "perf(mobile): use srcset for APOD hero — standard-res on mobile"
```

---

## Task 2: Fix CLS on APOD hero skeleton (CLS fix — part 1)

The hero skeleton has no aspect ratio — when the image loads, the layout shifts.

**Files:**
- Modify: `src/components/ApodHero.tsx` (lines 30-39 — loading state)

**Step 1: The loading skeleton already uses `h-[70vh] min-h-[500px]`**

Check: The loading state (line 31) already has `h-[70vh] min-h-[500px]` — same as the loaded state (line 46). This means the hero height doesn't shift on load. The CLS issue is elsewhere. Skip to Task 3.

---

## Task 3: Fix CLS on article teaser images (CLS fix — part 2)

Article teaser images load without reserved height, causing layout shift.

**Files:**
- Modify: `src/components/ArticleTeaser.tsx` (line 59)

**Step 1: The image container already has a fixed height**

Check line 59: `h-64 sm:h-72` / `h-52 sm:h-60` — these are fixed heights. The image container won't shift. The CLS 0.361 likely comes from the FunnelCta or SpaceWeather sections expanding after data loads.

---

## Task 4: Fix CLS on data-dependent sections (CLS fix — main source)

SpaceWeather, NearEarthObjects, and ImpactRisks render nothing while loading, then expand to full height. This causes massive CLS.

**Files:**
- Modify: `src/components/SpaceWeather.tsx`
- Modify: `src/components/NearEarthObjects.tsx`
- Modify: `src/components/ImpactRisks.tsx`

**Step 1: Add min-height to SpaceWeather loading skeleton**

Read `src/components/SpaceWeather.tsx` and find the loading state. It likely renders a skeleton or nothing. Ensure the loading state reserves the same approximate height as the loaded state by wrapping in a container with `min-h-[400px]` (or the appropriate height for the component).

For each component, find the outermost `<section>` or wrapper and add a consistent `min-h-[400px] sm:min-h-[500px]` to prevent collapse during loading.

**Step 2: Verify visually**

Run: `npm run dev`
Open http://localhost:3002 — the sections should show skeleton placeholders with the same height as when data loads.

**Step 3: Commit**

```bash
git add src/components/SpaceWeather.tsx src/components/NearEarthObjects.tsx src/components/ImpactRisks.tsx
git commit -m "perf(mobile): reserve min-height for data sections to prevent CLS"
```

---

## Task 5: Preload critical font weight (FCP improvement)

Google Fonts load 6 weights across 2 families. The first paint is blocked until the browser discovers the CSS, then fetches the actual woff2 files. Preloading the most critical weight (Sora 400 — body text) saves ~200ms.

**Files:**
- Modify: `index.html`

**Step 1: Add font preload before the Google Fonts link**

After the `<link rel="preconnect">` tags (line 37), before the Google Fonts CSS link (line 38), add:

```html
<link rel="preload" href="https://fonts.gstatic.com/s/sora/v12/xMQOuFFYT72X5wkB_18qmnndmSdSnk-NKQI.woff2" as="font" type="font/woff2" crossorigin />
```

Note: This URL is the Sora Latin 400 woff2 file. It may change if Google updates the font. The preload is a hint — if the URL is stale, it gracefully fails with no impact.

**Step 2: Commit**

```bash
git add index.html
git commit -m "perf(mobile): preload critical Sora font weight for faster FCP"
```

---

## Task 6: Mobile hamburger menu

The Header hides nav links on mobile (`hidden sm:block`), but there's no hamburger menu to access them. Mobile users can only reach Wissen/Erde/Mars via the homepage teasers.

**Files:**
- Modify: `src/components/Header.tsx`

**Step 1: Add mobile menu state**

Add at the top of the `Header` component, after `const onMars`:

```typescript
const [menuOpen, setMenuOpen] = useState(false);
```

Add `useState` to the import from `react`:
```typescript
import { useState } from "react";
```

Also import the Menu and X icons:
```typescript
import { ExternalLink, Menu, X } from "lucide-react";
```

**Step 2: Add hamburger button (visible only on mobile)**

Before the lang toggle div (line 65), add:

```tsx
{/* Mobile menu button */}
<button
  type="button"
  onClick={() => setMenuOpen(!menuOpen)}
  className="sm:hidden p-2 text-[rgba(215,230,255,0.50)] hover:text-[rgba(215,230,255,0.80)] transition-colors"
  aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
>
  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
</button>
```

**Step 3: Add mobile dropdown menu**

After the closing `</div>` of the main header bar (after line 102), but still inside `<header>`, add:

```tsx
{/* Mobile nav drawer */}
{menuOpen && (
  <nav className="sm:hidden border-t border-[rgba(70,130,220,0.12)] bg-[#030a18]/95 backdrop-blur-xl">
    <div className="px-4 py-4 flex flex-col gap-3">
      <Link
        to="/artikel"
        onClick={() => setMenuOpen(false)}
        className={`text-sm py-2 transition-colors ${
          onArticles ? "text-[#D4AF37]" : "text-[rgba(215,230,255,0.60)]"
        }`}
      >
        {t("nav.wissen")}
      </Link>
      <Link
        to="/erde"
        onClick={() => setMenuOpen(false)}
        className={`text-sm py-2 transition-colors ${
          onEarth ? "text-[#D4AF37]" : "text-[rgba(215,230,255,0.60)]"
        }`}
      >
        {t("nav.earth")}
      </Link>
      <Link
        to="/mars-rover"
        onClick={() => setMenuOpen(false)}
        className={`text-sm py-2 transition-colors ${
          onMars ? "text-[#D4AF37]" : "text-[rgba(215,230,255,0.60)]"
        }`}
      >
        {t("nav.mars")}
      </Link>
      <a
        href={bazodiacUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm py-2 text-[#D4AF37]/70 flex items-center gap-1.5"
      >
        {t("nav.ring")}
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  </nav>
)}
```

**Step 4: Close menu on route change**

Add a `useEffect` that closes the menu when the location changes:

```typescript
useEffect(() => {
  setMenuOpen(false);
}, [location.pathname]);
```

Add `useEffect` to the import from `react`.

**Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 6: Test on mobile viewport**

Run: `npm run dev`
Open http://localhost:3002 in Chrome DevTools with mobile viewport (375px).
Verify: Hamburger icon visible, opens drawer with 4 links, closes on tap.

**Step 7: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat(mobile): add hamburger menu for mobile navigation"
```

---

## Final: Build, push, re-test

**Step 1: Full build**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 2: Push**

```bash
git push
```

**Step 3: Re-run Lighthouse mobile audit after deploy (~60s)**

```bash
npx lighthouse https://sky.bazodiac.space --output=json --chrome-flags="--headless --no-sandbox" --form-factor=mobile --throttling-method=simulate 2>&1 | grep -o '"score":[0-9.]*' | head -1
```

Expected: Performance 60-75+ (was 44).
