# Web Interface Guidelines Fixes

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all High/Medium findings from the Web Interface Guidelines audit — focus-visible states, transition-all, prefers-reduced-motion, meta tags, fetchpriority, and overscroll-behavior.

**Architecture:** 4 batched tasks grouped by fix pattern. Task 1 handles global CSS (animations, touch-action, transitions). Task 2 handles index.html meta tags. Task 3 adds focus-visible rings to all interactive elements. Task 4 adds fetchpriority to hero image and fixes the Footer button type.

**Tech Stack:** Tailwind CSS v4, React 19, TypeScript

---

## Task 1: Global CSS fixes — prefers-reduced-motion, touch-action, sky-card transition

**Files:**
- Modify: `src/index.css`

**Step 1: Add prefers-reduced-motion media query**

At the end of `src/index.css`, add:

```css
/* ── Reduced motion ────────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Step 2: Add touch-action: manipulation**

In the `@layer base` block (after the `body` rule), add:

```css
button, a, [role="button"] {
  touch-action: manipulation;
}
```

**Step 3: Fix sky-card transition from `all` to specific properties**

Change line 42:
```css
transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
```
to:
```css
transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1);
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Clean build.

**Step 5: Commit**

```bash
git add src/index.css
git commit -m "fix(a11y): add prefers-reduced-motion, touch-action, fix sky-card transition"
```

---

## Task 2: index.html meta tags — theme-color, color-scheme

**Files:**
- Modify: `index.html`

**Step 1: Add theme-color and color-scheme meta tags**

After the viewport meta tag (line 5), add:

```html
<meta name="theme-color" content="#020509" />
<meta name="color-scheme" content="dark" />
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "fix(meta): add theme-color and color-scheme for dark mode"
```

---

## Task 3: Focus-visible rings on all interactive elements

All buttons and custom interactive elements need `focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 focus-visible:ring-offset-0`. This is the most efficient way — add it to every button/interactive className.

**Files (all modifications):**
- `src/components/Header.tsx` — hamburger button (line 71), DE button (line 82), EN button (line 94)
- `src/components/Footer.tsx` — cookie button (line 65): add `type="button"` AND focus-visible
- `src/components/CookieConsent.tsx` — modal container (line 73): add `overscroll-behavior-y: contain` via style prop
- `src/pages/ArticlesPage.tsx` — category tab buttons (line 46)
- `src/pages/EarthPage.tsx` — prev/next buttons (lines 123, 154), thumbnail buttons (line 219)
- `src/pages/MarsRoverPage.tsx` — camera filter buttons (line 213), photo grid buttons (line 317)

**Step 1: Define the focus class string**

The Tailwind class to add to EVERY button's className is:
```
focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 focus-visible:outline-none
```

For each file, read it, find each `<button` tag, and append the focus classes to its `className`.

**Step 2: Fix transition-all in the same pass**

While editing each file, also replace `transition-all` with the appropriate specific transition:

| File | Line | Replace `transition-all` with |
|------|------|-------------------------------|
| Header.tsx | 82, 94 | `transition-colors` |
| ArticleTeaser.tsx | 57 | `transition-[border-color]` |
| ArticlesPage.tsx | 46, 72 | `transition-colors`, `transition-colors` |
| EarthPage.tsx | 123, 154 | `transition-[border-color,color]` |
| EarthPage.tsx | 219 | `transition-[border-color,opacity]` |
| MarsRoverPage.tsx | 213 | `transition-[border-color,background-color,color]` |
| MarsRoverPage.tsx | 317 | `transition-[border-color]` |

**Step 3: Fix Footer cookie button**

Add `type="button"` to the cookie settings button in Footer.tsx.

**Step 4: Fix CookieConsent overscroll-behavior**

On the outer `<div>` of CookieConsent (line 73), add to className:
```
overscroll-behavior-y-contain
```
(Tailwind v4 utility for `overscroll-behavior-y: contain`)

If Tailwind doesn't support it natively, use inline style:
```tsx
style={{ overscrollBehaviorY: "contain" }}
```

**Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 6: Commit**

```bash
git add src/components/Header.tsx src/components/Footer.tsx src/components/CookieConsent.tsx src/components/ArticleTeaser.tsx src/pages/ArticlesPage.tsx src/pages/EarthPage.tsx src/pages/MarsRoverPage.tsx
git commit -m "fix(a11y): add focus-visible rings, fix transition-all, button types"
```

---

## Task 4: Hero image fetchpriority

**Files:**
- Modify: `src/components/ApodHero.tsx` (line 74)

**Step 1: Add fetchpriority="high" to the hero img**

The APOD hero image is above-the-fold. Add `fetchpriority="high"` to the `<img>` tag:

```tsx
<img
  src={apod.url}
  srcSet={...}
  sizes="100vw"
  alt={apod.title}
  fetchPriority="high"
  onLoad={...}
```

Note: React uses `fetchPriority` (camelCase), not `fetchpriority`.

**Step 2: Verify build**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/ApodHero.tsx
git commit -m "perf: add fetchPriority=high to above-fold APOD hero image"
```

---

## Final: Build, push

**Step 1: Full build**

Run: `npm run build`
Expected: Clean build.

**Step 2: Push**

```bash
git push
```
