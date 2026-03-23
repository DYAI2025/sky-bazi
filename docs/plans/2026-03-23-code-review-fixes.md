# Code Review Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical, high, and selected medium/low issues from the code review to achieve GDPR compliance, improve security, accessibility, and code quality.

**Architecture:** Targeted edits across existing files — no new dependencies. Cookie consent revocation via Footer link, CSP via meta tag, type safety via union types, accessibility via aria attributes, and dynamic HTML lang attribute.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind CSS v4

---

## Task 1: GDPR consent revocation (C1)

Users can accept cookies but never revoke. GDPR Art. 7(3) requires withdrawal to be as easy as giving consent.

**Files:**
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/CookieConsent.tsx`

**Step 1: Add resetConsent export to CookieConsent.tsx**

After the `CONSENT_KEY` constant (line 4), add:

```typescript
export function resetConsent() {
  localStorage.removeItem(CONSENT_KEY);
  window.location.reload();
}
```

**Step 2: Add "Cookie-Einstellungen" link to Footer.tsx**

Import at top of Footer.tsx:
```typescript
import { resetConsent } from "./CookieConsent";
```

In the legal links row (line 55-63), after the Datenschutz link, add:

```tsx
<span>&middot;</span>
<button
  onClick={resetConsent}
  className="hover:text-[rgba(215,230,255,0.60)] transition-colors"
>
  {lang === "de" ? "Cookie-Einstellungen" : "Cookie Settings"}
</button>
```

**Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/components/CookieConsent.tsx src/components/Footer.tsx
git commit -m "fix(gdpr): add cookie consent revocation via footer link"
```

---

## Task 2: Self-hosted OG image (H3)

The `og:image` currently points to a NASA URL that will eventually break.

**Files:**
- Modify: `index.html` (line 15)

**Step 1: Check for existing brand images**

Look for any suitable image already in `public/images/`. If none exists, use a solid fallback: the compressed `jwst-deep-field.jpg` which is already in the repo.

**Step 2: Update og:image in index.html**

Change line 15 from:
```html
<meta property="og:image" content="https://apod.nasa.gov/apod/image/2403/Ngc7714_HubbleOdenthal_960.jpg" />
```
to:
```html
<meta property="og:image" content="https://sky.bazodiac.space/images/articles/jwst-deep-field.jpg" />
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "fix(seo): use self-hosted OG image instead of external NASA URL"
```

---

## Task 3: Type-safe article categories (H4)

The `category` field is `string` — typos in frontmatter silently break filtering.

**Files:**
- Modify: `src/lib/parseArticle.ts`

**Step 1: Add ArticleCategory type after Lang import (line 1)**

```typescript
export type ArticleCategory = "universum" | "mensch";
```

**Step 2: Change `category: string` to `category: ArticleCategory` in ArticleMeta (line 12)**

```typescript
category: ArticleCategory;
```

**Step 3: Normalize category in article builder (around line 74)**

Change:
```typescript
category: meta.category ?? "universum",
```
to:
```typescript
category: (String(meta.category ?? "universum").toLowerCase() as ArticleCategory),
```

**Step 4: Update getArticlesByCategory signature**

```typescript
export function getArticlesByCategory(lang: Lang, category: ArticleCategory): Article[] {
```

**Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 6: Commit**

```bash
git add src/lib/parseArticle.ts
git commit -m "fix(types): use union type for article categories"
```

---

## Task 4: Content Security Policy (H2)

No CSP exists. Add a meta tag that allows our known third-party sources.

**Files:**
- Modify: `index.html`

**Step 1: Add CSP meta tag after the viewport meta (line 5)**

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://tpc.googlesyndication.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://*.nasa.gov https://apod.nasa.gov data:; connect-src 'self' https://api.nasa.gov https://ssd-api.jpl.nasa.gov https://services.swpc.noaa.gov https://pagead2.googlesyndication.com; frame-src https://www.youtube.com https://player.vimeo.com https://pagead2.googlesyndication.com;" />
```

**Step 2: Verify site still works locally**

Run: `npm run dev`
Open http://localhost:3002 — verify no CSP violations block rendering.

**Step 3: Commit**

```bash
git add index.html
git commit -m "fix(security): add Content Security Policy meta tag"
```

---

## Task 5: YouTube iframe sandbox (M1)

The APOD iframe for YouTube/Vimeo embeds has no `sandbox` attribute.

**Files:**
- Modify: `src/components/ApodHero.tsx` (line 63-68)

**Step 1: Add sandbox and loading="lazy" to iframe**

Change:
```tsx
<iframe
  src={apod.url}
  title={apod.title}
  className="w-full h-full"
  allowFullScreen
