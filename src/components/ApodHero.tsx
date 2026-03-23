import { useEffect, useState } from "react";
import { fetchApod, type ApodData } from "../services/nasa";

interface ApodHeroProps {
  t: (key: string) => string;
}

export function ApodHero({ t }: ApodHeroProps) {
  const [apod, setApod] = useState<ApodData | null>(null);
  const [error, setError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    fetchApod()
      .then(setApod)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-end bg-gradient-to-b from-[#020509] to-[#030a18]">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pb-16 w-full">
          <p className="text-[rgba(215,230,255,0.35)] text-sm">NASA APOD unavailable</p>
        </div>
      </section>
    );
  }

  if (!apod) {
    return (
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-end">
        <div className="absolute inset-0 sky-skeleton" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pb-16 w-full">
          <div className="h-4 w-48 sky-skeleton mb-3" />
          <div className="h-8 w-80 sky-skeleton mb-4" />
          <div className="h-3 w-64 sky-skeleton" />
        </div>
      </section>
    );
  }

  const isVideo = apod.media_type === "video";
  const isNativeVideo = isVideo && /\.(mp4|webm|ogg)(\?|$)/i.test(apod.url);

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] flex items-end overflow-hidden">
      {/* Background */}
      {isNativeVideo ? (
        <div className="absolute inset-0 bg-[#020509]">
          <video
            src={apod.url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            onLoadedData={() => setImgLoaded(true)}
          />
          {!imgLoaded && <div className="absolute inset-0 sky-skeleton" />}
        </div>
      ) : isVideo ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#020509]">
          <iframe
            src={apod.url}
            title={apod.title}
            className="w-full h-full"
            allowFullScreen
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        </div>
      ) : (
        <>
          <img
            src={apod.url}
            srcSet={apod.hdurl ? `${apod.url} 960w, ${apod.hdurl} 1920w` : undefined}
            sizes="100vw"
            alt={apod.title}
            fetchPriority="high"
            onLoad={() => setImgLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {!imgLoaded && <div className="absolute inset-0 sky-skeleton" />}
        </>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pb-12 sm:pb-16 w-full">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]/70 mb-2">
          {t("apod.title")} &middot; {apod.date}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4 max-w-3xl">
          {apod.title}
        </h1>
        <p className="text-sm text-[rgba(215,230,255,0.60)] leading-relaxed max-w-2xl line-clamp-3">
          {apod.explanation}
        </p>
        {apod.copyright && (
          <p className="text-[11px] text-[rgba(215,230,255,0.35)] mt-3">
            &copy; {apod.copyright}
          </p>
        )}
      </div>
    </section>
  );
}
