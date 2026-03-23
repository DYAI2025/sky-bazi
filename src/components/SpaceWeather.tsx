import { useEffect, useState } from "react";
import { Sun, Zap, Activity } from "lucide-react";
import {
  fetchSpaceWeather,
  classifyFlareActivity,
  classifyGeoActivity,
  type SpaceWeatherData,
  type SolarActivityLevel,
  type CME,
  type CmeAnalysis,
} from "../services/nasa";
import type { Lang } from "../lib/i18n";

interface SpaceWeatherProps {
  t: (key: string) => string;
  lang: Lang;
}

const LEVEL_COLORS: Record<SolarActivityLevel, string> = {
  quiet:  "#22c55e",
  active: "#eab308",
  storm:  "#f97316",
  severe: "#ef4444",
};

const LEVEL_LABEL_KEY: Record<SolarActivityLevel, string> = {
  quiet:  "weather.quiet",
  active: "weather.active",
  storm:  "weather.storm",
  severe: "weather.severe",
};

// ── Kp Intensity Scale ─────────────────────────────────────────────────────

interface KpTier {
  range: string;
  minKp: number;
  maxKp: number;
  color: string;
  label: { de: string; en: string };
  visibility: { de: string; en: string };
  tech: { de: string; en: string };
}

const KP_TIERS: KpTier[] = [
  {
    range: "Kp 1–4",
    minKp: 0,
    maxKp: 4,
    color: "#22c55e",
    label:      { de: "Ruhig bis Aktiv",    en: "Quiet to Active" },
    visibility: { de: "Nur im hohen Norden", en: "High latitudes only" },
    tech:       { de: "Alles normal",        en: "All systems normal" },
  },
  {
    range: "Kp 5–6",
    minKp: 5,
    maxKp: 6,
    color: "#eab308",
    label:      { de: "Moderater Sturm",    en: "Moderate Storm" },
    visibility: { de: "Norddeutschland",    en: "Northern Germany" },
    tech:       { de: "GPS leicht ungenau", en: "GPS slightly impaired" },
  },
  {
    range: "Kp 7–8",
    minKp: 7,
    maxKp: 8,
    color: "#f97316",
    label:      { de: "Schwerer Sturm",          en: "Severe Storm" },
    visibility: { de: "Ganz Deutschland",         en: "All of Germany" },
    tech:       { de: "Funkstörungen möglich",    en: "Radio interference possible" },
  },
  {
    range: "Kp 9",
    minKp: 9,
    maxKp: 9,
    color: "#ef4444",
    label:      { de: "Extremer Sturm",          en: "Extreme Storm" },
    visibility: { de: "Bis zum Mittelmeer",      en: "To the Mediterranean" },
    tech:       { de: "Vorsicht bei Elektronik", en: "Caution with electronics" },
  },
];

function getActiveTierIndex(kp: number): number {
  if (kp >= 9) return 3;
  if (kp >= 7) return 2;
  if (kp >= 5) return 1;
  return 0;
}

// ── Solar Event Helpers ───────────────────────────────────────────────────

interface FlareGrade {
  letter: string;
  color: string;
  label: { de: string; en: string };
  impact: { de: string; en: string };
}

function classifyFlareGrade(classType: string): FlareGrade {
  const letter = classType.charAt(0).toUpperCase();
  if (letter === "X") return {
    letter: "X",
    color: "#ef4444",
    label:  { de: "Extrem",  en: "Extreme" },
    impact: { de: "Weitreichende Funk- und GPS-Störungen möglich", en: "Widespread radio & GPS disruption possible" },
  };
  if (letter === "M") return {
    letter: "M",
    color: "#f97316",
    label:  { de: "Mittel",  en: "Moderate" },
    impact: { de: "Kurzwellenfunk und GPS können gestört sein", en: "Shortwave radio & GPS may be disrupted" },
  };
  if (letter === "C") return {
    letter: "C",
    color: "#eab308",
    label:  { de: "Schwach", en: "Minor" },
    impact: { de: "Geringe Auswirkungen auf Funkkommunikation", en: "Minor impact on radio communication" },
  };
  return {
    letter: "B",
    color: "#22c55e",
    label:  { de: "Minimal", en: "Minimal" },
    impact: { de: "Keine nennenswerten Auswirkungen", en: "No notable impact" },
  };
}

