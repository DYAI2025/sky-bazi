import { ExternalLink } from "lucide-react";
import type { Lang } from "../lib/i18n";

interface HeaderProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  bazodiacUrl: string;
}

export function Header({ lang, setLang, t, bazodiacUrl }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#030a18]/80 border-b border-[rgba(70,130,220,0.12)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl tracking-widest text-[#D4AF37]">
            Bazodiac
          </span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-[rgba(215,230,255,0.30)] font-sans">
            Sky
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Lang toggle */}
          <div className="flex items-center border border-[rgba(212,175,55,0.20)] rounded-md overflow-hidden bg-[rgba(255,255,255,0.04)]">
            <button
              onClick={() => setLang("de")}
              className={`px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] transition-all ${
                lang === "de"
                  ? "bg-[rgba(212,175,55,0.12)] text-[#D4AF37] font-semibold"
                  : "text-[rgba(215,230,255,0.30)] hover:text-[rgba(215,230,255,0.60)]"
              }`}
            >
              DE
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] transition-all ${
                lang === "en"
                  ? "bg-[rgba(212,175,55,0.12)] text-[#D4AF37] font-semibold"
                  : "text-[rgba(215,230,255,0.30)] hover:text-[rgba(215,230,255,0.60)]"
              }`}
            >
              EN
            </button>
          </div>

          {/* CTA — link to main app */}
          <a
            href={bazodiacUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-[0.2em] border border-[#D4AF37]/30 text-[#D4AF37] rounded-md hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 transition-all"
          >
            {t("nav.ring")}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </header>
  );
}
