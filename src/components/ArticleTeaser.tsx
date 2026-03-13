import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { articles } from "../lib/parseArticle";

// Pick 2 featured articles by index (cosmic puzzles + cosmic web — most visual)
const FEATURED = [0, 1];

export function ArticleTeaser() {
  const featured = FEATURED.map((i) => articles[i]).filter(Boolean);
  if (featured.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]/70 mb-2">
            Wissen · Astronomie
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-white leading-tight">
            Der Kosmos hat Antworten.<br />
            <span className="text-[rgba(215,230,255,0.45)]">Und noch mehr Fragen.</span>
          </h2>
        </div>
        <Link
          to="/artikel"
          className="hidden sm:flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[rgba(215,230,255,0.40)] hover:text-[#D4AF37] transition-colors shrink-0"
        >
          Alle Artikel
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {featured.map((article, idx) => {
          const slug = article.slug.replace(/^\//, "");
          const isLarge = idx === 0;

          return (
            <Link
              key={article.slug}
              to={`/artikel/${slug}`}
              className="group relative overflow-hidden rounded-2xl bg-[#0a1120] border border-[rgba(215,230,255,0.07)] hover:border-[#D4AF37]/30 transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className={`relative overflow-hidden ${isLarge ? "h-64 sm:h-72" : "h-52 sm:h-60"}`}>
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover opacity-65 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-[#0a1120]/40 to-transparent" />

                {/* Tags overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {article.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase tracking-widest text-[#D4AF37]/80 bg-[#020509]/70 backdrop-blur-sm border border-[#D4AF37]/20 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3
                  className={`font-serif text-white leading-snug mb-3 group-hover:text-[#D4AF37] transition-colors duration-200 ${
                    isLarge ? "text-xl sm:text-2xl" : "text-lg"
                  }`}
                >
                  {article.title}
                </h3>

                <p className="text-[rgba(215,230,255,0.55)] text-sm leading-relaxed flex-1 line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[11px] text-[rgba(215,230,255,0.35)]">
                    {article.readingTime} Min. Lesezeit
                  </span>
                  <span className="flex items-center gap-1 text-[#D4AF37]/60 text-xs group-hover:text-[#D4AF37] transition-colors">
                    Lesen
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile: alle Artikel link */}
      <div className="sm:hidden mt-6 text-center">
        <Link
          to="/artikel"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[rgba(215,230,255,0.40)] hover:text-[#D4AF37] transition-colors"
        >
          Alle Artikel ansehen
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