function timeAgo(dateStr: string, lang: Lang): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(hours / 24);
  if (lang === "de") {
    if (minutes < 60) return `vor ${minutes} Min.`;
    if (hours < 24)   return `vor ${hours} Std.`;
    return `vor ${days} Tag${days !== 1 ? "en" : ""}`;
  }
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24)   return `${hours}h ago`;
  return `${days}d ago`;
}

function countdown(futureDate: string, lang: Lang): string {
  const diff = new Date(futureDate).getTime() - Date.now();
  if (diff <= 0) return lang === "de" ? "Bereits angekommen" : "Already arrived";
  const totalH = Math.round(diff / 3_600_000);
  const days   = Math.floor(totalH / 24);
  const remH   = totalH % 24;
  if (lang === "de") {
    if (days > 0) return `In ${days}T ${remH}Std.`;
    return `In ${totalH} Stunde${totalH !== 1 ? "n" : ""}`;
  }
  if (days > 0) return `In ${days}d ${remH}h`;
  return `In ${totalH} hour${totalH !== 1 ? "s" : ""}`;
}

function classifySpeed(speed: number): { label: { de: string; en: string } } {
  if (speed >= 1500) return { label: { de: "Extrem schnell", en: "Extreme speed" } };
  if (speed >= 1000) return { label: { de: "Sehr schnell",   en: "Very fast" } };
  if (speed >= 500)  return { label: { de: "Schnell",        en: "Fast" } };
  return               { label: { de: "Normal",          en: "Normal speed" } };
}

function getInstrumentName(instruments?: Array<{ displayName: string }>): string {
  if (!instruments || instruments.length === 0) return "";
  // "GOES-P: GOES-P 0.5-4.0" → "GOES-P" | "SOHO: LASCO/C2" → "SOHO"
  return instruments[0].displayName.split(":")[0].trim();
}

interface BestCmeResult {
  cme: CME;
  analysis: CmeAnalysis;
  isEarthTargeted: boolean;
  arrivalTime: string | null;
}