/>
```
to:
```tsx
<iframe
  src={apod.url}
  title={apod.title}
  className="w-full h-full"
  allowFullScreen
  loading="lazy"
  sandbox="allow-scripts allow-same-origin allow-presentation"
/>
```

**Step 2: Commit**

```bash
git add src/components/ApodHero.tsx
git commit -m "fix(security): add sandbox attribute to APOD iframe"
```

---

## Task 6: Persist language preference (M3)

Language resets to German on page reload.

**Files:**
- Modify: `src/lib/i18n.ts`

**Step 1: Replace the useState initializer and add persistence**

Change line 77:
```typescript
const [lang, setLang] = useState<Lang>("de");
```
to:
```typescript
const [lang, setLangState] = useState<Lang>(() => {
  try {
    const stored = localStorage.getItem("sky:lang");
    if (stored === "en") return "en";
  } catch { /* ignore */ }
  return "de";
});

const setLang = useCallback((l: Lang) => {
  setLangState(l);
  try { localStorage.setItem("sky:lang", l); } catch { /* ignore */ }
}, []);
```

Remove the old `setLang` from the return — it's now defined above. The return stays: `return { lang, setLang, t };`

**Step 2: Verify build**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/lib/i18n.ts
git commit -m "fix(i18n): persist language preference to localStorage"
```

---

## Task 7: Dynamic HTML lang attribute (L2)

The `<html lang="de">` never changes when switching to English.

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add useEffect after useLang() call (around line 39)**

After `const { lang, setLang, t } = useLang();`, add:

```typescript
useEffect(() => {
  document.documentElement.lang = lang;
}, [lang]);
```

Add `useEffect` to the import from "react" if not already imported.

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "fix(a11y): update html lang attribute on language switch"
```

---

## Task 8: Proper 404 page (M4)

Catch-all route silently renders HomePage, causing duplicate content for SEO.

**Files:**
- Create: `src/pages/NotFoundPage.tsx`
- Modify: `src/App.tsx`

**Step 1: Create NotFoundPage component**

```tsx
import { Link } from "react-router-dom";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
}

