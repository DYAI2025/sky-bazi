import { useState, useCallback } from "react";

export type Lang = "de" | "en";

const translations = {
  "site.title": { de: "Der Himmel über deiner Signatur", en: "The Sky Above Your Signature" },
  "site.brand": { de: "Bazodiac Sky", en: "Bazodiac Sky" },
  "nav.ring": { de: "Deine Signatur", en: "Your Signature" },

  "apod.title": { de: "Bild des Tages", en: "Picture of the Day" },
  "apod.credit": { de: "Quelle: NASA APOD", en: "Source: NASA APOD" },
  "apod.loading": { de: "Lade Bild des Tages...", en: "Loading picture of the day..." },
  "apod.video": { de: "Heute: Video statt Bild", en: "Today: Video instead of image" },

  "weather.title": { de: "Weltraumwetter", en: "Space Weather" },
  "weather.subtitle": { de: "Live-Daten der NASA DONKI", en: "Live data from NASA DONKI" },
  "weather.solar": { de: "Sonnenaktivität", en: "Solar Activity" },
  "weather.geo": { de: "Geomagnetisch", en: "Geomagnetic" },
  "weather.quiet": { de: "Ruhig", en: "Quiet" },
  "weather.active": { de: "Aktiv", en: "Active" },
  "weather.storm": { de: "Sturm", en: "Storm" },
  "weather.severe": { de: "Schwerer Sturm", en: "Severe Storm" },
  "weather.noFlares": { de: "Keine Flares in den letzten 7 Tagen", en: "No flares in the last 7 days" },
  "weather.noStorms": { de: "Keine Stürme in den letzten 7 Tagen", en: "No storms in the last 7 days" },
  "weather.lastFlare": { de: "Letzter Flare", en: "Last Flare" },
  "weather.kpIndex": { de: "Kp-Index", en: "Kp Index" },
  "weather.loading": { de: "Lade Weltraumwetter...", en: "Loading space weather..." },

  "planets.title": { de: "Planetenstand Heute", en: "Planet Positions Today" },
  "planets.subtitle": { de: "Echte astronomische Positionen, berechnet in Echtzeit", en: "Real astronomical positions, calculated in real-time" },
  "planets.retrograde": { de: "Rückläufig", en: "Retrograde" },
  "planets.sign": { de: "Zeichen", en: "Sign" },

  "funnel.headline": { de: "Was bedeutet das für DEINE Signatur?", en: "What does this mean for YOUR Signature?" },
  "funnel.body": { de: "Die Planeten stehen für alle gleich am Himmel. Aber was sie für DICH bedeuten, hängt von deiner persönlichen Signatur ab.", en: "The planets are in the same position for everyone. But what they mean for YOU depends on your personal Signature." },
  "funnel.cta": { de: "Signatur erstellen", en: "Create Signature" },
  "funnel.weather": { de: "Sonnenstürme beeinflussen dein Energiefeld. Wie stark du reagierst, hängt von deiner Signatur ab.", en: "Solar storms affect your energy field. How strongly you react depends on your Signature." },
  "funnel.weatherCta": { de: "Dein Signatur-Wetter entdecken", en: "Discover your Signature weather" },

  "nav.wissen": { de: "Wissen", en: "Knowledge" },
  "nav.earth": { de: "Erde", en: "Earth" },
  "nav.mars":  { de: "Mars-Rover", en: "Mars Rover" },

  "wissen.universum": { de: "Universum", en: "Universe" },
  "wissen.universum.sub": { de: "Der Himmel in voller Tiefe", en: "The sky in full depth" },
  "wissen.mensch": { de: "Mensch", en: "Human" },
  "wissen.mensch.sub": { de: "Was der Kosmos in uns bewegt", en: "What the cosmos moves within us" },

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

  // ── ISS Tracker ──────────────────────────────────────────────────────────
  "iss.title":       { de: "ISS Live-Position", en: "ISS Live Position" },
  "iss.subtitle":    { de: "Internationale Raumstation in Echtzeit", en: "International Space Station in real time" },
  "iss.latitude":    { de: "Breitengrad", en: "Latitude" },
  "iss.longitude":   { de: "Längengrad", en: "Longitude" },
  "iss.altitude":    { de: "Höhe", en: "Altitude" },
  "iss.velocity":    { de: "Geschwindigkeit", en: "Velocity" },
  "iss.daylight":    { de: "Sonnenlicht", en: "Daylight" },
  "iss.eclipse":     { de: "Erdschatten", en: "Eclipse" },
  "iss.location":    { de: "Befindet sich gerade über", en: "Currently located over" },
  "iss.overOcean":   { de: "dem Ozean", en: "the ocean" },
  "iss.daylightAria":{ de: "ISS im Sonnenlicht", en: "ISS in daylight" },
  "iss.eclipseAria": { de: "ISS im Erdschatten", en: "ISS in Earth's shadow" },
  "iss.updated":     { de: "Aktualisiert vor", en: "Updated" },
  "iss.secondsAgo":  { de: "Sek.", en: "s ago" },
  "iss.loading":     { de: "Lade ISS-Position...", en: "Loading ISS position..." },
  "iss.errorTitle":  { de: "ISS-Position nicht verfügbar", en: "ISS position unavailable" },
  "iss.errorBody":   { de: "Verbindung zur ISS-API fehlgeschlagen", en: "Failed to connect to the ISS API" },
  "iss.factsLabel":  { de: "ISS Fakten", en: "ISS Facts" },
  "iss.factsBody":   { de: "Die Internationale Raumstation umkreist die Erde alle 90 Minuten in einer Höhe von rund 408 km. Sie bewegt sich mit etwa 27.600 km/h und ist das größte von Menschen gebaute Objekt im Weltraum.", en: "The International Space Station orbits Earth every 90 minutes at an altitude of about 408 km. It travels at roughly 27,600 km/h and is the largest human-made object in space." },
  "iss.eclipseHint": { de: "Die ISS befindet sich derzeit im Erdschatten.", en: "The ISS is currently in Earth's shadow." },
  "iss.source":      { de: "Quelle: Where The ISS At? · Live-Telemetrie", en: "Source: Where The ISS At? · live telemetry" },

  // ── Daily Space Facts ────────────────────────────────────────────────────
  "facts.title":     { de: "Weltraum-Fakt des Tages", en: "Space Fact of the Day" },
  "facts.subtitle":  { de: "Verifizierte Fakten aus der Astronomie", en: "Verified facts from astronomy" },
  "facts.source":    { de: "Quelle", en: "Source" },
  "facts.show":      { de: "Fakt anzeigen", en: "Show fact" },
  "facts.cat.solar":       { de: "Sonne", en: "Solar" },
  "facts.cat.earth":       { de: "Erde", en: "Earth" },
  "facts.cat.exploration": { de: "Raumfahrt", en: "Exploration" },
  "facts.cat.discovery":   { de: "Entdeckung", en: "Discovery" },
  "facts.cat.physics":     { de: "Physik", en: "Physics" },

  "facts.solar.title":   { de: "Die Sonne als Fusionsreaktor", en: "The Sun as a Fusion Reactor" },
  "facts.solar.body":    { de: "Im Kern der Sonne werden pro Sekunde rund 600 Millionen Tonnen Wasserstoff zu Helium fusioniert. Dabei wird Materie in Energie umgewandelt — etwa 4 Millionen Tonnen pro Sekunde.", en: "At the Sun's core, about 600 million tonnes of hydrogen fuse into helium every second. Roughly 4 million tonnes of mass are converted to pure energy each second." },
  "facts.solar.source":  { de: "NASA Solar Dynamics Observatory", en: "NASA Solar Dynamics Observatory" },

  "facts.iss.title":     { de: "16 Sonnenaufgänge pro Tag", en: "16 Sunrises Per Day" },
  "facts.iss.body":      { de: "Die ISS umkreist die Erde etwa 16 Mal pro Tag — alle 90 Minuten ein Sonnenaufgang. Pro Tag legt sie ungefähr 660.000 km zurück.", en: "The ISS circles Earth about 16 times per day — one sunrise every 90 minutes. It travels roughly 660,000 km daily." },
  "facts.iss.source":    { de: "NASA Human Spaceflight", en: "NASA Human Spaceflight" },

  "facts.exo.title":     { de: "Über 5.800 bestätigte Exoplaneten", en: "Over 5,800 Confirmed Exoplanets" },
  "facts.exo.body":      { de: "Das NASA Exoplanet Archive verzeichnet derzeit mehr als 5.800 bestätigte Exoplaneten in über 4.300 Sternsystemen. Schätzungen gehen davon aus, dass jeder Stern im Schnitt mindestens einen Planeten besitzt.", en: "The NASA Exoplanet Archive currently lists more than 5,800 confirmed exoplanets across over 4,300 star systems. Estimates suggest that, on average, every star hosts at least one planet." },
  "facts.exo.source":    { de: "NASA Exoplanet Archive", en: "NASA Exoplanet Archive" },

  "facts.mars.title":    { de: "Mars: kalt, dünn, rot", en: "Mars: Cold, Thin, Red" },
  "facts.mars.body":     { de: "Die mittlere Oberflächentemperatur des Mars liegt bei etwa −63 °C. Sein atmosphärischer Druck beträgt nur 0,6 % des irdischen — flüssiges Wasser kann an der Oberfläche heute nicht stabil existieren.", en: "Mars has a mean surface temperature of around −63 °C. Its atmospheric pressure is only 0.6% of Earth's — liquid water cannot stably exist on its surface today." },
  "facts.mars.source":   { de: "NASA Mars Exploration Program", en: "NASA Mars Exploration Program" },

  "facts.stars.title":   { de: "Mehr Sterne als Sandkörner", en: "More Stars Than Grains of Sand" },
  "facts.stars.body":    { de: "Im beobachtbaren Universum existieren schätzungsweise 10²⁴ Sterne — mehr als alle Sandkörner an allen Stränden der Erde zusammen. Allein die Milchstraße enthält 100–400 Milliarden Sterne.", en: "The observable universe contains an estimated 10²⁴ stars — more than every grain of sand on every beach on Earth. The Milky Way alone holds 100–400 billion stars." },
  "facts.stars.source":  { de: "ESA / Hubble Space Telescope", en: "ESA / Hubble Space Telescope" },

  "facts.bh.title":      { de: "Sagittarius A*", en: "Sagittarius A*" },
  "facts.bh.body":       { de: "Im Zentrum unserer Milchstraße sitzt das supermassereiche Schwarze Loch Sagittarius A* mit etwa 4,3 Millionen Sonnenmassen. Sein Ereignishorizont misst rund 24 Millionen Kilometer im Durchmesser.", en: "At the heart of the Milky Way lies the supermassive black hole Sagittarius A*, weighing about 4.3 million solar masses. Its event horizon spans roughly 24 million kilometres." },
  "facts.bh.source":     { de: "Event Horizon Telescope Collaboration", en: "Event Horizon Telescope Collaboration" },

  "facts.mag.title":     { de: "Schutzschild Erdmagnetfeld", en: "Earth's Magnetic Shield" },
  "facts.mag.body":      { de: "Das Erdmagnetfeld lenkt den Sonnenwind ab — einen Teilchenstrom mit etwa 1 Million Tonnen pro Sekunde. Ohne dieses Feld hätte die Sonne unsere Atmosphäre über Milliarden Jahre weggetragen.", en: "Earth's magnetic field deflects the solar wind — a particle stream of roughly 1 million tonnes per second. Without it, the Sun would have stripped away our atmosphere over billions of years." },
  "facts.mag.source":    { de: "NOAA Space Weather Prediction Center", en: "NOAA Space Weather Prediction Center" },

  "facts.light.title":   { de: "Sonnenlicht braucht 8 Minuten", en: "Sunlight Takes 8 Minutes" },
  "facts.light.body":    { de: "Photonen aus dem Inneren der Sonne brauchen über 100.000 Jahre, um an die Oberfläche zu diffundieren — und dann nur 8 Minuten und 20 Sekunden bis zur Erde.", en: "Photons from the Sun's core take over 100,000 years to diffuse to its surface — and then just 8 minutes 20 seconds to reach Earth." },
  "facts.light.source":  { de: "NASA Goddard Space Flight Center", en: "NASA Goddard Space Flight Center" },

  "footer.data": { de: "Daten: NASA Open APIs", en: "Data: NASA Open APIs" },
  "footer.calc": { de: "Berechnungen: Astronomy Engine", en: "Calculations: Astronomy Engine" },
  "footer.main": { de: "bazodiac.space", en: "bazodiac.space" },
} satisfies Record<string, Record<Lang, string>>;

type Key = keyof typeof translations;

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem("sky:lang");
      if (stored === "en") return "en";
    } catch { /* ignore */ }
    return "de";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("sky:lang", l); } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key as Key];
      return entry ? entry[lang] : key;
    },
    [lang],
  );

  return { lang, setLang, t };
}
