import { Link } from "react-router-dom";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
}

export function ImpressumPage({ lang }: Props) {
  return (
    <div className="min-h-screen bg-[#020509]">
      <section className="max-w-3xl mx-auto px-4 sm:px-8 pt-28 pb-16">
        <Link to="/" className="text-[11px] uppercase tracking-[0.2em] text-[rgba(215,230,255,0.35)] hover:text-[#D4AF37] transition-colors mb-8 inline-block">
          &larr; {lang === "de" ? "Zurueck" : "Back"}
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl text-white mb-8">Impressum</h1>

        <div className="prose prose-invert prose-sm max-w-none text-[rgba(215,230,255,0.75)] space-y-6 leading-relaxed">
          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {lang === "de" ? "Angaben gemaess SS 5 TMG" : "Information according to SS 5 TMG"}
          </h2>
          <p>
            Benjamin Poersch<br />
            Grazer Damm 207<br />
            12157 Berlin<br />
            Deutschland / Germany
          </p>

          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {lang === "de" ? "Kontakt" : "Contact"}
          </h2>
          <p>
            E-Mail: <a href="mailto:connect@dyai.cloud" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">connect@dyai.cloud</a>
          </p>

          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {lang === "de" ? "Verantwortlich fuer den Inhalt gemaess SS 55 Abs. 2 RStV" : "Responsible for content according to SS 55 para. 2 RStV"}
          </h2>
          <p>
            Benjamin Poersch<br />
            Grazer Damm 207<br />
            12157 Berlin
          </p>

          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {lang === "de" ? "Haftungsausschluss" : "Disclaimer"}
          </h2>
          <h3 className="font-serif text-lg text-white mt-6 mb-2">
            {lang === "de" ? "Haftung fuer Inhalte" : "Liability for content"}
          </h3>
          <p>
            {lang === "de"
              ? "Die Inhalte dieser Seiten wurden mit groesster Sorgfalt erstellt. Fuer die Richtigkeit, Vollstaendigkeit und Aktualitaet der Inhalte koennen wir jedoch keine Gewaehr uebernehmen. Als Diensteanbieter sind wir gemaess SS 7 Abs. 1 TMG fuer eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Gemaess SSSS 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, uebermittelte oder gespeicherte fremde Informationen zu ueberwachen."
              : "The contents of these pages were created with the greatest care. However, we cannot guarantee the accuracy, completeness, or timeliness of the content. As a service provider, we are responsible for our own content on these pages in accordance with general laws pursuant to Section 7(1) TMG. However, according to Sections 8-10 TMG, we are not obligated to monitor transmitted or stored third-party information."}
          </p>
          <h3 className="font-serif text-lg text-white mt-6 mb-2">
            {lang === "de" ? "Haftung fuer Links" : "Liability for links"}
          </h3>
          <p>
            {lang === "de"
              ? "Unser Angebot enthaelt Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Fuer die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich."
              : "Our website contains links to external third-party websites over whose content we have no influence. The respective provider or operator of the linked pages is always responsible for their content."}
          </p>

          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {lang === "de" ? "Datenquellen" : "Data sources"}
          </h2>
          <p>
            {lang === "de"
              ? "Astronomische Daten stammen von der NASA Open Data API. Planetenpositionen werden in Echtzeit mit der Astronomy Engine berechnet. Alle verwendeten Bilder sind gemeinfrei (Public Domain) oder unter Creative-Commons-Lizenzen veroeffentlicht."
              : "Astronomical data is provided by NASA Open Data APIs. Planet positions are calculated in real-time using Astronomy Engine. All images used are in the public domain or published under Creative Commons licenses."}
          </p>
        </div>
      </section>
    </div>
  );
}
