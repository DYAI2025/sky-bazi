import { useEffect, useState } from "react";
import { Globe, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { fetchEpicLatest, buildEpicImageUrl, type EpicFeedData, type EpicImage } from "../services/nasa";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
  t: (k: string) => string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatEpicDate(date: string, lang: Lang): string {
  // "2024-03-10 01:15:42" → localized
  const d = new Date(date.replace(" ", "T") + "Z");
  return d.toLocaleString(lang === "de" ? "de-DE" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function getLongitudeLabel(lon: number, lang: Lang): string {
  const abs = Math.abs(lon).toFixed(1);
  const dir = lon >= 0 ? (lang === "de" ? "Ö" : "E") : (lang === "de" ? "W" : "W");
  return `${abs}° ${dir}`;
}

function getOceanLabel(lon: number, lang: Lang): string {
  // rough ocean/continent identification by longitude
  if (lon >= -30 && lon <= 60) return lang === "de" ? "Atlantik / Afrika" : "Atlantic / Africa";
  if (lon > 60 && lon <= 150) return lang === "de" ? "Indischer Ozean / Asien" : "Indian Ocean / Asia";
  if (lon > 150 || lon < -120) return lang === "de" ? "Pazifischer Ozean" : "Pacific Ocean";
  return lang === "de" ? "Pazifik / Amerika" : "Pacific / Americas";
}

// ── Component ──────────────────────────────────────────────────────────────

export function EarthPage({ lang, t }: Props) {
  const [data, setData] = useState<EpicFeedData | null>(null);
  const [error, setError] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    fetchEpicLatest()
      .then((d) => {
        setData(d);
        // Start at latest image (last of the day)
        setActiveIdx(Math.max(0, d.images.length - 1));
      })
      .catch(() => setError(true));
  }, []);

  const handlePrev = () => {
    setActiveIdx((i) => Math.max(0, i - 1));
    setImgLoaded(false);
  };
  const handleNext = () => {
    if (!data) return;
    setActiveIdx((i) => Math.min(data.images.length - 1, i + 1));
    setImgLoaded(false);
  };

  const active: EpicImage | undefined = data?.images[activeIdx];
  const imgUrl = active ? buildEpicImageUrl(active.image, active.date) : "";

  return (
    <div className="min-h-screen pt-16">

      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-5 h-5 text-[#D4AF37]" />
          <h1 className="font-serif text-3xl sm:text-4xl tracking-wide">{t("earth.title")}</h1>
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[rgba(215,230,255,0.40)] mb-1">
          {t("earth.subtitle")}
        </p>
        <p className="text-[11px] text-[rgba(215,230,255,0.30)] tracking-wider">
          {t("earth.distance")}
        </p>
      </div>

      {/* ── Loading state ────────────────────────────────────────────── */}
      {!data && !error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
          <div className="sky-card p-8 text-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto sky-skeleton rounded-full mb-6" />
            <div className="h-4 w-48 sky-skeleton mx-auto mb-3" />
            <div className="h-3 w-64 sky-skeleton mx-auto" />
          </div>
        </div>
      )}

      {/* ── Error state ──────────────────────────────────────────────── */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
          <div className="sky-card p-8 text-center">
            <Globe className="w-12 h-12 text-[rgba(215,230,255,0.20)] mx-auto mb-4" />
            <p className="text-[rgba(215,230,255,0.40)] text-sm">
              {lang === "de" ? "Erdansicht momentan nicht verfügbar." : "Earth view temporarily unavailable."}
            </p>
          </div>
        </div>
      )}

      {/* ── Main viewer ──────────────────────────────────────────────── */}
      {data && active && (
        <>
          {/* Earth image */}
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
            <div className="sky-card p-4 sm:p-6">

              {/* Image + nav arrows */}
              <div className="relative flex items-center justify-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={activeIdx === 0}
                  className="shrink-0 w-9 h-9 rounded-full border border-[rgba(70,130,220,0.20)] flex items-center justify-center text-[rgba(215,230,255,0.40)] hover:text-[rgba(215,230,255,0.80)] hover:border-[rgba(70,130,220,0.50)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  aria-label={lang === "de" ? "Früheres Bild" : "Earlier image"}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Earth image — black background makes sphere effect */}
                <div className="relative flex-1 flex justify-center">
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 sm:w-80 sm:h-80 sky-skeleton rounded-full" />
                    </div>
                  )}
                  <img
                    key={imgUrl}
                    src={imgUrl}
                    alt={active.caption || (lang === "de" ? "Erde vom Weltraum" : "Earth from space")}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain transition-opacity duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                    style={{ background: "#000" }}
                  />
                  {/* Image counter badge */}
                  <span className="absolute bottom-2 right-2 text-[10px] tabular-nums text-[rgba(215,230,255,0.30)] bg-[rgba(0,0,0,0.50)] px-2 py-0.5 rounded-full">
                    {activeIdx + 1} / {data.images.length}
                  </span>
                </div>

                <button
                  onClick={handleNext}
                  disabled={activeIdx === data.images.length - 1}
                  className="shrink-0 w-9 h-9 rounded-full border border-[rgba(70,130,220,0.20)] flex items-center justify-center text-[rgba(215,230,255,0.40)] hover:text-[rgba(215,230,255,0.80)] hover:border-[rgba(70,130,220,0.50)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  aria-label={lang === "de" ? "Späteres Bild" : "Later image"}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Caption + coordinates */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div className="rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[rgba(215,230,255,0.35)] mb-1">
                    {t("earth.timestamp")}
                  </p>
                  <p className="text-[11px] text-[rgba(215,230,255,0.75)] leading-relaxed">
                    {formatEpicDate(active.date, lang)}
                  </p>
                </div>

                <div className="rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[rgba(215,230,255,0.35)] mb-1">
                    {t("earth.blick")}
                  </p>
                  <p className="text-[11px] text-[rgba(215,230,255,0.75)] leading-relaxed">
                    {getLongitudeLabel(active.centroid_coordinates.lon, lang)}
                  </p>
                  <p className="text-[10px] text-[rgba(215,230,255,0.40)] mt-0.5">
                    {getOceanLabel(active.centroid_coordinates.lon, lang)}
                  </p>
                </div>

                <div className="rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[rgba(215,230,255,0.35)] mb-1">
                    {lang === "de" ? "Distanz zur Erde" : "Distance to Earth"}
                  </p>
                  <p className="text-[11px] text-[rgba(215,230,255,0.75)]">~1.500.000 km</p>
                  <p className="text-[10px] text-[rgba(215,230,255,0.40)] mt-0.5">
                    {lang === "de" ? "L1-Lagrange-Punkt" : "L1 Lagrange point"}
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* ── Day slider / filmstrip ──────────────────────────────── */}
          <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-6">
            <div className="sky-card p-4 sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[rgba(215,230,255,0.35)] mb-3">
                {t("earth.images")} — {data.imageDate}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
                {data.images.map((img, idx) => {
                  const thumbUrl = buildEpicImageUrl(img.image, img.date)
                    .replace("/jpg/", "/thumbs/")
                    .replace(".jpg?", "_thumb.jpg?");
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={img.identifier}
                      onClick={() => { setActiveIdx(idx); setImgLoaded(false); }}
                      className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        isActive
                          ? "border-[#D4AF37] opacity-100"
                          : "border-[rgba(70,130,220,0.15)] opacity-50 hover:opacity-80"
                      }`}
                      title={img.date}
                    >
                      <img
                        src={thumbUrl}
                        alt={`${lang === "de" ? "Bild" : "Image"} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        style={{ background: "#000" }}
                        onError={(e) => {
                          // Fallback to full image if thumb doesn't exist
                          (e.target as HTMLImageElement).src = buildEpicImageUrl(img.image, img.date);
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Earth fact ─────────────────────────────────────────── */}
          <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-12">
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[rgba(70,130,220,0.05)] border border-[rgba(70,130,220,0.15)]">
              <Info className="w-4 h-4 text-[rgba(70,130,220,0.60)] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[rgba(215,230,255,0.50)] leading-relaxed">
                {t("earth.fact")}
                {" "}
                {t("earth.source")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
