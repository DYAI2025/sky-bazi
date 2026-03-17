import { useParams, Link, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticle, getArticles } from "../lib/parseArticle";
import type { Lang } from "../lib/i18n";
import type { Element } from "hast";

interface Props {
  lang: Lang;
  t: (key: string) => string;
  bazodiacUrl: string;
}

export function ArticlePage({ lang, t, bazodiacUrl }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticle(slug ?? "", lang);

  if (!article) return <Navigate to="/artikel" replace />;

  const otherArticles = getArticles(lang).filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#020509]">
      {/* Hero image */}
      {article.image && (
        <div className="relative h-[55vh] min-h-[340px] overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020509]/30 via-transparent to-[#020509]" />
        </div>
      )}

      {/* Article header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 -mt-24 relative z-10 pt-8">
        <Link
          to="/artikel"
          className="text-[rgba(215,230,255,0.40)] text-xs hover:text-[#D4AF37] transition-colors mb-6 inline-block"
        >
          {lang === "de" ? "← Alle Artikel" : "← All articles"}
        </Link>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-widest text-[#D4AF37]/70 bg-[#D4AF37]/5 border border-[#D4AF37]/15 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] text-[rgba(215,230,255,0.35)] mb-8">
          <span>{article.readingTime} {lang === "de" ? "Min. Lesezeit" : "min read"}</span>
          <span>·</span>
          <span>Bazodiac Sky</span>
        </div>
      </div>

      {/* Markdown content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-8 pb-16 prose-article">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="font-serif text-3xl sm:text-4xl text-white leading-tight mb-6 mt-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-serif text-2xl text-white mt-12 mb-4 pb-2 border-b border-[rgba(215,230,255,0.08)]">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-[#D4AF37]/90 text-lg font-semibold mt-8 mb-3">
                {children}
              </h3>
            ),
            // Render p as div when it only wraps a block-level element (e.g. figure from img)
            // to avoid invalid HTML nesting (<figure> inside <p>)
            p: ({ children, node }) => {
              const childNodes = (node as Element)?.children ?? [];
              const isImageWrapper =
                childNodes.length === 1 &&
                childNodes[0].type === "element" &&
                (childNodes[0] as Element).tagName === "img";
              if (isImageWrapper) return <>{children}</>;
              return (
                <p className="text-[rgba(215,230,255,0.72)] leading-relaxed mb-5 text-base">
                  {children}
                </p>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-[#D4AF37]/40 pl-5 my-6 text-[rgba(215,230,255,0.55)] italic">
                {children}
              </blockquote>
            ),
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            img: ({ src, alt }) => (
              <figure className="my-8">
                <img
                  src={src}
                  alt={alt}
                  className="w-full rounded-lg opacity-90"
                />
                {alt && (
                  <figcaption className="text-center text-[11px] text-[rgba(215,230,255,0.40)] mt-2 leading-relaxed">
                    {alt}
                  </figcaption>
                )}
              </figure>
            ),
            hr: () => (
              <hr className="border-[rgba(215,230,255,0.08)] my-10" />
            ),
            ul: ({ children }) => (
              <ul className="text-[rgba(215,230,255,0.65)] space-y-2 mb-5 ml-4 list-disc list-outside">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="text-[rgba(215,230,255,0.65)] space-y-2 mb-5 ml-4 list-decimal list-outside">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-[#D4AF37]/80 hover:text-[#D4AF37] underline underline-offset-2 transition-colors"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            ),
          }}
        >
          {article.content}
        </ReactMarkdown>
      </article>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 mb-16">
        <div className="bg-[#0a1120] border border-[#D4AF37]/20 rounded-2xl p-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]/70 mb-3">
            Fu-Signatur
          </p>
          <h3 className="font-serif text-2xl text-white mb-3">
            {lang === "de" ? "Was bedeutet das für dich persönlich?" : "What does this mean for you personally?"}
          </h3>
          <p className="text-[rgba(215,230,255,0.50)] mb-6 max-w-md mx-auto text-sm leading-relaxed">
            {lang === "de" ? "Die Wissenschaft beschreibt die Ordnung des Kosmos. Deine Fu-Signatur übersetzt sie in persönliche Bedeutung." : "Science describes the order of the cosmos. Your Fu Signature translates it into personal meaning."}
          </p>
          <a
            href={bazodiacUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-7 py-3 bg-[#D4AF37] text-[#020509] text-sm font-semibold rounded-full hover:bg-[#e8c84a] transition-colors"
          >
            {t("funnel.cta")}
          </a>
        </div>
      </section>

      {/* Related articles */}
      {otherArticles.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-24">
          <h3 className="text-[rgba(215,230,255,0.40)] text-xs uppercase tracking-widest mb-6">
            {lang === "de" ? "Weitere Artikel" : "More articles"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {otherArticles.map((a) => {
              const s = a.slug.replace(/^\//, "");
              return (
                <Link
                  key={a.slug}
                  to={`/artikel/${s}`}
                  className="group bg-[#0a1120] border border-[rgba(215,230,255,0.07)] rounded-xl overflow-hidden hover:border-[#D4AF37]/25 transition-colors"
                >
                  {a.image && (
                    <div className="h-32 overflow-hidden">
                      <img
                        src={a.image}
                        alt={a.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="text-white text-sm font-medium leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                      {a.title}
                    </h4>
                    <span className="text-[11px] text-[rgba(215,230,255,0.35)] mt-2 block">
                      {a.readingTime} {lang === "de" ? "Min. →" : "min →"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
