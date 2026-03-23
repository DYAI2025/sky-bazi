import { useEffect } from "react";
import { Link } from "react-router-dom";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
}

export function NotFoundPage({ lang }: Props) {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-serif text-[#D4AF37]/30 mb-4">404</p>
        <h1 className="font-serif text-2xl text-white mb-3">
          {lang === "de" ? "Seite nicht gefunden" : "Page not found"}
        </h1>
        <p className="text-[rgba(215,230,255,0.50)] text-sm mb-8">
          {lang === "de" ? "Diese Seite existiert nicht." : "This page does not exist."}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 border border-[#D4AF37]/30 text-[#D4AF37] text-sm rounded-full hover:bg-[#D4AF37]/10 transition-colors"
        >
          {lang === "de" ? "Zur Startseite" : "Go to homepage"}
        </Link>
      </div>
    </div>
  );
}
