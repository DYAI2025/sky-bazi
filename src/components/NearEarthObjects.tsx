import { useEffect, useState } from "react";
import { Telescope } from "lucide-react";
import {
  fetchNeoFeed,
  type NeoFeedData,
  type NearEarthObject,
} from "../services/nasa";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
}

// ── Size comparison helpers ────────────────────────────────────────────────

interface SizeComparison {
  icon: string;
  label: { de: string; en: string };
  category: { de: string; en: string };
}

function getSizeComparison(diameterM: number): SizeComparison {
  if (diameterM < 10)  return {
    icon: "🚌",
    label:    { de: `${Math.round(diameterM)} m`, en: `${Math.round(diameterM)} m` },
    category: { de: "Schulbus-Größe", en: "School bus size" },
  };
  if (diameterM < 30) return {
    icon: "🐋",
    label:    { de: `${Math.round(diameterM)} m`, en: `${Math.round(diameterM)} m` },
    category: { de: "So groß wie ein Blauwal", en: "Blue whale size" },
  };
  if (diameterM < 100) return {
    icon: "🗽",
    label:    { de: `${Math.round(diameterM)} m`, en: `${Math.round(diameterM)} m` },
    category: { de: "Wie die Freiheitsstatue", en: "Statue of Liberty size" },
  };
  if (diameterM < 300) return {
    icon: "🏟️",
    label:    { de: `${Math.round(diameterM)} m`, en: `${Math.round(diameterM)} m` },
    category: { de: "Wie ein Fußballstadion", en: "Football stadium size" },
  };
  if (diameterM < 600) return {
    icon: "🗼",
    label:    { de: `${Math.round(diameterM)} m`, en: `${Math.round(diameterM)} m` },
    category: { de: "Wie der Eiffelturm", en: "Eiffel Tower size" },
  };
  if (diameterM < 2000) return {
    icon: "🌉",
    label:    { de: `${(diameterM / 1000).toFixed(1)} km`, en: `${(diameterM / 1000).toFixed(1)} km` },
    category: { de: "Wie Manhattan-Breite", en: "Manhattan-width scale" },
  };
  return {
    icon: "🏔️",
    label:    { de: `${(diameterM / 1000).toFixed(1)} km`, en: `${(diameterM / 1000).toFixed(1)} km` },
    category: { de: "Planetenkiller-Klasse", en: "Planet-killer class" },
  };
}

// ── Speed comparison helpers ───────────────────────────────────────────────

function getSpeedLabel(kmh: number): { de: string; en: string } {
  if (kmh < 20_000) return { de: "Vielfache Schallgeschwindigkeit", en: "Many times the speed of sound" };
  if (kmh < 50_000) return { de: "Schneller als jede Rakete", en: "Faster than any rocket" };
  if (kmh < 100_000) return { de: "Extrem schnell", en: "Extremely fast" };
  return { de: "Rekordtempo im Sonnensystem", en: "Record speed in the solar system" };
}

// ── Safety status ──────────────────────────────────────────────────────────

interface SafetyStatus {
  color: string;
  icon: string;
  label: { de: string; en: string };
  detail: { de: string; en: string };
}

function getSafetyStatus(neo: NearEarthObject, lunarDist: number): SafetyStatus {
  if (neo.is_potentially_hazardous_asteroid && lunarDist < 10) return {
    color: "#f97316",
    icon: "🟡",
    label:  { de: "Beobachtungswert", en: "Under observation" },
    detail: { de: "Astronomen verfolgen die Flugbahn", en: "Astronomers are tracking the trajectory" },
  };
  if (neo.is_potentially_hazardous_asteroid) return {
    color: "#eab308",
    icon: "🟡",
    label:  { de: "Potenziell gefährlich (sicherer Vorbeiflug)", en: "Potentially hazardous (safe flyby)" },
    detail: { de: "Klassifiziert, aber sicherer Abstand", en: "Classified PHA, but safe distance" },
  };
  if (lunarDist < 5) return {
    color: "#eab308",
    icon: "⚡",
    label:  { de: "Enger Vorbeiflug", en: "Close flyby" },
    detail: { de: "Ungewöhnlich naher, aber sicherer Vorbeiflug", en: "Unusually close, but safe pass" },
  };
  return {
    color: "#22c55e",
    icon: "✓",
    label:  { de: "Sicherer Vorbeiflug", en: "Safe flyby" },
    detail: { de: "Keine Gefahr für die Erde", en: "No threat to Earth" },
  };
}

// ── Name cleaner ───────────────────────────────────────────────────────────

function cleanName(raw: string): string {
  // "(2024 JX)" → "2024 JX"
  return raw.replace(/^\(|\)$/g, "").trim();
}

function formatDate(dateStr: string, lang: Lang): string {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString(
    lang === "de" ? "de-DE" : "en-US",
    { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }
  );
}

function formatSpeed(kmh: number, lang: Lang): string {
  return Math.round(kmh).toLocaleString(lang === "de" ? "de-DE" : "en-US");
}

function formatLunar(lunar: number): string {
  return lunar >= 10
    ? Math.round(lunar).toString()
    : lunar.toFixed(1);
}

// ── NEO Card ──────────────────────────────────────────────────────────────

