import type { Lang } from "./i18n";

export interface ArticleMeta {
  slug: string;
  title: string;
  metaDescription: string;
  image: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  lang: Lang;
}

export interface Article extends ArticleMeta {
  content: string;
  excerpt: string;
}

function parseFrontmatter(raw: string): { meta: Partial<ArticleMeta>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const yamlBlock = match[1];
  const content = match[2].trim();

  const meta: Partial<ArticleMeta> = {};

  for (const line of yamlBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    if (key === "tags") continue;
    if (key === "readingTime") {
      meta.readingTime = parseInt(value, 10);
      continue;
    }

    const clean = value.replace(/^["']|["']$/g, "");
    (meta as Record<string, string | number>)[key] = clean;
  }

  const tagsMatch = yamlBlock.match(/tags:\s*\[(.*?)\]/s);
  if (tagsMatch) {
    meta.tags = tagsMatch[1].split(",").map((t) => t.trim().replace(/^["']|["']$/g, ""));
  }

  return { meta, content };
}

const rawFiles = import.meta.glob("../../content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const allArticles: Article[] = Object.entries(rawFiles)
  .map(([, raw]) => {
    const { meta, content } = parseFrontmatter(raw);
    const firstPara = content
      .split("\n")
      .find((l) => l.trim() && !l.startsWith("#") && !l.startsWith("!") && !l.startsWith("---"))
      ?.slice(0, 220) ?? "";

    return {
      slug: meta.slug ?? "/",
      title: meta.title ?? "",
      metaDescription: meta.metaDescription ?? "",
      image: meta.image ?? "",
      publishedAt: meta.publishedAt ?? "",
      readingTime: meta.readingTime ?? 8,
      tags: meta.tags ?? [],
      lang: meta.lang ?? "de",
      content,
      excerpt: firstPara.replace(/\*\*/g, "").replace(/\*/g, "") + "…",
    } satisfies Article;
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

export function getArticles(lang: Lang): Article[] {
  const localized = allArticles.filter((a) => a.lang === lang);
  if (localized.length > 0) return localized;
  return allArticles.filter((a) => a.lang === "de");
}

export function getArticle(slug: string, lang: Lang): Article | undefined {
  const normalized = `/${slug}`;
  return allArticles.find((a) => a.slug === normalized && a.lang === lang)
    ?? allArticles.find((a) => a.slug === normalized && a.lang === "de");
}
