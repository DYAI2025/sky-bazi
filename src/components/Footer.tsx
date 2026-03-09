interface FooterProps {
  t: (key: string) => string;
  bazodiacUrl: string;
}

export function Footer({ t, bazodiacUrl }: FooterProps) {
  return (
    <footer className="border-t border-[rgba(70,130,220,0.08)] mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[10px] text-[rgba(215,230,255,0.25)] tracking-wider">
          <span>{t("footer.data")}</span>
          <span className="hidden sm:inline">&middot;</span>
          <span>{t("footer.calc")}</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={bazodiacUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37]/40 hover:text-[#D4AF37]/70 transition-colors"
          >
            {t("footer.main")}
          </a>
          <span className="font-serif text-sm tracking-widest text-[#D4AF37]/25">
            Bazodiac
          </span>
        </div>
      </div>
    </footer>
  );
}
