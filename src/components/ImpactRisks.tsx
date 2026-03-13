import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { fetchSentryData, type SentryFeedData, type SentryObject } from "../services/nasa";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
}

// ── Palermo Scale ─────────────────────────────────────────────────────────
// Logarithmic scale: > 0 = exceeds background risk, < -5 = negligible

interface PalermoInfo {
  color: string;
  bgAlpha: string;
  label: { de: string; en: string };
}

function getPalermoInfo(psMax: number): PalermoInfo {
  if (psMax > 0) return {
    color: "#ef4444",
    bgAlpha: "12",
    label: { de: "Erhöhtes Risiko", en: "Elevated risk" },
  };
  if (psMax > -2) return {
    color: "#f97316",
    bgAlpha: "0f",
    label: { de: "Beobachtungswert", en: "Notable concern" },
  };
  if (psMax > -5) return {
    color: "#eab308",
    bgAlpha: "0d",
    label: { de: "Unter Beobachtung", en: "Under observation" },
  };
  return {
    color: "#818cf8",
    bgAlpha: "0d",
    label: { de: "Hintergrundniveau", en: "Background level" },
  };
}

// ── Turin Scale ────────────────────────────────────────────────────────────

function getTurinInfo(tsMax: number): { safe: boolean; color: string; label: { de: string; en: string } } {
  if (tsMax === 0) return {
    safe: true,
    color: "#22c55e",
    label: { de: "Keine akute Gefahr bekannt", en: "No acute threat known" },
  };
  if (tsMax <= 2) return {
    safe: false,
    color: "#eab308",
    label: { de: "Genaue Beobachtung erforderlich", en: "Close observation required" },
  };
  return {
    safe: false,
    color: "#ef4444",
    label: { de: "Potenziell ernstes Risiko", en: "Potentially serious risk" },
  };
}

// ── Size comparison (diameter in km → meters) ─────────────────────────────

function getSentrySize(diamKm: number): { icon: string; label: { de: string; en: string } } {
  const m = diamKm * 1000;
  if (m < 10) return { icon: "🚌", label: { de: `${Math.round(m)} m · Schulbus-Größe`, en: `${Math.round(m)} m · School bus` } };
  if (m < 30) return { icon: "🐋", label: { de: `${Math.round(m)} m · Blauwal-Größe`, en: `${Math.round(m)} m · Blue whale` } };
  if (m < 100) return { icon: "🏊", label: { de: `${Math.round(m)} m · Schwimmbecken`, en: `${Math.round(m)} m · Swimming pool` } };
  if (m < 300) return { icon: "🗽", label: { de: `${Math.round(m)} m · Freiheitsstatue`, en: `${Math.round(m)} m · Statue of Liberty` } };
  if (m < 600) return { icon: "🏟️", label: { de: `${Math.round(m)} m · Fußballstadion`, en: `${Math.round(m)} m · Football stadium` } };
  if (m < 1500) return { icon: "🗼", label: { de: `${(m / 1000).toFixed(1)} km · Eiffelturm-Klasse`, en: `${(m / 1000).toFixed(1)} km · Eiffel Tower class` } };
  if (m < 5000) return { icon: "🌉", label: { de: `${(m / 1000).toFixed(1)} km · Manhattan-Breite`, en: `${(m / 1000).toFixed(1)} km · Manhattan width` } };
  return { icon: "🏔️", label: { de: `${(m / 1000).toFixed(1)} km · Planetenkiller`, en: `${(m / 1000).toFixed(1)} km · Planet-killer` } };
}

// ── Countdown ──────────────────────────────────────────────────────────────

function getCountdown(range: string, lang: Lang): string {
  // range = "2046" or "2046-2080"
  const firstYear = parseInt(range.split("-")[0], 10);
  const lastYear  = parseInt(range.split("-").pop()!, 10);
  const now       = new Date().getFullYear();
  const yearsTo   = firstYear - now;
  const span      = lastYear - firstYear;

  if (lang === "de") {
    let s = yearsTo <= 0 ? "Zeitfenster läuft" : `Noch ~${yearsTo} Jahr${yearsTo !== 1 ? "e" : ""}`;
    if (span > 0) s += ` (bis ${lastYear})`;
    return s;
  }
  let s = yearsTo <= 0 ? "Window active" : `~${yearsTo} year${yearsTo !== 1 ? "s" : ""} away`;
  if (span > 0) s += ` (through ${lastYear})`;
  return s;
}