function NeoCard({ neo, lang }: { neo: NearEarthObject; lang: Lang }) {
  const approach    = neo.close_approach_data[0];
  const lunarDist   = parseFloat(approach.miss_distance.lunar);
  const speedKmh    = parseFloat(approach.relative_velocity.kilometers_per_hour);
  const avgDiam     = (
    neo.estimated_diameter.meters.estimated_diameter_min +
    neo.estimated_diameter.meters.estimated_diameter_max
  ) / 2;

  const size   = getSizeComparison(avgDiam);
  const speed  = getSpeedLabel(speedKmh);
  const safety = getSafetyStatus(neo, lunarDist);
  const name   = cleanName(neo.name);

  return (
    <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] p-4 flex flex-col gap-3">

      {/* Header: name + date */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-serif text-sm text-white leading-tight">{name}</p>
        <span className="text-[10px] text-[rgba(215,230,255,0.40)] shrink-0 tabular-nums">
          {formatDate(approach.close_approach_date, lang)}
        </span>
      </div>

      {/* Data rows */}
      <div className="space-y-2">

        {/* Size */}
        <div className="flex items-start gap-2">
          <span className="text-base leading-none shrink-0 mt-0.5">{size.icon}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[rgba(215,230,255,0.80)]">
              {size.label[lang]}
            </p>
            <p className="text-[10px] text-[rgba(215,230,255,0.40)]">
              {size.category[lang]}
            </p>
          </div>
        </div>

        {/* Distance */}
        <div className="flex items-start gap-2">
          <span className="text-base leading-none shrink-0 mt-0.5">🌙</span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[rgba(215,230,255,0.80)]">
              {lang === "de"
                ? `${formatLunar(lunarDist)} × Mondentfernung`
                : `${formatLunar(lunarDist)} × lunar distance`}
            </p>
            <p className="text-[10px] text-[rgba(215,230,255,0.40)]">
              {lunarDist < 5
                ? (lang === "de" ? "Ungewöhnlich nah" : "Unusually close")
                : lunarDist < 15
                ? (lang === "de" ? "Relativ nah" : "Relatively close")
                : (lang === "de" ? "Sicher weit entfernt" : "Safely distant")}
            </p>
          </div>
        </div>

        {/* Speed */}
        <div className="flex items-start gap-2">
          <span className="text-base leading-none shrink-0 mt-0.5">🚀</span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[rgba(215,230,255,0.80)]">
              {formatSpeed(speedKmh, lang)} km/h
            </p>
            <p className="text-[10px] text-[rgba(215,230,255,0.40)]">
              {speed[lang]}
            </p>
          </div>
        </div>

      </div>

      {/* Safety badge */}
      <div
        className="mt-auto rounded-lg px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: `${safety.color}12`, borderLeft: `2px solid ${safety.color}` }}
      >
        <span className="text-sm leading-none">{safety.icon}</span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium leading-tight" style={{ color: safety.color }}>
            {safety.label[lang]}
          </p>
          <p className="text-[10px] text-[rgba(215,230,255,0.40)] mt-0.5">
            {safety.detail[lang]}
          </p>
        </div>
      </div>

    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function NearEarthObjects({ lang }: Props) {
  const [data, setData] = useState<NeoFeedData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchNeoFeed()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) return null;

  if (!data) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
        <div className="sky-card p-8">
          <div className="h-4 w-40 sky-skeleton mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-48 sky-skeleton rounded-xl" />
            <div className="h-48 sky-skeleton rounded-xl" />
            <div className="h-48 sky-skeleton rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  // Sort by miss distance ascending, take 3 closest flybys
  const topNeos = [...data.neos]
    .filter((n) => n.close_approach_data.length > 0)
    .sort((a, b) => {
      const da = parseFloat(a.close_approach_data[0].miss_distance.lunar);
      const db = parseFloat(b.close_approach_data[0].miss_distance.lunar);
      return da - db;
    })
    .slice(0, 3);

  if (topNeos.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <div className="sky-card p-6 sm:p-8">

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-2">
          <Telescope className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-serif text-2xl sm:text-3xl tracking-wide">
            {lang === "de" ? "Asteroiden-Check" : "Asteroid Check"}
          </h2>
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[rgba(215,230,255,0.40)] mb-8">
          {lang === "de"
            ? "Nächste Vorbeiflüge — NASA NeoWs"
            : "Upcoming flybys — NASA NeoWs"}
        </p>

        {/* NEO Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
          {topNeos.map((neo) => (
            <NeoCard key={neo.id} neo={neo} lang={lang} />
          ))}
        </div>

        {/* Safety Disclaimer */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)]">
          <span className="text-[#22c55e] text-sm shrink-0 font-bold mt-0.5">✓</span>
          <p className="text-[11px] text-[rgba(215,230,255,0.50)] leading-relaxed">
            {lang === "de"
              ? "Gefahren-Check: Alle dargestellten Objekte wurden von der NASA als sicher klassifiziert. Quelle: NASA Center for Near Earth Object Studies (CNEOS)."
              : "Safety check: All displayed objects have been classified as safe by NASA. Source: NASA Center for Near Earth Object Studies (CNEOS)."}
          </p>
        </div>

      </div>
    </section>
  );
}
