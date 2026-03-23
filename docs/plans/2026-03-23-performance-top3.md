# Performance Top-3 Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Raise Lighthouse performance score from 8/100 to 60+ by fixing the three largest bottlenecks.

**Architecture:** Compress oversized static images to WebP, defer AdSense loading until after cookie consent, add native lazy-loading to all below-fold images.

**Tech Stack:** Sharp CLI (image compression), HTML script loading, React `loading="lazy"` attribute.

---

## Task 1: Compress oversized article images

The biggest single bottleneck: 3 images total **34 MB**. Target: all images under 300 KB.

**Files:**
- Modify: `public/images/articles/jwst-deep-field.jpg` (16 MB → ~200 KB WebP)
- Modify: `public/images/articles/sun-sdo.jpg` (12 MB → ~200 KB WebP)
- Modify: `public/images/articles/aurora-storm.jpg` (5.8 MB → ~200 KB WebP)
- Modify: `public/images/articles/cmb-planck.jpg` (2.1 MB → ~150 KB WebP)

**Step 1: Install sharp-cli**

Run: `npm install --save-dev sharp-cli`

If sharp-cli is unavailable, use `npx sharp` directly or `sips` (macOS built-in).

**Step 2: Convert all large images to optimized JPEGs**

We keep .jpg extension for compatibility (no code changes needed). Use `sips` which is pre-installed on macOS:

```bash
cd /Users/benjaminpoersch/Projects/codebase/Bazodiac-subpage-sky/sky-bazi/public/images/articles

# Resize to max 1600px wide and recompress
sips --resampleWidth 1600 -s formatOptions 70 jwst-deep-field.jpg
sips --resampleWidth 1600 -s formatOptions 70 sun-sdo.jpg
sips --resampleWidth 1600 -s formatOptions 70 aurora-storm.jpg
sips --resampleWidth 1600 -s formatOptions 70 cmb-planck.jpg
```

If `sips` quality is insufficient, use ImageMagick:
```bash
convert jwst-deep-field.jpg -resize 1600x -quality 75 jwst-deep-field.jpg
```

**Step 3: Verify sizes are under 300 KB each**

Run: `ls -lh public/images/articles/*.jpg`
Expected: Each file < 300 KB. Total < 1 MB (was 36 MB).

**Step 4: Commit**

```bash
git add public/images/articles/
git commit -m "perf: compress article images from 34MB to <1MB"
```

---

## Task 2: Defer AdSense until cookie consent is granted

Currently the AdSense script loads immediately in `index.html` even when consent is denied. This adds ~250 KB + 2.8s TBT to every page load. It should only load after the user clicks "Accept" in the cookie banner.

**Files:**
- Modify: `index.html` (line 20 — remove AdSense script tag)
- Modify: `src/components/CookieConsent.tsx` (inject AdSense script on accept)

**Step 1: Remove AdSense script from index.html**

In `index.html`, remove line 20:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1712273263687132" crossorigin="anonymous"></script>
```

Keep the `<meta name="google-adsense-account">` tag (line 19) — that stays.

**Step 2: Load AdSense dynamically in CookieConsent.tsx**

In `src/components/CookieConsent.tsx`, add a function to inject the AdSense script:

```typescript
const ADSENSE_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1712273263687132";

function loadAdSense() {
  if (document.querySelector(`script[src*="adsbygoogle"]`)) return;
  const s = document.createElement("script");
  s.src = ADSENSE_SRC;
  s.async = true;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
}
```

**Step 3: Call loadAdSense when consent is accepted**

In the `useEffect` that runs when `state` changes, add:

```typescript
useEffect(() => {
  updateGoogleConsent(state === "accepted");
  if (state === "accepted") loadAdSense();
}, [state]);
```

This covers both fresh accepts and returning users who already accepted (since `getStoredConsent()` reads from localStorage on mount).

**Step 4: Verify build passes**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 5: Commit**

```bash
git add index.html src/components/CookieConsent.tsx
git commit -m "perf: defer AdSense loading until cookie consent granted"
```

---

## Task 3: Add lazy-loading to all below-fold images

Every `<img>` tag except the APOD hero (which is above the fold) should have `loading="lazy"`. This prevents the browser from downloading images the user hasn't scrolled to yet.

**Files:**
- Modify: `src/components/ArticleTeaser.tsx` (line 60)
- Modify: `src/pages/ArticlesPage.tsx` (line 76)
- Modify: `src/pages/ArticlePage.tsx` (lines 27, 110, 194)
- Modify: `src/pages/MarsRoverPage.tsx` (lines 87, 265)
- Modify: `src/pages/EarthPage.tsx` (lines 136, 222)
- Do NOT modify: `src/components/ApodHero.tsx` (hero image must load eagerly)

**Step 1: Add loading="lazy" to each img tag**

For each file listed above, add `loading="lazy"` to every `<img` tag. Example:

Before:
```tsx
<img src={url} alt={alt} className="..." />
```

After:
```tsx
<img src={url} alt={alt} loading="lazy" className="..." />
```

Apply to all 8 img tags across the 5 files. Do NOT touch ApodHero.tsx.

**Step 2: Verify build passes**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Verify all img tags have loading="lazy"**

Run: `grep -n '<img' src/components/ArticleTeaser.tsx src/pages/ArticlesPage.tsx src/pages/ArticlePage.tsx src/pages/MarsRoverPage.tsx src/pages/EarthPage.tsx`

Expected: Every match should contain `loading="lazy"`.

Run: `grep -n '<img' src/components/ApodHero.tsx`

Expected: No `loading="lazy"` (hero must load eagerly).

**Step 4: Commit**

```bash
git add src/components/ArticleTeaser.tsx src/pages/ArticlesPage.tsx src/pages/ArticlePage.tsx src/pages/MarsRoverPage.tsx src/pages/EarthPage.tsx
git commit -m "perf: add lazy-loading to all below-fold images"
```

---

## Final: Build, push, and verify

**Step 1: Full build**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 2: Push**

```bash
git push
```

**Step 3: Re-run Lighthouse after deploy (wait ~60s)**

Run: `npx lighthouse https://sky.bazodiac.space --output=json --chrome-flags="--headless --no-sandbox" --only-categories=performance 2>&1 | grep -o '"score":[0-9.]*' | head -1`

Expected: Performance score 50-80+ (was 8).