// ── Probability formatting ─────────────────────────────────────────────────

function formatProbability(ip: string, lang: Lang): { ratio: string; percent: string } {
  const p = parseFloat(ip);
  if (!p || p <= 0) return { ratio: "—", percent: "—" };
  const oneInX = Math.round(1 / p);
  const pct    = (p * 100).toPrecision(3);
  const localeOpts = lang === "de" ? "de-DE" : "en-US";
  return {
    ratio:   `1 : ${oneInX.toLocaleString(localeOpts)}`,
    percent: `${pct} %`,
  };
}

// ── Speed formatting ───────────────────────────────────────────────────────

function formatSpeedKmh(vInfKms: string, lang: Lang): string {
  const kmh = parseFloat(vInfKms) * 3600;
  return Math.round(kmh).toLocaleString(lang === "de" ? "de-DE" : "en-US") + " km/h";
}

// ── Clean name ─────────────────────────────────────────────────────────────

function cleanFullname(fullname: string): string {
  // "(29075) 1950 DA" → "29075 1950 DA" | "(2023 DW)" → "2023 DW"
  return fullname.replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
}

// ── Threat Card ────────────────────────────────────────────────────────────

function ThreatCard({ obj, lang }: { obj: SentryObject; lang: Lang }) {
  const psMax    = parseFloat(obj.ps_max);
  const tsMax    = parseInt(obj.ts_max ?? "0", 10) || 0;
  const palermo  = getPalermoInfo(psMax);
  const turin    = getTurinInfo(tsMax);
  const prob     = formatProbability(obj.ip, lang);
  // `des` is the clean primary designation e.g. "1950 DA", "101955 Bennu", "2023 DW"
  const name     = obj.des;
  const countdown = getCountdown(obj.range, lang);
  const flybyChance = obj.ip
    ? `${((1 - parseFloat(obj.ip)) * 100).toFixed(2)} %`
    : "—";

  const diamKm = parseFloat(obj.diameter);
  const size = !isNaN(diamKm) && diamKm > 0 ? getSentrySize(diamKm) : null;
  const speed = obj.v_inf ? formatSpeedKmh(obj.v_inf, lang) : null;

  return (
    <div
      className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] p-4 flex flex-col gap-3"
      style={{ borderTopColor: palermo.color, borderTopWidth: "2px" }}
    >
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <p className="font-serif text-base text-white leading-tight">☄️ {name}</p>
        <span
          className="self-start text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 rounded"
          style={{
            color: palermo.color,
            backgroundColor: `${palermo.color}${palermo.bgAlpha}`,
          }}
        >
          {palermo.label[lang]}
        </span>
      </div>

      {/* Data rows */}
      <div className="space-y-2">

        {/* Impact probability */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[rgba(215,230,255,0.35)] mb-0.5">
            {lang === "de" ? "Einschlags-Chance" : "Impact probability"}
          </p>
          <p className="text-[13px] font-serif font-semibold" style={{ color: palermo.color }}>
            {prob.ratio}
          </p>
          <p className="text-[10px] text-[rgba(215,230,255,0.40)] mt-0.5">
            {lang === "de"
              ? `Entwarnung: Chance auf Vorbeiflug ${flybyChance}`
              : `Flyby chance: ${flybyChance}`}
          </p>
        </div>

        {/* Year range + countdown */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[rgba(215,230,255,0.35)] mb-0.5">
            {lang === "de" ? "Möglicher Kontakt" : "Possible contact"}
          </p>
          <p className="text-[11px] font-medium text-[rgba(215,230,255,0.80)]">{obj.range}</p>
          <p className="text-[10px] text-[rgba(215,230,255,0.40)]">{countdown}</p>
        </div>

        {/* Size (if available) */}
        {size && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm leading-none">{size.icon}</span>
            <p className="text-[10px] text-[rgba(215,230,255,0.50)]">{size.label[lang]}</p>
          </div>
        )}

        {/* Speed (if available) */}
        {speed && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm leading-none">🚀</span>
            <p className="text-[10px] text-[rgba(215,230,255,0.50)]">{speed}</p>
          </div>
        )}

      </div>

      {/* Turin Scale safety badge */}
      <div
        className="mt-auto rounded-lg px-3 py-2 flex items-center gap-2"
        style={{
          backgroundColor: `${turin.color}12`,
          borderLeft: `2px solid ${turin.color}`,
        }}
      >
        <span className="text-xs leading-none font-bold" style={{ color: turin.color }}>
          {turin.safe ? "✓" : "!"}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-medium leading-tight" style={{ color: turin.color }}>
            {lang === "de" ? `Turiner Skala: ${tsMax}` : `Turin Scale: ${tsMax}`}
          </p>
          <p className="text-[10px] text-[rgba(215,230,255,0.40)] mt-0.5">
            {turin.label[lang]}
          </p>
        </div>
      </div>

    </div>
  );
}

