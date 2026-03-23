import { Link } from "react-router-dom";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
}

export function DatenschutzPage({ lang }: Props) {
  const de = lang === "de";

  return (
    <div className="min-h-screen bg-[#020509]">
      <section className="max-w-3xl mx-auto px-4 sm:px-8 pt-28 pb-16">
        <Link to="/" className="text-[11px] uppercase tracking-[0.2em] text-[rgba(215,230,255,0.35)] hover:text-[#D4AF37] transition-colors mb-8 inline-block">
          &larr; {de ? "Zurück" : "Back"}
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl text-white mb-8">
          {de ? "Datenschutzerklärung" : "Privacy Policy"}
        </h1>

        <div className="prose prose-invert prose-sm max-w-none text-[rgba(215,230,255,0.75)] space-y-6 leading-relaxed">

          {/* --- Overview --- */}
          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {de ? "1. Datenschutz auf einen Blick" : "1. Privacy at a glance"}
          </h2>
          <p>
            {de
              ? "Diese Datenschutzerklärung erläutert, welche Daten erhoben werden, wenn Sie sky.bazodiac.space (nachfolgend 'Website') besuchen, und wie diese Daten verwendet werden."
              : "This privacy policy explains what data is collected when you visit sky.bazodiac.space (hereinafter 'website') and how this data is used."}
          </p>

          {/* --- Controller --- */}
          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {de ? "2. Verantwortlicher" : "2. Data controller"}
          </h2>
          <p>
            Benjamin Poersch<br />
            Grazer Damm 207<br />
            12157 Berlin, Deutschland<br />
            E-Mail: <a href="mailto:connect@dyai.cloud" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">connect@dyai.cloud</a>
          </p>

          {/* --- Hosting --- */}
          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {de ? "3. Hosting" : "3. Hosting"}
          </h2>
          <p>
            {de
              ? "Die Website wird bei Railway (Railway Corp., San Francisco, USA) gehostet. Beim Besuch der Website werden automatisch Informationen in Server-Logfiles gespeichert, darunter IP-Adresse, Browsertyp, Zeitpunkt des Zugriffs und aufgerufene Seiten. Diese Daten werden zur Sicherstellung des Betriebs verarbeitet (Art. 6 Abs. 1 lit. f DSGVO)."
              : "The website is hosted by Railway (Railway Corp., San Francisco, USA). When visiting the website, information is automatically stored in server log files, including IP address, browser type, time of access, and pages visited. This data is processed to ensure proper operation (Art. 6(1)(f) GDPR)."}
          </p>

          {/* --- Cookies --- */}
          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {de ? "4. Cookies und lokale Speicherung" : "4. Cookies and local storage"}
          </h2>
          <p>
            {de
              ? "Diese Website verwendet localStorage im Browser, um NASA-API-Antworten zwischenzuspeichern und die Anzahl der API-Anfragen zu reduzieren. Diese Daten enthalten keine persönlichen Informationen. Darüber hinaus wird Ihre Cookie-Einwilligung im localStorage gespeichert."
              : "This website uses browser localStorage to cache NASA API responses and reduce the number of API requests. This data does not contain personal information. Additionally, your cookie consent preference is stored in localStorage."}
          </p>

          {/* --- Google AdSense --- */}
          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {de ? "5. Google AdSense" : "5. Google AdSense"}
          </h2>
          <p>
            {de
              ? "Diese Website nutzt Google AdSense, einen Dienst der Google Ireland Limited ('Google'), zur Einbindung von Werbeanzeigen. Google AdSense verwendet Cookies und ähnliche Technologien, um Anzeigen basierend auf Ihren früheren Besuchen auf dieser und anderen Websites zu schalten. Google kann dabei Daten an Server in den USA übertragen."
              : "This website uses Google AdSense, a service provided by Google Ireland Limited ('Google'), to display advertisements. Google AdSense uses cookies and similar technologies to serve ads based on your previous visits to this and other websites. Google may transfer data to servers in the United States."}
          </p>
          <p>
            {de
              ? "Sie können personalisierte Werbung in den Google-Anzeigeneinstellungen deaktivieren: "
              : "You can opt out of personalized advertising in Google Ad Settings: "}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">
              adssettings.google.com
            </a>
          </p>
          <p>
            {de
              ? "Werbecookies werden erst nach Ihrer ausdrücklichen Einwilligung gesetzt (Art. 6 Abs. 1 lit. a DSGVO). Sie können Ihre Einwilligung jederzeit über das Cookie-Banner widerrufen."
              : "Advertising cookies are only set after your explicit consent (Art. 6(1)(a) GDPR). You can revoke your consent at any time via the cookie banner."}
          </p>

          {/* --- NASA APIs --- */}
          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {de ? "6. Externe APIs (NASA)" : "6. External APIs (NASA)"}
          </h2>
          <p>
            {de
              ? "Die Website ruft Daten von den offenen NASA-APIs ab (api.nasa.gov). Dabei wird Ihre IP-Adresse an die NASA-Server übermittelt. Die NASA unterliegt US-amerikanischem Recht. Weitere Informationen: "
              : "The website retrieves data from NASA's open APIs (api.nasa.gov). Your IP address is transmitted to NASA servers in the process. NASA is subject to US law. More information: "}
            <a href="https://api.nasa.gov" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors">
              api.nasa.gov
            </a>
          </p>

          {/* --- Your Rights --- */}
          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {de ? "7. Ihre Rechte" : "7. Your rights"}
          </h2>
          <p>
            {de
              ? "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) und Widerspruch (Art. 21 DSGVO). Zur Ausübung Ihrer Rechte wenden Sie sich bitte an connect@dyai.cloud."
              : "You have the right to access (Art. 15 GDPR), rectification (Art. 16 GDPR), erasure (Art. 17 GDPR), restriction of processing (Art. 18 GDPR), data portability (Art. 20 GDPR), and objection (Art. 21 GDPR). To exercise your rights, please contact connect@dyai.cloud."}
          </p>
          <p>
            {de
              ? "Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren."
              : "You also have the right to lodge a complaint with a data protection supervisory authority."}
          </p>

          {/* --- Changes --- */}
          <h2 className="font-serif text-xl text-white mt-8 mb-3">
            {de ? "8. Änderungen" : "8. Changes"}
          </h2>
          <p>
            {de
              ? "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder Änderungen des Dienstes anzupassen. Stand: März 2026."
              : "We reserve the right to update this privacy policy to reflect changes in legal requirements or service changes. Last updated: March 2026."}
          </p>
        </div>
      </section>
    </div>
  );
}
