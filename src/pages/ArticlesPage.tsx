import { useState } from "react";
import { Link } from "react-router-dom";
import { getArticlesByCategory } from "../lib/parseArticle";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
  t: (key: string) => string;
  bazodiacUrl: string;
}

const CATEGORIES = ["universum", "mensch"] as const;

export function ArticlesPage({ lang, t, bazodiacUrl }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("universum");
  const articles = getArticlesByCategory(lang, activeCategory);

  const c = {
    label: "Bazodiac Sky · Wissen",
    minutes: lang === "de" ? "Min. Lesezeit" : "min read",
    read: lang === "de" ? "Lesen →" : "Read →",
    ctaText: lang === "de"
      ? "Wissenschaft zeigt die Ordnung des Kosmos. Was sie für dich persönlich bedeutet — das entdeckst du mit deiner Fu-Signatur."
      : "Science reveals the order of the cosmos. What it means for you personally — discover it with your Fu Signature.",
  };

  return (
    <div className="min-h-screen bg-[#020509]">
      <section className="relative pt-28 pb-10 px-4 sm:px-8 max-w-6xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]/70 mb-3">{c.label}</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-white mb-3 leading-tight">
          {t(`wissen.${activeCategory}`)}
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-[rgba(215,230,255,0.55)] mb-8 leading-snug">
          {t(`wissen.${activeCategory}.sub`)}
        </p>

        {/* Category tabs */}
        <div className="flex gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex flex-col items-start px-5 py-3 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? "border-[#D4AF37]/40 bg-[#D4AF37]/8 text-[#D4AF37]"
                    : "border-[rgba(215,230,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgba(215,230,255,0.45)] hover:border-[rgba(215,230,255,0.15)] hover:text-[rgba(215,230,255,0.65)]"
                }`}
              >
                <span className="text-sm font-medium tracking-wide">
                  {t(`wissen.${cat}`)}
                </span>
                <span className={`text-[10px] mt-0.5 ${isActive ? "text-[#D4AF37]/60" : "text-[rgba(215,230,255,0.30)]"}`}>
                  {t(`wissen.${cat}.sub`)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

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

                <div className="p-5 flex flex-col flex-1">
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] uppercase tracking-widest text-[#D4AF37]/70 bg-[#D4AF37]/5 border border-[#D4AF37]/15 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="font-serif text-white text-lg leading-snug mb-3 group-hover:text-[#D4AF37] transition-colors duration-200">
                    {article.title}
                  </h2>

                  <p className="text-[rgba(215,230,255,0.50)] text-sm leading-relaxed flex-1 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-[rgba(215,230,255,0.35)]">{article.readingTime} {c.minutes}</span>
                    <span className="text-[#D4AF37]/70 text-xs group-hover:text-[#D4AF37] transition-colors">{c.read}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[rgba(215,230,255,0.07)] py-16 px-4 text-center">
        <p className="text-[rgba(215,230,255,0.50)] mb-5 max-w-md mx-auto">{c.ctaText}</p>
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
