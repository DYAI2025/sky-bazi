# Mensch Article Thumbnails — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate and integrate 5 photorealistic thumbnails (1200×630 px) for the "mensch" category articles (08–12) via fal.ai FLUX.

**Architecture:** Each article currently has `image: /images/articles/placeholder.jpg` in its frontmatter. We generate one image per article topic using fal.ai's FLUX model via REST API, save to `public/images/articles/`, and update all 10 frontmatter files (DE + EN pair per article).

**Tech Stack:** fal.ai REST API (FLUX 1.1 Pro), curl, sips (macOS), 10 markdown frontmatter files

---

## Prerequisites

Set FAL_KEY before running:
```bash
export FAL_KEY="<your-fal-api-key>"
```

Get a free key at https://fal.ai — the FLUX 1.1 Pro model costs ~$0.04/image.

---

### Task 1: Generate thumbnail for Article 08 — Zirbeldrüse / Pineal Gland

**Files:**
- Create: `public/images/articles/zirbeldruese-thumbnail.jpg`
- Modify: `content/articles/08-zirbeldruese-magnetfeld-melatonin.md:5`
- Modify: `content/articles/08-zirbeldruese-magnetfeld-melatonin-en.md:5`

**Step 1: Generate image via fal.ai FLUX**

```bash
curl -X POST "https://fal.run/fal-ai/flux/schnell" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A glowing pineal gland at the center of the human brain, surrounded by electromagnetic field lines and aurora-like magnetic waves, dark cosmic blue background, photorealistic, scientific visualization, moody and ethereal",
    "image_size": "landscape_16_9",
    "num_images": 1,
    "output_format": "jpeg"
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['images'][0]['url'])"
```

**Step 2: Download and save**

```bash
curl -o sky-bazi/public/images/articles/zirbeldruese-thumbnail.jpg "<URL_FROM_STEP_1>"
```

**Step 3: Resize to 1200×630 (if needed)**

```bash
sips -z 630 1200 sky-bazi/public/images/articles/zirbeldruese-thumbnail.jpg
```

**Step 4: Update frontmatter in both article files**

In `content/articles/08-zirbeldruese-magnetfeld-melatonin.md` and `08-...-en.md`:
```
image: /images/articles/zirbeldruese-thumbnail.jpg
```

**Step 5: Commit**

```bash
git add public/images/articles/zirbeldruese-thumbnail.jpg content/articles/08-*.md
git commit -m "feat(content): add thumbnail for Zirbeldrüse article"
```

---

### Task 2: Generate thumbnail for Article 09 — Schumann-Resonanz / Brain Waves

**Files:**
- Create: `public/images/articles/schumann-resonanz-thumbnail.jpg`
- Modify: `content/articles/09-schumann-resonanz-gehirnwellen.md:5`
- Modify: `content/articles/09-schumann-resonanz-gehirnwellen-en.md:5`

**Step 1: Generate image via fal.ai FLUX**

```bash
curl -X POST "https://fal.run/fal-ai/flux/schnell" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Earth surrounded by standing electromagnetic waves at 7.83 Hz Schumann resonance frequency, overlaid with human brainwave patterns in glowing cyan lines, dark space background with subtle aurora, scientific visualization, cinematic and atmospheric",
    "image_size": "landscape_16_9",
    "num_images": 1,
    "output_format": "jpeg"
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['images'][0]['url'])"
```

**Step 2: Download and save**

```bash
curl -o sky-bazi/public/images/articles/schumann-resonanz-thumbnail.jpg "<URL_FROM_STEP_1>"
```

**Step 3: Resize to 1200×630**

```bash
sips -z 630 1200 sky-bazi/public/images/articles/schumann-resonanz-thumbnail.jpg
```

**Step 4: Update frontmatter in both article files**

```
image: /images/articles/schumann-resonanz-thumbnail.jpg
```

**Step 5: Commit**

```bash
git add public/images/articles/schumann-resonanz-thumbnail.jpg content/articles/09-*.md
git commit -m "feat(content): add thumbnail for Schumann-Resonanz article"
```

---

### Task 3: Generate thumbnail for Article 10 — Heliobiologische Resonanz

**Files:**
- Create: `public/images/articles/heliobiologie-thumbnail.jpg`
- Modify: `content/articles/10-heliobiologische-resonanz-sonnenwetter-mensch.md:5`
- Modify: `content/articles/10-heliobiologische-resonanz-sonnenwetter-mensch-en.md:5`

**Step 1: Generate image via fal.ai FLUX**

```bash
curl -X POST "https://fal.run/fal-ai/flux/schnell" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A human silhouette bathed in solar wind particles and golden solar flare light, electromagnetic energy streams flowing from the sun into the human body, cosmic background with aurora borealis, heliobiology concept art, photorealistic, dramatic and warm",
    "image_size": "landscape_16_9",
    "num_images": 1,
    "output_format": "jpeg"
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['images'][0]['url'])"
```

**Step 2: Download and save**

```bash
curl -o sky-bazi/public/images/articles/heliobiologie-thumbnail.jpg "<URL_FROM_STEP_1>"
```

