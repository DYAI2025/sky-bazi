import { useState, useCallback } from "react";

export type Lang = "de" | "en";

const translations = {
  "site.title": { de: "Der Himmel ueber deiner Signatur", en: "The Sky Above Your Signature" },
  "site.brand": { de: "Bazodiac Sky", en: "Bazodiac Sky" },
  "nav.ring": { de: "Deine Signatur", en: "Your Signature" },

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

  "funnel.headline": { de: "Was bedeutet das fuer DEINE Signatur?", en: "What does this mean for YOUR Signature?" },
  "funnel.body": { de: "Die Planeten stehen fuer alle gleich am Himmel. Aber was sie fuer DICH bedeuten, haengt von deiner persoenlichen Signatur ab.", en: "The planets are in the same position for everyone. But what they mean for YOU depends on your personal Signature." },
  "funnel.cta": { de: "Signatur erstellen", en: "Create Signature" },
  "funnel.weather": { de: "Sonnenstuerme beeinflussen dein Energiefeld. Wie stark du reagierst, haengt von deiner Signatur ab.", en: "Solar storms affect your energy field. How strongly you react depends on your Signature." },
  "funnel.weatherCta": { de: "Dein Signatur-Wetter entdecken", en: "Discover your Signature weather" },

  "nav.earth": { de: "Erde", en: "Earth" },
  "nav.mars":  { de: "Mars-Rover", en: "Mars Rover" },

  "earth.title":      { de: "Unsere Heimat", en: "Our Home" },
  "earth.subtitle":   { de: "Live-Ansicht — NASA EPIC (DSCOVR-Satellit)", en: "Live view — NASA EPIC (DSCOVR satellite)" },
  "earth.distance":   { de: "Entfernung: ~1,5 Millionen km (L1-Punkt)", en: "Distance: ~1.5 million km (L1 point)" },
  "earth.blick":      { de: "Blick auf Längengrad", en: "View at longitude" },
  "earth.timestamp":  { de: "Aufnahme", en: "Captured" },
  "earth.images":     { de: "Bilder des Tages — Erde drehen", en: "Images of the day — rotate Earth" },
  "earth.source":     { de: "Quelle: NASA EPIC · DSCOVR-Satellit am L1-Lagrange-Punkt", en: "Source: NASA EPIC · DSCOVR satellite at the L1 Lagrange point" },
  "earth.loading":    { de: "Lade Erdansicht...", en: "Loading Earth view..." },
  "earth.fact":       { de: "Dieses Foto zeigt die Erde exakt so, wie sie von der Sonne aus gesehen wird — die vollständig sonnenbeschienene Seite.", en: "This photo shows Earth exactly as it appears from the Sun — the fully sunlit side." },

  "mars.title":       { de: "Mars-Rover Curiosity", en: "Mars Rover Curiosity" },
  "mars.subtitle":    { de: "Live-Postkarte vom Gale-Krater — NASA", en: "Live postcard from Gale Crater — NASA" },
  "mars.status":      { de: "Rover Curiosity sendet Daten...", en: "Rover Curiosity is transmitting data..." },
  "mars.sol":         { de: "Missionstag (Sol)", en: "Mission Day (Sol)" },
  "mars.earthdate":   { de: "Erd-Datum", en: "Earth Date" },
  "mars.camera":      { de: "Kamera", en: "Camera" },
  "mars.allcams":     { de: "Alle", en: "All" },
  "mars.loading":     { de: "Lade Mars-Bilder...", en: "Loading Mars images..." },
  "mars.source":      { de: "Quelle: NASA Mars Rover Photos API · Rover: Curiosity · Gale-Krater", en: "Source: NASA Mars Rover Photos API · Rover: Curiosity · Gale Crater" },

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
