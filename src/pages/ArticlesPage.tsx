import { Link } from "react-router-dom";
import { articles } from "../lib/parseArticle";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
  t: (key: string) => string;
  bazodiacUrl: string;
}

export function ArticlesPage({ t, bazodiacUrl }: Props) {
  return (
    <div className="min-h-screen bg-[#020509]">
      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <p className="text-[9px] uppercase tracking-[0.35em] text-[#D4AF37]/60 mb-3">
          Bazodiac Sky · Wissen
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-white mb-4 leading-tight">
          Der Himmel, erklärt.
        </h1>
        <p className="text-[rgba(215,230,255,0.55)] max-w-xl leading-relaxed">
          Echte Wissenschaft, NASA-Daten und kosmische Rätsel — geschrieben mit echter Faszination.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const slug = article.slug.replace(/^\//, "");
            return (
              <Link
                key={article.slug}
                to={`/artikel/${slug}`}
                className="group relative bg-[#0a1120] border border-[rgba(215,230,255,0.07)] rounded-xl overflow-hidden hover:border-[#D4AF37]/30 transition-colors duration-300 flex flex-col"
              >
                {/* Image */}
                {article.image && (
                  <div className="relative h-44 overflow-hidden bg-[#030a18]">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-transparent to-transparent" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Tags */}
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] uppercase tracking-widest text-[#D4AF37]/60 bg-[#D4AF37]/5 border border-[#D4AF37]/15 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="font-serif text-white text-lg leading-snug mb-3 group-hover:text-[#D4AF37] transition-colors duration-200">
                    {article.title}
                  </h2>

                  <p className="text-[rgba(215,230,255,0.45)] text-sm leading-relaxed flex-1 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-[rgba(215,230,255,0.25)]">
                      {article.readingTime} Min. Lesezeit
                    </span>
                    <span className="text-[#D4AF37]/70 text-xs group-hover:text-[#D4AF37] transition-colors">
                      Lesen →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[rgba(215,230,255,0.07)] py-16 px-4 text-center">
        <p className="text-[rgba(215,230,255,0.45)] mb-5 max-w-md mx-auto">
          Wissenschaft zeigt die Ordnung des Kosmos. Was sie für dich persönlich bedeutet — das entdeckst du mit deinem Fu-Ring.
        </p>
        <a
          href={bazodiacUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-7 py-3 bg-[#D4AF37] text-[#020509] text-sm font-semibold rounded-full hover:bg-[#e8c84a] transition-colors"
        >
          {t("funnel.cta")}
        </a>
      </section>
    </div>
  );
}
