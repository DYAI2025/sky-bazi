import { Link } from "react-router-dom";
import { IS_DEMO_KEY } from "../services/nasa";
import type { Lang } from "../lib/i18n";

interface FooterProps {
  t: (key: string) => string;
  bazodiacUrl: string;
  lang: Lang;
}

export function Footer({ t, bazodiacUrl, lang }: FooterProps) {
  return (
    <footer className="border-t border-[rgba(70,130,220,0.08)] mt-16">
      {IS_DEMO_KEY && (
        <div className="border-b border-[rgba(212,175,55,0.10)] bg-[rgba(212,175,55,0.04)]">
          <p className="max-w-6xl mx-auto px-4 sm:px-8 py-2 text-[10px] text-[rgba(212,175,55,0.50)] tracking-wider text-center">
            Demo-Modus: NASA DEMO_KEY aktiv (30 Anfragen/Std. · 50/Tag).{" "}
            <a
              href="https://api.nasa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[rgba(212,175,55,0.80)] transition-colors"
            >
              Eigenen Key registrieren →
            </a>{" "}
            dann <code className="font-mono opacity-70">VITE_NASA_API_KEY</code> in .env setzen.
          </p>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-6">
        {/* Top row: data credits + brand */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px] text-[rgba(215,230,255,0.35)] tracking-wider">
            <span>{t("footer.data")}</span>
            <span className="hidden sm:inline">&middot;</span>
            <span>{t("footer.calc")}</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={bazodiacUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-[0.2em] uppercase text-[#D4AF37]/50 hover:text-[#D4AF37]/80 transition-colors"
            >
              {t("footer.main")}
            </a>
            <span className="font-serif text-sm tracking-widest text-[#D4AF37]/30">
              Bazodiac
            </span>
          </div>
        </div>

        {/* Bottom row: legal links */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-[11px] text-[rgba(215,230,255,0.30)] tracking-wider">
          <Link to="/impressum" className="hover:text-[rgba(215,230,255,0.60)] transition-colors">
            Impressum
          </Link>
          <span>&middot;</span>
          <Link to="/datenschutz" className="hover:text-[rgba(215,230,255,0.60)] transition-colors">
            {lang === "de" ? "Datenschutz" : "Privacy"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
