import { useMemo } from "react";
import { Globe } from "lucide-react";
import {
  calculatePlanetPositions,
  calculateSunPosition,
  calculateMoonPosition,
} from "../services/planets";
import type { Lang } from "../lib/i18n";

interface PlanetPositionsProps {
  lang: Lang;
  t: (key: string) => string;
}

export function PlanetPositions({ lang, t }: PlanetPositionsProps) {
  const now = useMemo(() => new Date(), []);
  const sun = useMemo(() => calculateSunPosition(now), [now]);
  const moon = useMemo(() => calculateMoonPosition(now), [now]);
  const planets = useMemo(() => calculatePlanetPositions(now), [now]);

  const signName = (sign: { name: string; nameDe: string }) =>
    lang === "de" ? sign.nameDe : sign.name;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <div className="sky-card p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-serif text-2xl sm:text-3xl tracking-wide">
            {t("planets.title")}
          </h2>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[rgba(215,230,255,0.30)] mb-8">
          {t("planets.subtitle")}
        </p>

        {/* Planet Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Sun */}
          <PlanetCard
            symbol={sun.symbol}
            name={lang === "de" ? sun.nameDe : sun.name}
            signGlyph={sun.sign.glyph}
            signName={signName(sun.sign)}
            degree={sun.degree}
            accent="#F59E0B"
          />

          {/* Moon */}
          <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] p-4 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">{moon.phaseEmoji}</span>
            <span className="text-xs font-sans text-[rgba(215,230,255,0.70)] mb-2">
              {lang === "de" ? moon.phaseNameDe : moon.phaseName}
            </span>
            <span className="text-xl leading-none mb-0.5 text-[rgba(215,230,255,0.60)]">
              {moon.sign.glyph}
            </span>
            <span className="text-[10px] text-[rgba(215,230,255,0.40)]">
              {signName(moon.sign)} {moon.degree.toFixed(0)}&deg;
            </span>
          </div>

          {/* Planets */}
          {planets.map((p) => (
            <PlanetCard
              key={p.name}
              symbol={p.symbol}
              name={lang === "de" ? p.nameDe : p.name}
              signGlyph={p.sign.glyph}
              signName={signName(p.sign)}
              degree={p.degree}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanetCard({
  symbol,
  name,
  signGlyph,
  signName,
  degree,
  accent,
}: {
  symbol: string;
  name: string;
  signGlyph: string;
  signName: string;
  degree: number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] p-4 flex flex-col items-center text-center hover:border-[rgba(90,150,240,0.25)] transition-colors">
      <span
        className="text-2xl mb-1 leading-none"
        style={accent ? { color: accent } : undefined}
      >
        {symbol}
      </span>
      <span className="text-[10px] uppercase tracking-[0.15em] text-[rgba(215,230,255,0.45)] mb-3">
        {name}
      </span>
      <span className="text-xl leading-none mb-0.5 text-[rgba(215,230,255,0.60)]">
        {signGlyph}
      </span>
      <span className="text-[10px] text-[rgba(215,230,255,0.40)]">
        {signName} {degree.toFixed(0)}&deg;
      </span>
    </div>
  );
}
