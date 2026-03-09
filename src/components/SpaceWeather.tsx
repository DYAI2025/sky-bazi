import { useEffect, useState } from "react";
import { Sun, Zap, Activity } from "lucide-react";
import {
  fetchSpaceWeather,
  classifyFlareActivity,
  classifyGeoActivity,
  type SpaceWeatherData,
  type SolarActivityLevel,
} from "../services/nasa";

interface SpaceWeatherProps {
  t: (key: string) => string;
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

export function SpaceWeather({ t }: SpaceWeatherProps) {
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
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
        <div className="sky-card p-8">
          <div className="h-4 w-40 sky-skeleton mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-24 sky-skeleton rounded-lg" />
            <div className="h-24 sky-skeleton rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  const solarLevel = classifyFlareActivity(data.flares);
  const { level: geoLevel, maxKp } = classifyGeoActivity(data.storms);
  const solarColor = LEVEL_COLORS[solarLevel];
  const geoColor = LEVEL_COLORS[geoLevel];

  const latestFlare = data.flares.length > 0
    ? data.flares[data.flares.length - 1]
    : null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <div className="sky-card p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-serif text-2xl sm:text-3xl tracking-wide">
            {t("weather.title")}
          </h2>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[rgba(215,230,255,0.30)] mb-8">
          {t("weather.subtitle")}
        </p>

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Solar Activity */}
          <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] p-5">
            <div className="flex items-center gap-3 mb-4">
              <Sun className="w-5 h-5" style={{ color: solarColor }} />
              <span className="text-xs uppercase tracking-[0.2em] text-[rgba(215,230,255,0.50)]">
                {t("weather.solar")}
              </span>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-3 h-3 rounded-full status-pulse"
                style={{ backgroundColor: solarColor }}
              />
              <span className="text-lg font-serif" style={{ color: solarColor }}>
                {t(LEVEL_LABEL_KEY[solarLevel])}
              </span>
            </div>

            {/* Detail */}
            <p className="text-xs text-[rgba(215,230,255,0.35)]">
              {latestFlare ? (
                <>
                  {t("weather.lastFlare")}: <strong className="text-[rgba(215,230,255,0.60)]">{latestFlare.classType}</strong>
                  {" "}&middot;{" "}
                  {new Date(latestFlare.peakTime).toLocaleDateString("de-DE", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </>
              ) : (
                t("weather.noFlares")
              )}
            </p>
          </div>

          {/* Geomagnetic Activity */}
          <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] p-5">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5" style={{ color: geoColor }} />
              <span className="text-xs uppercase tracking-[0.2em] text-[rgba(215,230,255,0.50)]">
                {t("weather.geo")}
              </span>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-3 h-3 rounded-full status-pulse"
                style={{ backgroundColor: geoColor }}
              />
              <span className="text-lg font-serif" style={{ color: geoColor }}>
                {t(LEVEL_LABEL_KEY[geoLevel])}
              </span>
            </div>

            {/* Kp index bar */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] text-[rgba(215,230,255,0.30)] mb-1">
                <span>{t("weather.kpIndex")}</span>
                <span>{maxKp}/9</span>
              </div>
              <div className="h-1.5 rounded-full bg-[rgba(70,130,220,0.12)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(maxKp / 9) * 100}%`,
                    backgroundColor: geoColor,
                  }}
                />
              </div>
            </div>

            <p className="text-xs text-[rgba(215,230,255,0.35)]">
              {data.storms.length > 0
                ? `${data.storms.length} ${data.storms.length === 1 ? "Sturm" : "Stuerme"} (7 Tage)`
                : t("weather.noStorms")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
