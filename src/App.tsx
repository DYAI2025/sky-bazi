import { useLang } from "./lib/i18n";
import { Header } from "./components/Header";
import { ApodHero } from "./components/ApodHero";
import { SpaceWeather } from "./components/SpaceWeather";
import { PlanetPositions } from "./components/PlanetPositions";
import { FunnelCta } from "./components/FunnelCta";
import { Footer } from "./components/Footer";

const BAZODIAC_URL = import.meta.env.VITE_BAZODIAC_URL || "https://bazodiac.space";

export default function App() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="min-h-screen font-sans selection:bg-[#D4AF37]/20">
      {/* Film grain texture */}
      <div className="fixed inset-0 z-[100] sky-grain" />

      {/* Header */}
      <Header lang={lang} setLang={setLang} t={t} bazodiacUrl={BAZODIAC_URL} />

      {/* Hero — NASA Astronomy Picture of the Day */}
      <ApodHero t={t} />

      {/* Funnel CTA 1 — after hero */}
      <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} />

      {/* Space Weather — DONKI live data */}
      <SpaceWeather t={t} />

      {/* Funnel CTA 2 — weather variant */}
      <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} variant="weather" />

      {/* Planet Positions — real-time calculations */}
      <PlanetPositions lang={lang} t={t} />

      {/* Funnel CTA 3 — after planets */}
      <FunnelCta t={t} bazodiacUrl={BAZODIAC_URL} />

      {/* Footer */}
      <Footer t={t} bazodiacUrl={BAZODIAC_URL} />
    </div>
  );
}
