import { ArrowRight } from "lucide-react";

interface FunnelCtaProps {
  t: (key: string) => string;
  bazodiacUrl: string;
  variant?: "primary" | "weather";
}

export function FunnelCta({ t, bazodiacUrl, variant = "primary" }: FunnelCtaProps) {
  const isWeather = variant === "weather";

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <div className="relative overflow-hidden rounded-2xl funnel-glow">
        <div className="sky-divider" />

        <div className="py-10 sm:py-14 px-6 sm:px-12 text-center">
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#D4AF37] leading-tight mb-4">
            {isWeather ? t("funnel.weather") : t("funnel.headline")}
          </h3>

          {!isWeather && (
            <p className="text-sm text-[rgba(215,230,255,0.50)] max-w-xl mx-auto mb-8 leading-relaxed">
              {t("funnel.body")}
            </p>
          )}

          <a
            href={bazodiacUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.25em] border border-[#D4AF37]/40 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 transition-all"
          >
            {isWeather ? t("funnel.weatherCta") : t("funnel.cta")}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="sky-divider" />
      </div>
    </section>
  );
}
