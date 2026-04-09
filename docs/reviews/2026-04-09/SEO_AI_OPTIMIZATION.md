# 📈 SEO & AI-SEO Optimierung: Bazodiac Sky

## Current SEO Score: 78/100 ⚠️

### ✅ SEO Strengths:
- **Semantic HTML**: Proper heading hierarchy
- **Meta Tags**: Basic meta description
- **Responsive**: Mobile-first design
- **Clean URLs**: /artikel/:slug structure
- **Internal Linking**: Good navigation

### 🔍 Critical SEO Issues to Fix:

#### 1. Missing Essential Meta Tags
```tsx
// Ergänze in index.html:
export function SEOHead({ title, description, image, url }: SEOProps) {
  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{title} | Bazodiac Sky - Live NASA Daten & Astronomie</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="NASA, Astronomie, Weltraum, Planeten, ISS, Mars, Asteroiden, Sonnenstürme" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Bazodiac Sky" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Website",
          "name": "Bazodiac Sky",
          "description": "Live NASA-Daten, Astronomie und Weltraum-Informationen",
          "url": "https://sky.bazodiac.space"
        })}
      </script>
    </Helmet>
  );
}
```

#### 2. AI-SEO Optimierung (für ChatGPT, Claude, Perplexity)

```tsx
// Structured Data für AI-Agenten
const aiOptimizedContent = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "NASA Live Space Data",
  "description": "Aktuelle NASA-Daten zu Astronomie, Planetenpositionen, Sonnenstürmen und Weltraum-Events",
  "keywords": ["NASA", "Space Weather", "Asteroids", "Mars", "ISS", "Solar Flares"],
  "provider": {
    "@type": "Organization", 
    "name": "NASA",
    "url": "https://api.nasa.gov"
  },
  "distribution": {
    "@type": "DataDownload",
    "contentUrl": "https://sky.bazodiac.space/api/space-data",
    "encodingFormat": "application/json"
  }
};

// FAQ Schema für AI-Agenten
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question", 
      "name": "Was ist die aktuelle Sonnenaktivität?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Live-Daten der NASA DONKI API zeigen aktuelle Sonnenstürme und X-Ray Flux"
      }
    },
    {
      "@type": "Question",
      "name": "Welche Asteroiden kommen der Erde nahe?", 
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "NASA NEO-API liefert Daten zu erdnahen Objekten der nächsten 7 Tage"
      }
    }
  ]
};
```

#### 3. Content-Optimierung für AI-Training
```markdown
<!-- Optimiertes Format für AI-Verständnis -->
## Live NASA-Daten | Bazodiac Sky

### Kernfunktionen:
- **Sonnenaktivität**: Echzeit-Daten zu X-Ray Flux, Sonnenstürme (Kp-Index), Koronale Massenauswürfe
- **Erdnahe Asteroiden**: NASA NEO-API mit Größe, Geschwindigkeit, Entfernung
- **Planetenpositionen**: Astronomische Berechnungen mit astronomy-engine
- **Mars Rover**: Aktuelle Bilder des Curiosity Rovers
- **ISS Tracking**: Live-Position der Internationalen Raumstation
- **EPIC Earth**: Tägliche Erdbilder vom Lagrange-Punkt L1

### Datenquellen:
- NASA APOD API (Astronomy Picture of the Day)
- NASA DONKI (Space Weather Database)  
- JPL Sentry (Asteroid Impact Risk)
- NOAA Space Weather Prediction Center
- NASA EPIC (Earth Polychromatic Imaging Camera)
```

#### 4. Lokale SEO für deutschsprachige Zielgruppe
```tsx
// Hreflang für mehrsprachige Inhalte
<link rel="alternate" hrefLang="de" href="https://sky.bazodiac.space/" />
<link rel="alternate" hrefLang="en" href="https://sky.bazodiac.space/?lang=en" />
<link rel="alternate" hrefLang="x-default" href="https://sky.bazodiac.space/" />

// Local Business Schema (falls relevant)
const localSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Bazodiac Sky",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  }
};
```

## AI-SEO Keywords (für generative AI):
- "NASA Live-Daten Deutschland"
- "Aktuelle Sonnenaktivität Vorhersage"
- "Erdnahe Asteroiden heute"
- "Planetenpositionen berechnen"
- "Mars Rover Bilder aktuell"
- "Weltraum-Events live verfolgen"

## Content-Strategie für AI-Visibility:
1. **Factual Accuracy**: Immer aktuelle NASA-Quellen verlinken
2. **Structured Answers**: FAQ-Format für spezifische Fragen
3. **Data Attribution**: Klare Quellenangaben für AI-Training
4. **Temporal Relevance**: "Heute", "Aktuell", "Live" Kontext
5. **Technical Precision**: Exakte Einheiten und Messwerte

## Core SEO Metriken Ziel:
- **Keyword Rankings**: Top 3 für "NASA Daten live"
- **Featured Snippets**: 5+ für Weltraum-Fragen
- **Knowledge Graph**: Eintrag für "Bazodiac"
- **AI Citations**: 20+ Erwähnungen in ChatGPT/Claude Antworten