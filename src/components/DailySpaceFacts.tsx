import { useState, useEffect, useMemo } from "react";
import { Sparkles, Clock, Telescope, Zap, Rocket, Sun, Shield } from "lucide-react";
import type { Lang } from "../lib/i18n";

/**
 * Daily Space Facts
 *
 * All facts are static, verified, and sourced from public NASA / ESA / NOAA material.
 * No fake "live" numbers — the only thing that varies day-to-day is which subset
 * of facts is shown (deterministic via day-of-year).
 */

type FactCategory = "solar" | "earth" | "exploration" | "discovery" | "physics";
type FactIcon = "sparkles" | "clock" | "telescope" | "zap" | "rocket" | "sun" | "shield";

interface SpaceFact {
  id: string;
  icon: FactIcon;
  category: FactCategory;
  titleKey: string;
  bodyKey: string;
  sourceKey: string;
}

interface DailySpaceFactsProps {
  lang: Lang;
  t: (key: string) => string;
}

const ICONS: Record<FactIcon, typeof Sparkles> = {
  sparkles: Sparkles,
  clock: Clock,
  telescope: Telescope,
  zap: Zap,
  rocket: Rocket,
  sun: Sun,
  shield: Shield,
};

const CATEGORY_STYLES: Record<FactCategory, { color: string; bg: string }> = {
  solar:       { color: "text-yellow-400", bg: "bg-yellow-400/10" },
  earth:       { color: "text-blue-400",   bg: "bg-blue-400/10" },
  exploration: { color: "text-purple-400", bg: "bg-purple-400/10" },
  discovery:   { color: "text-green-400",  bg: "bg-green-400/10" },
  physics:     { color: "text-red-400",    bg: "bg-red-400/10" },
};

const ALL_FACTS: SpaceFact[] = [
  { id: "solar",  icon: "sun",       category: "solar",       titleKey: "facts.solar.title",  bodyKey: "facts.solar.body",  sourceKey: "facts.solar.source" },
  { id: "iss",    icon: "clock",     category: "exploration", titleKey: "facts.iss.title",    bodyKey: "facts.iss.body",    sourceKey: "facts.iss.source" },
  { id: "exo",    icon: "telescope", category: "discovery",   titleKey: "facts.exo.title",    bodyKey: "facts.exo.body",    sourceKey: "facts.exo.source" },
  { id: "mars",   icon: "rocket",    category: "exploration", titleKey: "facts.mars.title",   bodyKey: "facts.mars.body",   sourceKey: "facts.mars.source" },
  { id: "stars",  icon: "sparkles",  category: "physics",     titleKey: "facts.stars.title",  bodyKey: "facts.stars.body",  sourceKey: "facts.stars.source" },
  { id: "bh",     icon: "telescope", category: "discovery",   titleKey: "facts.bh.title",     bodyKey: "facts.bh.body",     sourceKey: "facts.bh.source" },
  { id: "mag",    icon: "shield",    category: "earth",       titleKey: "facts.mag.title",    bodyKey: "facts.mag.body",    sourceKey: "facts.mag.source" },
  { id: "light",  icon: "zap",       category: "physics",     titleKey: "facts.light.title",  bodyKey: "facts.light.body",  sourceKey: "facts.light.source" },
];

const ROTATION_INTERVAL_MS = 30_000;

/** Pick 3 facts deterministically based on day-of-year. */
function pickDailyFacts(): SpaceFact[] {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((now.getTime() - startOfYear) / 86_400_000);
  const offset = (dayOfYear * 3) % ALL_FACTS.length;
  return [
    ALL_FACTS[offset % ALL_FACTS.length],
    ALL_FACTS[(offset + 1) % ALL_FACTS.length],
    ALL_FACTS[(offset + 2) % ALL_FACTS.length],
  ];
}

export function DailySpaceFacts({ lang, t }: DailySpaceFactsProps) {
  // useMemo so the picked facts only re-compute when the language changes
  // (not on every render). Still deterministic per day.
  const facts = useMemo(() => pickDailyFacts(), []);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (facts.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [facts.length]);

  const currentFact = facts[currentIndex];
  const Icon = ICONS[currentFact.icon];
  const categoryStyle = CATEGORY_STYLES[currentFact.category];
  const categoryLabel = t(`facts.cat.${currentFact.category}`);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8" lang={lang}>
      <div className="sky-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${categoryStyle.bg}`}>
              <Icon className={`w-6 h-6 ${categoryStyle.color}`} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-[#D4AF37]">{t("facts.title")}</h2>
              <p className="text-xs text-[rgba(215,230,255,0.50)]">{t("facts.subtitle")}</p>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center gap-2">
            {facts.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 focus-visible:outline-none ${
                  index === currentIndex
                    ? "bg-[#D4AF37] w-6"
                    : "bg-[rgba(215,230,255,0.25)] hover:bg-[rgba(215,230,255,0.50)] w-2"
                }`}
                aria-label={`${t("facts.show")} ${index + 1}`}
                aria-current={index === currentIndex ? "true" : undefined}
              />
            ))}
          </div>
        </div>

        {/* Current fact */}
        <div className="space-y-4" aria-live="polite">
          <h3 className="text-lg font-serif text-[rgba(215,230,255,0.92)]">
            {t(currentFact.titleKey)}
          </h3>

          <p className="text-[rgba(215,230,255,0.70)] leading-relaxed">
            {t(currentFact.bodyKey)}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-[rgba(212,175,55,0.20)] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${categoryStyle.color.replace("text-", "bg-")}`} />
              <span className="text-xs uppercase tracking-wider text-[rgba(215,230,255,0.40)]">
                {categoryLabel}
              </span>
            </div>

            <span className="text-xs text-[rgba(215,230,255,0.40)]">
              {t("facts.source")}: {t(currentFact.sourceKey)}
            </span>
          </div>
        </div>

        {/* Auto-rotation progress bar */}
        <div className="mt-6 bg-[rgba(215,230,255,0.10)] rounded-full h-1 overflow-hidden">
          <div
            key={currentIndex}
            className="h-full bg-gradient-to-r from-[#D4AF37] to-yellow-300 animate-progress-bar"
          />
        </div>
      </div>
    </section>
  );
}
