import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useLang } from "./lib/i18n";
import { Header } from "./components/Header";
import { ApodHero } from "./components/ApodHero";
import { SpaceWeather } from "./components/SpaceWeather";
import { FunnelCta } from "./components/FunnelCta";
import { Footer } from "./components/Footer";
import { CookieConsent } from "./components/CookieConsent";
import SolarPressureWidget from "./components/SolarPressureWidget";
import { ErrorBoundary, NASAApiErrorBoundary } from "./components/ErrorBoundary";

// ── Lazy: below-the-fold homepage components ───────────────────────────────
const DailySpaceFacts = lazy(() => import("./components/DailySpaceFacts").then(m => ({ default: m.DailySpaceFacts })));
const ISSTracker      = lazy(() => import("./components/ISSTracker").then(m => ({ default: m.ISSTracker })));
const NearEarthObjects = lazy(() => import("./components/NearEarthObjects").then(m => ({ default: m.NearEarthObjects })));
const ImpactRisks     = lazy(() => import("./components/ImpactRisks").then(m => ({ default: m.ImpactRisks })));
const PlanetPositions = lazy(() => import("./components/PlanetPositions").then(m => ({ default: m.PlanetPositions })));
const ArticleTeaser   = lazy(() => import("./components/ArticleTeaser").then(m => ({ default: m.ArticleTeaser })));

// ── Lazy: route pages ────────────────────────────────────────────
const ArticlesPage   = lazy(() => import("./pages/ArticlesPage").then(m => ({ default: m.ArticlesPage })));
const ArticlePage    = lazy(() => import("./pages/ArticlePage").then(m => ({ default: m.ArticlePage })));
const EarthPage      = lazy(() => import("./pages/EarthPage").then(m => ({ default: m.EarthPage })));
const MarsRoverPage  = lazy(() => import("./pages/MarsRoverPage").then(m => ({ default: m.MarsRoverPage })));
const ImpressumPage  = lazy(() => import("./pages/ImpressumPage").then(m => ({ default: m.ImpressumPage })));
const DatenschutzPage = lazy(() => import("./pages/DatenschutzPage").then(m => ({ default: m.DatenschutzPage })));
const NotFoundPage   = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

// Sanitize: strip any "www." — the canonical domain is bazodiac.space (no www)
const BAZODIAC_URL = (import.meta.env.VITE_BAZODIAC_URL || "https://bazodiac.space")
  .replace("://www.", "://");

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

export default function App() {
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen font-sans selection:bg-[#D4AF37]/20">
        {/* Film grain texture */}
        <div className="fixed inset-0 z-[100] sky-grain pointer-events-none" />

        <Header lang={lang} setLang={setLang} t={t} bazodiacUrl={BAZODIAC_URL} />

        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<HomePage lang={lang} t={t} />} />
            <Route path="/artikel" element={<ArticlesPage lang={lang} t={t} bazodiacUrl={BAZODIAC_URL} />} />
            <Route path="/artikel/:slug" element={<ArticlePage lang={lang} t={t} bazodiacUrl={BAZODIAC_URL} />} />
            <Route path="/erde" element={<EarthPage lang={lang} t={t} />} />
            <Route path="/mars-rover" element={<MarsRoverPage lang={lang} t={t} />} />
            <Route path="/impressum" element={<ImpressumPage lang={lang} />} />
            <Route path="/datenschutz" element={<DatenschutzPage lang={lang} />} />
            <Route path="*" element={<NotFoundPage lang={lang} />} />
          </Routes>
        </Suspense>

        <Footer t={t} bazodiacUrl={BAZODIAC_URL} lang={lang} />
        <CookieConsent lang={lang} />
      </div>
    </ErrorBoundary>
  );
}
