import { useEffect, useState } from "react";
import { Activity, Zap, AlertTriangle } from "lucide-react";
import { fetchNoaaLive, type NoaaLiveData } from "../services/nasa";
import type { Lang } from "../lib/i18n";

interface Props {
  t: (key: string) => string;
  lang: Lang;
}

const G_SCALE: Array<{
  min: number; max: number; color: string;
  label: { de: string; en: string };
}> = [
  { min: 0, max: 4, color: "#22c55e", label: { de: "Ruhig", en: "Quiet" } },
  { min: 5, max: 5, color: "#eab308", label: { de: "G1 – Schwach", en: "G1 – Minor" } },
  { min: 6, max: 6, color: "#f59e0b", label: { de: "G2 – Moderat", en: "G2 – Moderate" } },
  { min: 7, max: 7, color: "#f97316", label: { de: "G3 – Stark", en: "G3 – Strong" } },
  { min: 8, max: 8, color: "#ef4444", label: { de: "G4 – Schwer", en: "G4 – Severe" } },
  { min: 9, max: 9, color: "#dc2626", label: { de: "G5 – Extrem", en: "G5 – Extreme" } },
];

function getGTier(kp: number) {
  return G_SCALE.find(g => kp >= g.min && kp <= g.max) ?? G_SCALE[0];
}

export default function SolarPressureWidget({ t, lang }: Props) {
  const [data, setData] = useState<NoaaLiveData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchNoaaLive()
      .then(d => { if (mounted) setData(d); })
      .catch(() => { if (mounted) setError(true); });

    const interval = setInterval(() => {
      fetchNoaaLive()
        .then(d => { if (mounted) setData(d); })
        .catch(() => {});
    }, 5 * 60 * 1000);

    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (error || !data) {
    return (
      <div className="sky-card p-6">
        <div className="sky-skeleton h-32 rounded-lg" />
      </div>
    );
  }

  const tier = getGTier(data.kp);
  const isStorm = data.kp >= 5;

  return (
    <section className="sky-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.15em]" style={{ color: "rgba(215,230,255,0.7)" }}>
          {lang === "de" ? "Solar-Druck Live" : "Solar Pressure Live"}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: tier.color }} />
          <span className="text-xs" style={{ color: tier.color }}>{tier.label[lang]}</span>
        </div>
      </div>

      {/* Kp Gauge */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-serif" style={{ color: tier.color }}>
            Kp {data.kp.toFixed(1)}
          </span>
          {isStorm && (
            <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider"
                  style={{ borderColor: tier.color + "40", color: tier.color }}>
              <AlertTriangle className="h-3 w-3" />
              {lang === "de" ? "Sturm aktiv" : "Storm active"}
            </span>
          )}
        </div>

        {/* Kp bar */}
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${(data.kp / 9) * 100}%`, background: tier.color }}
          />
        </div>
      </div>

      {/* X-ray + Proton readings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider" style={{ color: "rgba(215,230,255,0.5)" }}>
            <Zap className="h-3 w-3" />
            {lang === "de" ? "Rontgen" : "X-Ray"}
          </div>
          <div className="mt-1 text-lg font-medium" style={{ color: "rgba(215,230,255,0.9)" }}>
            {data.xrayClass}-{lang === "de" ? "Klasse" : "Class"}
          </div>
          <div className="text-[10px]" style={{ color: "rgba(215,230,255,0.4)" }}>
            {data.xrayFlux.toExponential(1)} W/m²
          </div>
        </div>

        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider" style={{ color: "rgba(215,230,255,0.5)" }}>
            <Activity className="h-3 w-3" />
            {lang === "de" ? "Protonen" : "Protons"}
          </div>
          <div className="mt-1 text-lg font-medium" style={{ color: "rgba(215,230,255,0.9)" }}>
            {data.protonFlux < 10 ? data.protonFlux.toFixed(1) : data.protonFlux.toFixed(0)} pfu
          </div>
          <div className="text-[10px]" style={{ color: "rgba(215,230,255,0.4)" }}>
            {lang === "de" ? "\u226510 MeV Kanal" : "\u226510 MeV channel"}
          </div>
        </div>
      </div>

      {/* Last update */}
      <div className="text-[10px] text-right" style={{ color: "rgba(215,230,255,0.3)" }}>
        {lang === "de" ? "Aktualisiert" : "Updated"}: {new Date(data.fetchedAt).toLocaleTimeString(lang === "de" ? "de-DE" : "en-US")}
      </div>
    </section>
  );
}
