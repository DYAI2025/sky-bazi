import { Routes, Route } from "react-router-dom";
import { useLang } from "./lib/i18n";
import { Header } from "./components/Header";
import { ApodHero } from "./components/ApodHero";
import { SpaceWeather } from "./components/SpaceWeather";
import { PlanetPositions } from "./components/PlanetPositions";
import { FunnelCta } from "./components/FunnelCta";
import { Footer } from "./components/Footer";
import { ArticlesPage } from "./pages/ArticlesPage";
import { ArticlePage } from "./pages/ArticlePage";
import { ArticleTeaser } from "./components/ArticleTeaser";
import { NearEarthObjects } from "./components/NearEarthObjects";
import { ImpactRisks } from "./components/ImpactRisks";
import { EarthPage } from "./pages/EarthPage";
import { MarsRoverPage } from "./pages/MarsRoverPage";
import { ImpressumPage } from "./pages/ImpressumPage";
import { DatenschutzPage } from "./pages/DatenschutzPage";
import { CookieConsent } from "./components/CookieConsent";

const BAZODIAC_URL = import.meta.env.VITE_BAZODIAC_URL || "https://bazodiac.space";

function HomePage({ lang, t }: { lang: "de" | "en"; t: (k: string) => string }) {
  return (
    <>
      <ApodHero t={t} />
      <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} />
      <SpaceWeather t={t} lang={lang} />
      <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} variant="weather" />
      <NearEarthObjects lang={lang} />
      <ImpactRisks lang={lang} />
      <PlanetPositions lang={lang} t={t} />
      <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} />
      <ArticleTeaser lang={lang} />
    </>
  );
}

export default function App() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="min-h-screen font-sans selection:bg-[#D4AF37]/20">
      {/* Film grain texture */}
      <div className="fixed inset-0 z-[100] sky-grain pointer-events-none" />

      <Header lang={lang} setLang={setLang} t={t} bazodiacUrl={BAZODIAC_URL} />

      <Routes>
        <Route path="/" element={<HomePage lang={lang} t={t} />} />
        <Route path="/artikel" element={<ArticlesPage lang={lang} t={t} bazodiacUrl={BAZODIAC_URL} />} />
        <Route path="/artikel/:slug" element={<ArticlePage lang={lang} t={t} bazodiacUrl={BAZODIAC_URL} />} />
        <Route path="/erde" element={<EarthPage lang={lang} t={t} />} />
        <Route path="/mars-rover" element={<MarsRoverPage lang={lang} t={t} />} />
        <Route path="/impressum" element={<ImpressumPage lang={lang} />} />
        <Route path="/datenschutz" element={<DatenschutzPage lang={lang} />} />
        <Route path="*" element={<HomePage lang={lang} t={t} />} />
      </Routes>

      <Footer t={t} bazodiacUrl={BAZODIAC_URL} lang={lang} />
      <CookieConsent lang={lang} />
    </div>
  );
}