**Step 3: Resize to 1200×630**

```bash
sips -z 630 1200 sky-bazi/public/images/articles/heliobiologie-thumbnail.jpg
```

**Step 4: Update frontmatter in both article files**

```
image: /images/articles/heliobiologie-thumbnail.jpg
```

**Step 5: Commit**

```bash
git add public/images/articles/heliobiologie-thumbnail.jpg content/articles/10-*.md
git commit -m "feat(content): add thumbnail for Heliobiologische Resonanz article"
```

---

### Task 4: Generate thumbnail for Article 11 — Migräne & Sonnenstürme

**Files:**
- Create: `public/images/articles/migraene-sonnensturm-thumbnail.jpg`
- Modify: `content/articles/11-migraene-cluster-kopfschmerz-sonnensturm.md:5`
- Modify: `content/articles/11-migraene-cluster-kopfschmerz-sonnensturm-en.md:5`

**Step 1: Generate image via fal.ai FLUX**

```bash
curl -X POST "https://fal.run/fal-ai/flux/schnell" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A solar flare erupting from the sun, with glowing red and orange magnetic field lines connecting to a stylized human head profile showing neural pain pathways in bright crimson, dark space background, medical and scientific visualization, intense and dramatic",
    "image_size": "landscape_16_9",
    "num_images": 1,
    "output_format": "jpeg"
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['images'][0]['url'])"
```

**Step 2: Download and save**

```bash
curl -o sky-bazi/public/images/articles/migraene-sonnensturm-thumbnail.jpg "<URL_FROM_STEP_1>"
```

**Step 3: Resize to 1200×630**

```bash
sips -z 630 1200 sky-bazi/public/images/articles/migraene-sonnensturm-thumbnail.jpg
```

**Step 4: Update frontmatter in both article files**

```
image: /images/articles/migraene-sonnensturm-thumbnail.jpg
```

**Step 5: Commit**

```bash
git add public/images/articles/migraene-sonnensturm-thumbnail.jpg content/articles/11-*.md
git commit -m "feat(content): add thumbnail for Migräne Sonnensturm article"
```

---

### Task 5: Generate thumbnail for Article 12 — Herz-Kreislauf & Magnetstürme

**Files:**
- Create: `public/images/articles/herz-kreislauf-thumbnail.jpg`
- Modify: `content/articles/12-herz-kreislauf-magnetsturm-forschung.md:5`
- Modify: `content/articles/12-herz-kreislauf-magnetsturm-forschung-en.md:5`

**Step 1: Generate image via fal.ai FLUX**

```bash
curl -X POST "https://fal.run/fal-ai/flux/schnell" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A glowing human heart with electromagnetic pulse waves radiating outward, intertwined with geomagnetic storm field lines in deep blue and violet, dark cosmic background, cardiovascular medical visualization with space weather elements, cinematic and moody",
    "image_size": "landscape_16_9",
    "num_images": 1,
    "output_format": "jpeg"
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['images'][0]['url'])"
```

**Step 2: Download and save**

```bash
curl -o sky-bazi/public/images/articles/herz-kreislauf-thumbnail.jpg "<URL_FROM_STEP_1>"
```

**Step 3: Resize to 1200×630**

```bash
sips -z 630 1200 sky-bazi/public/images/articles/herz-kreislauf-thumbnail.jpg
```

**Step 4: Update frontmatter in both article files**

```
image: /images/articles/herz-kreislauf-thumbnail.jpg
```

**Step 5: Commit**

```bash
git add public/images/articles/herz-kreislauf-thumbnail.jpg content/articles/12-*.md
git commit -m "feat(content): add thumbnail for Herz-Kreislauf article"
```

---

### Task 6: Build verification

**Step 1: Run build**

```bash
npm run build
```

Expected: no errors, all 5 new images referenced correctly.

**Step 2: Visual check**

```bash
open http://localhost:5173/wissen
```

Verify all 5 mensch articles show their new thumbnails instead of placeholder.

**Step 3: Final commit (if any missed files)**

```bash
git add -A && git status
# Commit only if uncommitted changes remain
```

---

## Image Filenames Summary

| Article | Filename |
|---------|----------|
| 08 Zirbeldrüse | `zirbeldruese-thumbnail.jpg` |
| 09 Schumann | `schumann-resonanz-thumbnail.jpg` |
| 10 Heliobiologie | `heliobiologie-thumbnail.jpg` |
| 11 Migräne | `migraene-sonnensturm-thumbnail.jpg` |
| 12 Herz-Kreislauf | `herz-kreislauf-thumbnail.jpg` |

## Notes

- The `fal-ai/flux/schnell` endpoint is the fast, cheap variant (~$0.003/image). For higher quality use `fal-ai/flux-pro/v1.1`.
- All prompts follow a consistent style: dark cosmic background, scientific visualization, photorealistic — matching the sky.bazodiac.space visual identity.
- Alternative if no FAL_KEY: use https://fal.ai/models/fal-ai/flux/schnell directly in the browser, download manually, resize with `sips`.
