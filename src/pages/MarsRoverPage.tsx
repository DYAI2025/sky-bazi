import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { fetchMarsLatestPhotos, type MarsPhotoFeedData, type MarsPhoto } from "../services/nasa";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
  t: (k: string) => string;
}

// ── Camera definitions ────────────────────────────────────────────────────

interface CamDef {
  key: string;
  label: { de: string; en: string };
  description: { de: string; en: string };
}

const CAMERAS: CamDef[] = [
  {
    key: "ALL",
    label:       { de: "Alle", en: "All" },
    description: { de: "Alle Kameras", en: "All cameras" },
  },
  {
    key: "MAST",
    label:       { de: "Mast-Kamera", en: "Mast Cam" },
    description: { de: "Panorama-Ansicht (Hauptkamera)", en: "Panoramic view (main camera)" },
  },
  {
    key: "NAVCAM",
    label:       { de: "Navigation", en: "NavCam" },
    description: { de: "Navigationskamera", en: "Navigation camera" },
  },
  {
    key: "FHAZ",
    label:       { de: "Front-Sensor", en: "Front Hazard" },
    description: { de: "Frontkamera zur Hinderniserkennung", en: "Front hazard avoidance camera" },
  },
  {
    key: "RHAZ",
    label:       { de: "Heck-Sensor", en: "Rear Hazard" },
    description: { de: "Heckkamera zur Hinderniserkennung", en: "Rear hazard avoidance camera" },
  },
  {
    key: "MAHLI",
    label:       { de: "Makro-Linse", en: "Hand Lens" },
    description: { de: "Nahaufnahme-Kamera (MAHLI)", en: "Macro close-up camera (MAHLI)" },
  },
  {
    key: "CHEMCAM",
    label:       { de: "Chem-Kamera", en: "ChemCam" },
    description: { de: "Laser-Spektrometer-Kamera", en: "Laser spectrometer camera" },
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatMarsDate(dateStr: string, lang: Lang): string {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString(
    lang === "de" ? "de-DE" : "en-US",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
  );
}

function getCameraLabel(camName: string, lang: Lang): string {
  const found = CAMERAS.find((c) => c.key === camName.toUpperCase());
  return found ? found.label[lang] : camName;
}

function getCameraDescription(camName: string, lang: Lang): string {
  const found = CAMERAS.find((c) => c.key === camName.toUpperCase());
  return found ? found.description[lang] : camName;
}

// ── Photo Card ────────────────────────────────────────────────────────────

function PhotoCard({ photo, lang, featured }: { photo: MarsPhoto; lang: Lang; featured?: boolean }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`rounded-xl overflow-hidden border border-[rgba(70,130,220,0.10)] flex flex-col ${featured ? "sky-card" : "bg-[rgba(255,255,255,0.02)]"}`}>
      <div className={`relative bg-black ${featured ? "aspect-square sm:aspect-video" : "aspect-square"} overflow-hidden`}>
        {!loaded && (
          <div className="absolute inset-0 sky-skeleton" />
        )}
        <img
          src={photo.img_src}
          alt={`Sol ${photo.sol} — ${photo.camera.full_name}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-[rgba(215,230,255,0.55)] truncate">
            {getCameraLabel(photo.camera.name, lang)}
          </p>
          <p className="text-[10px] text-[rgba(215,230,255,0.30)]">
            Sol {photo.sol}
          </p>
        </div>
        <p className="text-[10px] text-[rgba(215,230,255,0.30)] shrink-0 tabular-nums">
          {formatMarsDate(photo.earth_date, lang)}
        </p>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function MarsRoverPage({ lang, t }: Props) {
  const [data, setData] = useState<MarsPhotoFeedData | null>(null);
  const [error, setError] = useState(false);
  const [activeCam, setActiveCam] = useState<string>("ALL");
  const [featuredIdx, setFeaturedIdx] = useState(0);

  useEffect(() => {
    fetchMarsLatestPhotos()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  // Filter photos by selected camera
  const filtered: MarsPhoto[] = data
    ? data.photos.filter((p) =>
        activeCam === "ALL" || p.camera.name.toUpperCase() === activeCam
      )
    : [];

  // Keep featured index in bounds when filter changes
  const safeFeaturedIdx = Math.min(featuredIdx, Math.max(0, filtered.length - 1));
  const featured: MarsPhoto | undefined = filtered[safeFeaturedIdx];

  // Get rover metadata from first photo
  const rover = data?.photos[0]?.rover;

  // Available cameras in this dataset
  const availableCams = new Set(data?.photos.map((p) => p.camera.name.toUpperCase()) ?? []);

  const RUST = "#C1440E";

  return (
    <div className="min-h-screen pt-16">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <Radio className="w-5 h-5 text-[#D4AF37]" />
          <h1 className="font-serif text-3xl sm:text-4xl tracking-wide">{t("mars.title")}</h1>
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[rgba(215,230,255,0.40)] mb-4">
          {t("mars.subtitle")}
        </p>

        {/* Rover status bar */}
        {rover && (
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.20)]">
            <span
              className="w-2 h-2 rounded-full status-pulse shrink-0"
              style={{ backgroundColor: rover.status === "active" ? "#22c55e" : "#eab308" }}
            />
            <span className="text-[11px] text-[rgba(215,230,255,0.70)]">
              {rover.status === "active" ? t("mars.status") : `${rover.name} — Standby`}
            </span>
            <span className="text-[10px] text-[rgba(215,230,255,0.30)] ml-1">
              Sol {rover.max_sol}
            </span>
          </div>
        )}
      </div>

      {/* ── Loading ────────────────────────────────────────────────── */}
      {!data && !error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
          <div className="sky-card p-8">
            <div className="h-64 sm:h-80 sky-skeleton rounded-xl mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 sky-skeleton rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
          <div className="sky-card p-8 text-center">
            <Radio className="w-12 h-12 text-[rgba(215,230,255,0.20)] mx-auto mb-4" />
            <p className="text-[rgba(215,230,255,0.40)] text-sm">
              {lang === "de" ? "Mars-Verbindung unterbrochen." : "Mars connection lost."}
            </p>
          </div>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────── */}
      {data && (
        <>
          {/* Camera filter pills */}
          <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-4">
            <div className="flex flex-wrap gap-2">
              {CAMERAS.filter((c) => c.key === "ALL" || availableCams.has(c.key)).map((cam) => {
                const isActive = activeCam === cam.key;
                return (
                  <button
                    key={cam.key}
                    onClick={() => { setActiveCam(cam.key); setFeaturedIdx(0); }}
                    className="px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.15em] border transition-all"
                    style={{
                      borderColor: isActive ? RUST : "rgba(70,130,220,0.15)",
                      backgroundColor: isActive ? `${RUST}18` : "transparent",
                      color: isActive ? "#E06040" : "rgba(215,230,255,0.40)",
                    }}
                    title={cam.description[lang]}
                  >
                    {cam.label[lang]}
                  </button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-6">
              <div className="sky-card p-8 text-center">
                <p className="text-[rgba(215,230,255,0.35)] text-sm">
                  {lang === "de"
                    ? "Für diese Kamera sind keine aktuellen Bilder verfügbar."
                    : "No recent images available for this camera."}
                </p>
              </div>
            </div>
          )}

          {featured && (
            <>
              {/* Featured photo */}
              <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-4">
                <div className="sky-card p-4 sm:p-5">

                  {/* Header bar */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-serif text-lg text-white leading-tight">
                        {lang === "de" ? "Live-Postkarte vom Gale-Krater" : "Live postcard from Gale Crater"} 🏜️
                      </p>
                      <p className="text-[10px] text-[rgba(215,230,255,0.40)] mt-0.5">
                        {getCameraDescription(featured.camera.name, lang)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[rgba(215,230,255,0.35)]">Sol</p>
                      <p className="font-serif text-2xl tabular-nums" style={{ color: "#E06040" }}>
                        {featured.sol}
                      </p>
                    </div>
                  </div>

                  {/* Main image */}
                  <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4">
                    <img
                      key={featured.img_src}
                      src={featured.img_src}
                      alt={`Sol ${featured.sol} — ${featured.camera.full_name}`}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                    {/* Overlay info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 flex items-end justify-between">
                      <span className="text-[10px] text-[rgba(215,230,255,0.60)]">
                        {getCameraLabel(featured.camera.name, lang)} · {featured.camera.full_name}
                      </span>
                      <span className="text-[10px] text-[rgba(215,230,255,0.50)] tabular-nums">
                        {formatMarsDate(featured.earth_date, lang)}
                      </span>
                    </div>
                  </div>

                  {/* Meta pills */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] px-3 py-2.5 text-center">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-[rgba(215,230,255,0.30)] mb-1">{t("mars.sol")}</p>
                      <p className="font-serif text-base tabular-nums" style={{ color: "#E06040" }}>{featured.sol}</p>
                    </div>
                    <div className="rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] px-3 py-2.5 text-center">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-[rgba(215,230,255,0.30)] mb-1">{t("mars.earthdate")}</p>
                      <p className="text-[11px] text-[rgba(215,230,255,0.70)]">{formatMarsDate(featured.earth_date, lang)}</p>
                    </div>
                    <div className="rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(70,130,220,0.10)] px-3 py-2.5 text-center">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-[rgba(215,230,255,0.30)] mb-1">{t("mars.camera")}</p>
                      <p className="text-[11px] text-[rgba(215,230,255,0.70)]">{getCameraLabel(featured.camera.name, lang)}</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Photo grid */}
              {filtered.length > 1 && (
                <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-6">
                  <div className="sky-card p-4 sm:p-5">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[rgba(215,230,255,0.35)] mb-4">
                      {lang === "de"
                        ? `Weitere Aufnahmen · ${filtered.length} Bilder`
                        : `More shots · ${filtered.length} images`}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filtered.slice(0, 16).map((photo, idx) => (
                        <button
                          key={photo.id}
                          onClick={() => setFeaturedIdx(idx)}
                          className={`text-left rounded-xl overflow-hidden border-2 transition-all ${
                            idx === safeFeaturedIdx
                              ? "border-[#C1440E]"
                              : "border-[rgba(70,130,220,0.10)] hover:border-[rgba(70,130,220,0.30)]"
                          }`}
                        >
                          <PhotoCard photo={photo} lang={lang} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Source note */}
          <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-12">
            <p className="text-[10px] text-[rgba(215,230,255,0.25)] text-center tracking-wider">
              {t("mars.source")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
