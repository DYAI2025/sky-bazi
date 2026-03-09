import { useState, useCallback } from "react";

export type Lang = "de" | "en";

const translations = {
  "site.title": { de: "Der Himmel ueber deinem Ring", en: "The Sky Above Your Ring" },
  "site.brand": { de: "Bazodiac Sky", en: "Bazodiac Sky" },
  "nav.ring": { de: "Dein Ring", en: "Your Ring" },

  "apod.title": { de: "Bild des Tages", en: "Picture of the Day" },
  "apod.credit": { de: "Quelle: NASA APOD", en: "Source: NASA APOD" },
  "apod.loading": { de: "Lade Bild des Tages...", en: "Loading picture of the day..." },
  "apod.video": { de: "Heute: Video statt Bild", en: "Today: Video instead of image" },

  "weather.title": { de: "Weltraumwetter", en: "Space Weather" },
  "weather.subtitle": { de: "Live-Daten der NASA DONKI", en: "Live data from NASA DONKI" },
  "weather.solar": { de: "Sonnenaktivitaet", en: "Solar Activity" },
  "weather.geo": { de: "Geomagnetisch", en: "Geomagnetic" },
  "weather.quiet": { de: "Ruhig", en: "Quiet" },
  "weather.active": { de: "Aktiv", en: "Active" },
  "weather.storm": { de: "Sturm", en: "Storm" },
  "weather.severe": { de: "Schwerer Sturm", en: "Severe Storm" },
  "weather.noFlares": { de: "Keine Flares in den letzten 7 Tagen", en: "No flares in the last 7 days" },
  "weather.noStorms": { de: "Keine Stuerme in den letzten 7 Tagen", en: "No storms in the last 7 days" },
  "weather.lastFlare": { de: "Letzter Flare", en: "Last Flare" },
  "weather.kpIndex": { de: "Kp-Index", en: "Kp Index" },
  "weather.loading": { de: "Lade Weltraumwetter...", en: "Loading space weather..." },

  "planets.title": { de: "Planetenstand Heute", en: "Planet Positions Today" },
  "planets.subtitle": { de: "Echte astronomische Positionen, berechnet in Echtzeit", en: "Real astronomical positions, calculated in real-time" },
  "planets.retrograde": { de: "Ruecklaeufig", en: "Retrograde" },
  "planets.sign": { de: "Zeichen", en: "Sign" },

  "funnel.headline": { de: "Was bedeutet das fuer DEINEN Ring?", en: "What does this mean for YOUR Ring?" },
  "funnel.body": { de: "Die Planeten stehen fuer alle gleich am Himmel. Aber was sie fuer DICH bedeuten, haengt von deinem persoenlichen Ring ab.", en: "The planets are in the same position for everyone. But what they mean for YOU depends on your personal Ring." },
  "funnel.cta": { de: "Ring erstellen", en: "Create Ring" },
  "funnel.weather": { de: "Sonnenstuerme beeinflussen dein Energiefeld. Wie stark du reagierst, haengt von deinem Ring ab.", en: "Solar storms affect your energy field. How strongly you react depends on your Ring." },
  "funnel.weatherCta": { de: "Dein Ring-Wetter entdecken", en: "Discover your Ring weather" },

  "footer.data": { de: "Daten: NASA Open APIs", en: "Data: NASA Open APIs" },
  "footer.calc": { de: "Berechnungen: Astronomy Engine", en: "Calculations: Astronomy Engine" },
  "footer.main": { de: "bazodiac.space", en: "bazodiac.space" },
} satisfies Record<string, Record<Lang, string>>;

type Key = keyof typeof translations;

export function useLang() {
  const [lang, setLang] = useState<Lang>("de");

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key as Key];
      return entry ? entry[lang] : key;
    },
    [lang],
  );

  return { lang, setLang, t };
}
