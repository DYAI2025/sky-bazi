import { useState, useEffect, useCallback } from "react";
import type { Lang } from "../lib/i18n";

const CONSENT_KEY = "sky:cookie-consent";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1712273263687132";

function loadAdSense() {
  if (document.querySelector(`script[src*="adsbygoogle"]`)) return;
  const s = document.createElement("script");
  s.src = ADSENSE_SRC;
  s.async = true;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
}

type ConsentState = "pending" | "accepted" | "rejected";

function getStoredConsent(): ConsentState {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch { /* ignore */ }
  return "pending";
}

/** Push consent update to Google's consent mode (gtag). */
function updateGoogleConsent(granted: boolean) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", {
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
    });
  }
}

interface Props {
  lang: Lang;
}

export function CookieConsent({ lang }: Props) {
  const [state, setState] = useState<ConsentState>(() => getStoredConsent());

  useEffect(() => {
    updateGoogleConsent(state === "accepted");
    if (state === "accepted") loadAdSense();
  }, [state]);

  const accept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setState("accepted");
  }, []);

  const reject = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setState("rejected");
  }, []);

  if (state !== "pending") return null;

  const de = lang === "de";

  return (
    <div className="fixed bottom-0 inset-x-0 z-[200] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-[#0a1120]/95 backdrop-blur-md border border-[rgba(70,130,220,0.18)] rounded-2xl p-5 sm:p-6 shadow-2xl">
        <p className="text-sm text-[rgba(215,230,255,0.75)] leading-relaxed mb-4">
          {de
            ? "Diese Website verwendet Cookies fuer Werbung (Google AdSense) und zur Zwischenspeicherung von NASA-Daten. Mit 'Akzeptieren' stimmen Sie der Nutzung von Werbe-Cookies zu. "
            : "This website uses cookies for advertising (Google AdSense) and to cache NASA data. By clicking 'Accept', you consent to the use of advertising cookies. "}
          <a href="/datenschutz" className="text-[#D4AF37]/70 hover:text-[#D4AF37] underline underline-offset-2 transition-colors">
            {de ? "Datenschutzerklaerung" : "Privacy policy"}
          </a>
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={accept}
            className="px-5 py-2 bg-[#D4AF37] text-[#020509] text-sm font-semibold rounded-full hover:bg-[#e8c84a] transition-colors"
          >
            {de ? "Akzeptieren" : "Accept"}
          </button>
          <button
            onClick={reject}
            className="px-5 py-2 border border-[rgba(215,230,255,0.15)] text-[rgba(215,230,255,0.60)] text-sm rounded-full hover:border-[rgba(215,230,255,0.30)] hover:text-[rgba(215,230,255,0.80)] transition-colors"
          >
            {de ? "Nur Essenzielle" : "Essential only"}
          </button>
        </div>
      </div>
    </div>
  );
}
