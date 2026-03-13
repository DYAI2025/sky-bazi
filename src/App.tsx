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

const BAZODIAC_URL = import.meta.env.VITE_BAZODIAC_URL || "https://bazodiac.space";

function HomePage({ lang, t }: { lang: "de" | "en"; t: (k: string) => string }) {
  return (
    <>
      <ApodHero t={t} />
      <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} />
      <SpaceWeather t={t} />
      <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} variant="weather" />
      <PlanetPositions lang={lang} t={t} />
      <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} />
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
        <Route path="*" element={<HomePage lang={lang} t={t} />} />
      </Routes>

      <Footer t={t} bazodiacUrl={BAZODIAC_URL} />
    </div>
  );
}