// ── Palermo Scale Legend ───────────────────────────────────────────────────

function PalermoLegend({ lang }: { lang: Lang }) {
  const items = [
    { color: "#818cf8", label: lang === "de" ? "< -5 · Hintergrundniveau" : "< -5 · Background level" },
    { color: "#eab308", label: lang === "de" ? "-5 bis -2 · Beobachtung"  : "-5 to -2 · Observed" },
    { color: "#f97316", label: lang === "de" ? "-2 bis 0 · Beachtenswert"  : "-2 to 0 · Notable" },
    { color: "#ef4444", label: lang === "de" ? "> 0 · Erhöhtes Risiko"    : "> 0 · Elevated risk" },
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
      {items.map((item) => (
        <div key={item.color} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[10px] text-[rgba(215,230,255,0.45)]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function ImpactRisks({ lang }: Props) {
  const [data, setData] = useState<SentryFeedData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSentryData()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) return null;

  if (!data) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
        <div className="sky-card p-8">
          <div className="h-4 w-48 sky-skeleton mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-52 sky-skeleton rounded-xl" />
            <div className="h-52 sky-skeleton rounded-xl" />
            <div className="h-52 sky-skeleton rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  const top = data.objects.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <div className="sky-card p-6 sm:p-8">

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-serif text-2xl sm:text-3xl tracking-wide">
            {lang === "de" ? "Einschlags-Risiken" : "Impact Risks"}
          </h2>
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[rgba(215,230,255,0.40)] mb-3">
          {lang === "de"
            ? "Langzeitüberwachung — NASA JPL Sentry"
            : "Long-term monitoring — NASA JPL Sentry"}
        </p>

        {/* Palermo scale legend */}
        <PalermoLegend lang={lang} />

        {/* Threat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-6 mb-6">
          {top.map((obj) => (
            <ThreatCard key={obj.des} obj={obj} lang={lang} />
          ))}
        </div>

        {/* Context note */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)]">
          <span className="text-[#22c55e] text-sm shrink-0 font-bold mt-0.5">✓</span>
          <p className="text-[11px] text-[rgba(215,230,255,0.50)] leading-relaxed">
            {lang === "de"
              ? "Alle gelisteten Objekte liegen auf der Turiner Skala bei 0 — keine akute Bedrohung. Die Palermo-Skala misst das Risiko im Vergleich zur statistischen Hintergrundrate. Quelle: NASA JPL Center for Near Earth Object Studies (CNEOS) · Sentry-System."
              : "All listed objects score 0 on the Turin Scale — no acute threat. The Palermo Scale measures risk relative to the statistical background rate. Source: NASA JPL Center for Near Earth Object Studies (CNEOS) · Sentry System."}
          </p>
        </div>

      </div>
    </section>
  );
}