function findBestCme(cmes: CME[]): BestCmeResult | null {
  const withAnalysis = cmes.filter(
    (c) => c.cmeAnalyses && c.cmeAnalyses.length > 0
  );
  if (withAnalysis.length === 0) return null;

  // Prefer Earth-targeted CMEs, then sort by recency
  withAnalysis.sort((a, b) => {
    const aEarth = a.cmeAnalyses!.some((an) =>
      an.enlilList?.some((e) => e.isEarthTargeted)
    );
    const bEarth = b.cmeAnalyses!.some((an) =>
      an.enlilList?.some((e) => e.isEarthTargeted)
    );
    if (aEarth && !bEarth) return -1;
    if (!aEarth && bEarth) return 1;
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  const cme      = withAnalysis[0];
  const analysis = cme.cmeAnalyses!.find((a) => a.isMostAccurate) ?? cme.cmeAnalyses![0];

  let isEarthTargeted = false;
  let arrivalTime: string | null = null;

  if (analysis.enlilList) {
    const earthEntry = analysis.enlilList.find((e) => e.isEarthTargeted);
    if (earthEntry) {
      isEarthTargeted = true;
      arrivalTime     = earthEntry.estimatedArrivalTime;
    }
  }

  return { cme, analysis, isEarthTargeted, arrivalTime };
}

function formatArrivalDate(dateStr: string, lang: Lang): string {
  return new Date(dateStr).toLocaleString(lang === "de" ? "de-DE" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Component ──────────────────────────────────────────────────────────────

export function SpaceWeather({ t, lang }: SpaceWeatherProps) {
  const [data, setData] = useState<SpaceWeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSpaceWeather()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) return null;

  if (!data) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 min-h-[400px]">
        <div className="sky-card p-8">
          <div className="h-4 w-40 sky-skeleton mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-56 sky-skeleton rounded-lg" />
            <div className="h-56 sky-skeleton rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────

  const solarLevel = classifyFlareActivity(data.flares);
  const { level: geoLevel, maxKp } = classifyGeoActivity(data.storms);
  const geoColor = LEVEL_COLORS[geoLevel];

  const latestFlare   = data.flares.length > 0 ? data.flares[data.flares.length - 1] : null;
  const flareGrade    = latestFlare ? classifyFlareGrade(latestFlare.classType) : null;
  const flareSat      = getInstrumentName(latestFlare?.instruments);

  const cmes          = data.cmes ?? [];
  const bestCme       = findBestCme(cmes);
  const cmeSpeedInfo  = bestCme ? classifySpeed(bestCme.analysis.speed) : null;
  const cmeSat        = bestCme ? getInstrumentName(bestCme.cme.instruments) : "";

  const activeTierIdx = getActiveTierIndex(maxKp);

  const CME_COLOR    = "#818cf8"; // indigo — "in flight"
  const AURORA_COLOR = "#D4AF37"; // gold   — aurora chance

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16 min-h-[400px]">
      <div className="sky-card p-6 sm:p-8">

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-serif text-2xl sm:text-3xl tracking-wide">
            {t("weather.title")}
          </h2>
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[rgba(215,230,255,0.40)] mb-8">
          {t("weather.subtitle")}
        </p>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

          {/* ── Solar Events Card ─────────────────────────────────────── */}
          <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] p-5">
            <div className="flex items-center gap-3 mb-4">
              <Sun
                className="w-5 h-5"
                style={{ color: LEVEL_COLORS[solarLevel] }}
              />
              <span className="text-[11px] uppercase tracking-[0.2em] text-[rgba(215,230,255,0.55)]">
                {t("weather.solar")}
              </span>
            </div>

            <div className="space-y-2">

              {/* ── Quiet state ── */}
              {!latestFlare && !bestCme && (
                <div
                  className="rounded-lg pl-3 pr-3 py-3 border-l-2"
                  style={{ borderColor: "#22c55e", backgroundColor: "#22c55e0d" }}
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#22c55e99" }}>
                    {lang === "de" ? "Status" : "Status"}
                  </p>
                  <p className="text-sm font-serif text-[#22c55e]">
                    {lang === "de" ? "Sonne ruhig" : "Sun quiet"}
                  </p>
                  <p className="text-[10px] text-[rgba(215,230,255,0.40)] mt-0.5">
                    {lang === "de"
                      ? "Keine Eruption in den letzten 7 Tagen"
                      : "No eruption in the last 7 days"}
                  </p>
                </div>
              )}

              {/* ── 1. Strahlungsausbruch / Solar Flare ── */}
              {latestFlare && flareGrade && (
                <div
                  className="rounded-lg pl-3 pr-3 py-3 border-l-2"
                  style={{
                    borderColor: flareGrade.color,
                    backgroundColor: `${flareGrade.color}0d`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[10px] uppercase tracking-[0.2em] mb-0.5"
                        style={{ color: `${flareGrade.color}99` }}
                      >
                        {lang === "de" ? "Strahlungsausbruch" : "Solar Flare"}
                      </p>
                      <p className="text-[11px] font-medium leading-snug" style={{ color: flareGrade.color }}>
                        {lang === "de"
                          ? `Klasse ${flareGrade.letter} · ${flareGrade.label.de}`
                          : `Class ${flareGrade.letter} · ${flareGrade.label.en}`}
                      </p>
                      <p className="text-[10px] text-[rgba(215,230,255,0.40)] mt-0.5 leading-relaxed">
                        {lang === "de" ? flareGrade.impact.de : flareGrade.impact.en}
                      </p>
                      <p className="text-[10px] text-[rgba(215,230,255,0.35)] mt-1">
                        {timeAgo(latestFlare.peakTime, lang)}
                        {flareSat && (
                          <>
                            <span className="mx-1.5 opacity-40">·</span>
                            {lang === "de" ? "Beobachtet: " : "Confirmed: "}
                            <span className="text-[rgba(215,230,255,0.50)]">{flareSat}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      className="text-sm font-serif font-semibold shrink-0 tabular-nums pt-0.5"
                      style={{ color: flareGrade.color }}
                    >
                      {latestFlare.classType}
                    </span>
                  </div>
                </div>
              )}

              {/* ── 2. Plasmawolke / CME ── */}
              {bestCme && cmeSpeedInfo && (
                <div
                  className="rounded-lg pl-3 pr-3 py-3 border-l-2"
                  style={{ borderColor: CME_COLOR, backgroundColor: `${CME_COLOR}0d` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[10px] uppercase tracking-[0.2em] mb-0.5"
                        style={{ color: `${CME_COLOR}99` }}
                      >
                        {lang === "de" ? "Plasmawolke im Anflug" : "Plasma Cloud Incoming"}
                      </p>
                      <p className="text-[11px] font-medium leading-snug" style={{ color: CME_COLOR }}>
                        {lang === "de" ? cmeSpeedInfo.label.de : cmeSpeedInfo.label.en}
                        <span className="mx-1.5 opacity-40">·</span>
                        <span
                          style={{
                            color: bestCme.isEarthTargeted
                              ? "#22c55e"
                              : "rgba(215,230,255,0.45)",
                          }}
                        >
                          {lang === "de"
                            ? bestCme.isEarthTargeted ? "Erde im Ziel" : "Nicht erdgerichtet"
                            : bestCme.isEarthTargeted ? "Earth-directed" : "Not Earth-directed"}
                        </span>
                      </p>
                      <p className="text-[10px] text-[rgba(215,230,255,0.35)] mt-1">
                        {timeAgo(bestCme.cme.startTime, lang)}
                        {cmeSat && (
                          <>
                            <span className="mx-1.5 opacity-40">·</span>
                            {lang === "de" ? "Bestätigt: " : "Confirmed: "}
                            <span className="text-[rgba(215,230,255,0.50)]">{cmeSat}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      className="text-sm font-serif font-semibold shrink-0 tabular-nums pt-0.5"
                      style={{ color: CME_COLOR }}
                    >
                      {bestCme.analysis.speed.toLocaleString()} km/s
                    </span>
                  </div>
                </div>
              )}

              {/* ── 3. Polarlicht-Chance / Aurora Arrival ── */}
              {bestCme?.arrivalTime && (
                <div
                  className="rounded-lg pl-3 pr-3 py-3 border-l-2"
                  style={{ borderColor: AURORA_COLOR, backgroundColor: `${AURORA_COLOR}0d` }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] mb-0.5"
                    style={{ color: `${AURORA_COLOR}99` }}
                  >
                    {lang === "de" ? "Polarlicht-Chance" : "Aurora Chance"}
                  </p>
                  <p className="text-[11px] font-medium leading-snug" style={{ color: AURORA_COLOR }}>
                    {lang === "de" ? "Ankunft: " : "Arrival: "}
                    {formatArrivalDate(bestCme.arrivalTime, lang)}
                  </p>
                  <p className="text-[10px] text-[rgba(215,230,255,0.40)] mt-0.5">
                    {countdown(bestCme.arrivalTime, lang)}
                    {bestCme.analysis.isMostAccurate && (
                      <>
                        <span className="mx-1.5 opacity-40">·</span>
                        {lang === "de" ? "Genaue Vorhersage" : "Accurate forecast"}
                      </>
                    )}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* ── Geomagnetic Activity + Kp Scale ──────────────────────── */}
          <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] p-5">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5" style={{ color: geoColor }} />
              <span className="text-[11px] uppercase tracking-[0.2em] text-[rgba(215,230,255,0.55)]">
                {t("weather.geo")}
              </span>
            </div>

            {/* Current status line */}
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-2.5 h-2.5 rounded-full status-pulse shrink-0"
                style={{ backgroundColor: geoColor }}
              />
              <span className="font-serif text-base" style={{ color: geoColor }}>
                {t(LEVEL_LABEL_KEY[geoLevel])}
              </span>
              <span className="text-[11px] text-[rgba(215,230,255,0.35)] ml-auto tabular-nums">
                Kp {maxKp}
              </span>
            </div>

            {/* Kp Intensity Scale */}
            <div className="space-y-1.5">
              {KP_TIERS.map((tier, idx) => {
                const isActive = idx === activeTierIdx;
                return (
                  <div
                    key={tier.range}
                    className="rounded-lg pl-3 pr-2.5 py-2 border-l-2 transition-colors"
                    style={{
                      borderColor: isActive ? tier.color : "rgba(70,130,220,0.12)",
                      backgroundColor: isActive ? `${tier.color}0f` : "transparent",
                    }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-[10px] tabular-nums shrink-0"
                        style={{
                          color: isActive
                            ? `${tier.color}cc`
                            : "rgba(215,230,255,0.25)",
                        }}
                      >
                        {tier.range}
                      </span>
                      <span
                        className="text-[11px] font-medium leading-tight truncate"
                        style={{
                          color: isActive
                            ? tier.color
                            : "rgba(215,230,255,0.35)",
                        }}
                      >
                        {tier.label[lang]}
                      </span>
                    </div>
                    <p
                      className="text-[10px] mt-0.5 leading-relaxed"
                      style={{
                        color: isActive
                          ? "rgba(215,230,255,0.55)"
                          : "rgba(215,230,255,0.22)",
                      }}
                    >
                      {tier.visibility[lang]}
                      <span className="mx-1.5 opacity-40">·</span>
                      {tier.tech[lang]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
