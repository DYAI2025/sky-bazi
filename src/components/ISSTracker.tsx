import { useState, useEffect } from "react";
import { Globe, Satellite, MapPin, Gauge } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { API_ENDPOINTS } from "../constants/apis";

/**
 * ISS Live Tracker
 *
 * Data source: https://wheretheiss.at/w/developer
 * Provides real altitude, velocity, and daylight/eclipse visibility — no API key.
 */

interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;        // km
  velocity: number;        // km/h
  timestamp: number;       // ms since epoch
  visibility: "daylight" | "eclipsed";
}

interface ISSTrackerProps {
  lang: Lang;
  t: (key: string) => string;
}

const POLL_INTERVAL_MS = 10_000;

export function ISSTracker({ lang, t }: ISSTrackerProps) {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let intervalId: number | undefined;

    const fetchPosition = async () => {
      // Don't poll while tab is in the background — saves battery + bandwidth.
      if (typeof document !== "undefined" && document.hidden) return;

      try {
        const res = await fetch(API_ENDPOINTS.ISS_POSITION);
        if (!res.ok) throw new Error(`ISS API error: ${res.status}`);
        const data = await res.json();

        // Defensive parsing — wheretheiss.at returns numbers, but never trust the network.
        const lat = Number(data.latitude);
        const lng = Number(data.longitude);
        const alt = Number(data.altitude);
        const vel = Number(data.velocity);
        const ts  = Number(data.timestamp);
        if ([lat, lng, alt, vel, ts].some((n) => !Number.isFinite(n))) {
          throw new Error("Malformed ISS API response");
        }

        if (!mounted) return;
        setPosition({
          latitude: lat,
          longitude: lng,
          altitude: alt,
          velocity: vel,
          timestamp: ts * 1000,
          visibility: data.visibility === "eclipsed" ? "eclipsed" : "daylight",
        });
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPosition();
    intervalId = window.setInterval(fetchPosition, POLL_INTERVAL_MS);

    // Resume immediately when user comes back to the tab
    const onVisibility = () => {
      if (!document.hidden) fetchPosition();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mounted = false;
      if (intervalId !== undefined) window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const formatCoordinate = (coord: number, type: "lat" | "lng"): string => {
    const abs = Math.abs(coord);
    const direction =
      type === "lat" ? (coord >= 0 ? "N" : "S") : (coord >= 0 ? "E" : "W");
    return `${abs.toFixed(2)}° ${direction}`;
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8" aria-busy="true">
        <div className="sky-card p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-glass/30 rounded" />
              <div className="h-6 bg-blue-glass/30 rounded w-48" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-blue-glass/20 rounded w-16" />
                  <div className="h-8 bg-[rgba(212,175,55,0.20)] rounded" />
                </div>
              ))}
            </div>
          </div>
          <span className="sr-only">{t("iss.loading")}</span>
        </div>
      </section>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error || !position) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="sky-card p-6 text-center">
          <Satellite className="w-12 h-12 text-red-400/60 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-serif text-[rgba(215,230,255,0.92)] mb-2">
            {t("iss.errorTitle")}
          </h3>
          <p className="text-[rgba(215,230,255,0.60)] text-sm">{t("iss.errorBody")}</p>
        </div>
      </section>
    );
  }

  const timeSinceUpdate = Math.max(0, Math.floor((Date.now() - position.timestamp) / 1000));
  const isDaylight = position.visibility === "daylight";
  const visibilityLabel = isDaylight ? t("iss.daylight") : t("iss.eclipse");
  const visibilityAria = isDaylight ? t("iss.daylightAria") : t("iss.eclipseAria");
  const localeNum = lang === "de" ? "de-DE" : "en-US";

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <div className="sky-card p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Satellite className="w-8 h-8 text-[#D4AF37]" aria-hidden="true" />
            <div
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                isDaylight ? "bg-yellow-400" : "bg-blue-400"
              } animate-pulse`}
              role="status"
              aria-label={visibilityAria}
            />
          </div>
          <div>
            <h2 className="text-xl font-serif text-[#D4AF37]">{t("iss.title")}</h2>
            <p className="text-xs text-[rgba(215,230,255,0.50)]">
              {t("iss.updated")} {timeSinceUpdate}{t("iss.secondsAgo")} · {isDaylight ? "☀️" : "🌙"} {visibilityLabel}
            </p>
          </div>
        </div>

        {/* Live screen-reader announcement */}
        <p className="sr-only" aria-live="polite">
          {t("iss.title")}: {formatCoordinate(position.latitude, "lat")},{" "}
          {formatCoordinate(position.longitude, "lng")}
        </p>

        {/* Data grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCell
            icon={<MapPin className="w-4 h-4" aria-hidden="true" />}
            label={t("iss.latitude")}
            value={formatCoordinate(position.latitude, "lat")}
          />
          <StatCell
            icon={<MapPin className="w-4 h-4" aria-hidden="true" />}
            label={t("iss.longitude")}
            value={formatCoordinate(position.longitude, "lng")}
          />
          <StatCell
            icon={<Globe className="w-4 h-4" aria-hidden="true" />}
            label={t("iss.altitude")}
            value={`${position.altitude.toFixed(0)} km`}
          />
          <StatCell
            icon={<Gauge className="w-4 h-4" aria-hidden="true" />}
            label={t("iss.velocity")}
            value={`${Math.round(position.velocity).toLocaleString(localeNum)} km/h`}
          />
        </div>

        {/* Info box */}
        <div className="bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.20)] rounded-lg p-4">
          <p className="text-sm text-[rgba(215,230,255,0.75)] leading-relaxed">
            <strong className="text-[#D4AF37]">{t("iss.factsLabel")}:</strong> {t("iss.factsBody")}
            {!isDaylight && (
              <span className="ml-2">🌙 <em>{t("iss.eclipseHint")}</em></span>
            )}
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[rgba(215,230,255,0.35)] mt-3">
            {t("iss.source")}
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Subcomponent ──────────────────────────────────────────────────────────

interface StatCellProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCell({ icon, label, value }: StatCellProps) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 mb-2 text-[rgba(215,230,255,0.50)]">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-mono text-[#D4AF37]">{value}</div>
    </div>
  );
}