export function NotFoundPage({ lang }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-serif text-[#D4AF37]/30 mb-4">404</p>
        <h1 className="font-serif text-2xl text-white mb-3">
          {lang === "de" ? "Seite nicht gefunden" : "Page not found"}
        </h1>
        <p className="text-[rgba(215,230,255,0.50)] text-sm mb-8">
          {lang === "de" ? "Diese Seite existiert nicht." : "This page does not exist."}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 border border-[#D4AF37]/30 text-[#D4AF37] text-sm rounded-full hover:bg-[#D4AF37]/10 transition-colors"
        >
          {lang === "de" ? "Zur Startseite" : "Go to homepage"}
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Add noindex meta tag for 404**

In NotFoundPage, add a useEffect:
```tsx
import { useEffect } from "react";

// Inside the component:
useEffect(() => {
  const meta = document.createElement("meta");
  meta.name = "robots";
  meta.content = "noindex";
  document.head.appendChild(meta);
  return () => { document.head.removeChild(meta); };
}, []);
```

**Step 3: Update App.tsx**

Import: `import { NotFoundPage } from "./pages/NotFoundPage";`

Change the catch-all route:
```tsx
<Route path="*" element={<NotFoundPage lang={lang} />} />
```

**Step 4: Verify build**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add src/pages/NotFoundPage.tsx src/App.tsx
git commit -m "fix(seo): add proper 404 page with noindex"
```

---

## Task 9: Fix hardcoded German label (M5)

**Files:**
- Modify: `src/pages/ArticlesPage.tsx` (line 19)

**Step 1: Change the label**

Change:
```typescript
label: "Bazodiac Sky · Wissen",
```
to:
```typescript
label: `Bazodiac Sky · ${t("nav.wissen")}`,
```

**Step 2: Commit**

```bash
git add src/pages/ArticlesPage.tsx
git commit -m "fix(i18n): use translated label on articles page"
```

---

## Task 10: Language toggle aria labels (M6)

**Files:**
- Modify: `src/components/Header.tsx` (lines 66-85)

**Step 1: Add aria attributes to both language buttons**

DE button (line 66-75):
```tsx
<button
  onClick={() => setLang("de")}
  aria-label={lang === "de" ? "Sprache: Deutsch (aktiv)" : "Switch to German"}
  aria-pressed={lang === "de"}
  className={...}
>
```

EN button (line 76-85):
```tsx
<button
  onClick={() => setLang("en")}
  aria-label={lang === "en" ? "Language: English (active)" : "Auf Englisch wechseln"}
  aria-pressed={lang === "en"}
  className={...}
>
```

**Step 2: Commit**

```bash
git add src/components/Header.tsx
git commit -m "fix(a11y): add aria-label and aria-pressed to language toggle"
```

---

## Task 11: Cookie buttons type="button" (M7)

**Files:**
- Modify: `src/components/CookieConsent.tsx`

**Step 1: Add type="button" to both buttons**

Accept button: add `type="button"` attribute.
Reject button: add `type="button"` attribute.

**Step 2: Commit**

```bash
git add src/components/CookieConsent.tsx
git commit -m "fix(a11y): add explicit type=button to cookie consent buttons"
```

---

## Task 12: Separate astronomy-engine chunk (M8)

**Files:**
- Modify: `vite.config.ts` (lines 22-25)

**Step 1: Add astronomy-engine to manualChunks**

Change:
```typescript
manualChunks: {
  react: ["react", "react-dom", "react-router-dom"],
  markdown: ["react-markdown", "remark-gfm"],
},
```
to:
```typescript
manualChunks: {
  react: ["react", "react-dom", "react-router-dom"],
  markdown: ["react-markdown", "remark-gfm"],
  astronomy: ["astronomy-engine"],
},
```

**Step 2: Verify build**

Run: `npm run build`
Expected: New `astronomy-*.js` chunk in output.

**Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "perf: separate astronomy-engine into own chunk"
```

---

## Task 13: Sort articles by date instead of slug (L4)

**Files:**
- Modify: `src/lib/parseArticle.ts` (line 81)

**Step 1: Change sort comparator**

Change:
```typescript
.sort((a, b) => a.slug.localeCompare(b.slug));
```
to:
```typescript
.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
```

This sorts newest first (descending by date string, which works because dates are ISO format YYYY-MM-DD).

**Step 2: Commit**

```bash
git add src/lib/parseArticle.ts
git commit -m "fix: sort articles by publication date instead of slug"
```

---

## Task 14: Fix Umlaut encoding in UI text (L6)

Replace ASCII substitutions (ae, oe, ue) with real Umlaute in user-visible strings.

**Files:**
- Modify: `src/lib/i18n.ts` — all German strings using `ae`/`oe`/`ue`
- Modify: `src/components/CookieConsent.tsx` — "Datenschutzerklaerung" and "fuer"
- Modify: `src/pages/ImpressumPage.tsx` — "gemaess", "fuer", "Loeschung" etc.
- Modify: `src/pages/DatenschutzPage.tsx` — "Datenschutzerklaerung", "aendern" etc.

**Step 1: Fix i18n.ts German strings**

Replace all occurrences in German text:
- `ueber` → `über`
- `fuer` → `für`
- `haengt` → `hängt`
- `persoenlichen` → `persönlichen`
- `Ruecklaeufig` → `Rückläufig`
- `Sonnenaktivitaet` → `Sonnenaktivität`
- `Stuerme` → `Stürme`
- `Sonnenstuerme` → `Sonnenstürme`

**Step 2: Fix CookieConsent.tsx German strings**

- `"fuer Werbung"` → `"für Werbung"`
- `"Datenschutzerklaerung"` → `"Datenschutzerklärung"`

**Step 3: Fix ImpressumPage.tsx German strings**

- `"gemaess"` → `"gemäß"`
- `"fuer"` → `"für"`
- `"koennen"` → `"können"`
- `"Vollstaendigkeit"` → `"Vollständigkeit"`
- `"Aktualitaet"` → `"Aktualität"`
- `"uebermittelte"` → `"übermittelte"`
- `"enthaelt"` → `"enthält"`

**Step 4: Fix DatenschutzPage.tsx German strings**

- `"erlaeutert"` → `"erläutert"`
- `"gespeichert"` → already correct
- `"persoenlichen"` → `"persönlichen"`
- `"aehnliche"` → `"ähnliche"`
- `"Aenderungen"` → `"Änderungen"`

**Step 5: Verify build**

Run: `npx tsc --noEmit`

**Step 6: Commit**

```bash
git add src/lib/i18n.ts src/components/CookieConsent.tsx src/pages/ImpressumPage.tsx src/pages/DatenschutzPage.tsx
git commit -m "fix(i18n): use proper German Umlaute instead of ASCII substitutions"
```

---

## Final: Build, push, verify

**Step 1: Full build**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 2: Push**

```bash
git push
```
