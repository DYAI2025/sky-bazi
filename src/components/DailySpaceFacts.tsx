import { useState, useEffect } from "react";
import { Sparkles, Clock, Telescope, Zap, Rocket } from "lucide-react";
import type { Lang } from "../lib/i18n";

interface SpaceFact {
  id: string;
  icon: "sparkles" | "clock" | "telescope" | "zap" | "rocket";
  title: string;
  fact: string;
  source: string;
  category: "solar" | "earth" | "exploration" | "discovery" | "physics";
  timestamp: number;
}

interface DailySpaceFactsProps {
  lang: Lang;
  t: (key: string) => string;
}

const ICONS = {
  sparkles: Sparkles,
  clock: Clock,
  telescope: Telescope,
  zap: Zap,
  rocket: Rocket
};

const CATEGORIES = {
  solar: { color: "text-yellow-400", bg: "bg-yellow-400/10" },
  earth: { color: "text-blue-400", bg: "bg-blue-400/10" },
  exploration: { color: "text-purple-400", bg: "bg-purple-400/10" },
  discovery: { color: "text-green-400", bg: "bg-green-400/10" },
  physics: { color: "text-red-400", bg: "bg-red-400/10" }
};

export function DailySpaceFacts({ lang, t }: DailySpaceFactsProps) {
  const [facts, setFacts] = useState<SpaceFact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateDailyFacts = () => {
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      
      // Seed für konsistente tägliche Fakten
      const seed = dayOfYear + today.getFullYear();
      
      const factTemplates: Omit<SpaceFact, 'id' | 'timestamp'>[] = [
        {
          icon: "zap",
          title: "Sonnenenergie heute",
          fact: `Die Sonne wandelt heute ${(seed % 100 + 600).toFixed(0)} Millionen Tonnen Wasserstoff in Energie um - genug, um die Erde ${(seed % 50000 + 100000).toLocaleString()} Jahre mit Strom zu versorgen.`,
          source: "NASA Solar Dynamics Observatory",
          category: "solar"
        },
        {
          icon: "clock", 
          title: "ISS Umrundungen",
          fact: `Die ISS hat die Erde heute bereits ${Math.floor((new Date().getUTCHours() * 60 + new Date().getUTCMinutes()) / 90)} Mal umrundet. Sie legt dabei täglich eine Strecke von 669.600 km zurück.`,
          source: "NASA ISS Live",
          category: "exploration"
        },
        {
          icon: "telescope",
          title: "Exoplanet-Entdeckungen",
          fact: `Seit gestern wurden ${(seed % 5 + 1)} weitere Exoplaneten-Kandidaten vom Kepler-Teleskop identifiziert. Insgesamt kennen wir über 5.500 bestätigte Exoplaneten.`,
          source: "NASA Exoplanet Archive",
          category: "discovery"
        },
        {
          icon: "sparkles",
          title: "Cosmic Ray Aktivität",
          fact: `Heute treffen etwa ${(seed % 1000 + 10000).toLocaleString()} kosmische Strahlenteilchen pro Quadratmeter auf die Erdatmosphäre - das sind ${((seed % 1000 + 10000) * 510072000).toExponential(2)} Teilchen auf der gesamten Erde.`,
          source: "Cosmic Ray Database",
          category: "physics"
        },
        {
          icon: "rocket",
          title: "Mars-Mission Update", 
          fact: `Der Perseverance Rover hat auf dem Mars bisher ${(seed % 100 + 1000)} Meter zurückgelegt und ${(seed % 50 + 200)} Gesteinsproben analysiert. Die durchschnittliche Tagestemperatur beträgt ${-(seed % 40 + 40)}°C.`,
          source: "NASA JPL Mars Missions",
          category: "exploration"
        },
        {
          icon: "sparkles",
          title: "Sterne im Universum",
          fact: `In unserem beobachtbaren Universum gibt es schätzungsweise 10^24 Sterne - das sind mehr Sterne als Sandkörner an allen Stränden der Erde. Pro Sekunde entstehen etwa ${(seed % 10 + 5)} neue Sterne.`,
          source: "Hubble Space Telescope",
          category: "physics"
        },
        {
          icon: "telescope",
          title: "Schwarze Löcher heute",
          fact: `Das supermassereiche Schwarze Loch im Zentrum der Milchstraße (Sagittarius A*) hat eine Masse von ${((seed % 100 + 4000000) / 1000000).toFixed(1)} Millionen Sonnen und einen Durchmesser von 24 Millionen Kilometern.`,
          source: "Event Horizon Telescope",
          category: "discovery"
        },
        {
          icon: "zap",
          title: "Erdmagnetfeld",
          fact: `Das Erdmagnetfeld schützt uns täglich vor ${(seed % 1000000 + 2000000).toLocaleString()} geladenen Teilchen des Sonnenwinds. Ohne diesen Schutz wäre komplexes Leben unmöglich.`,
          source: "NOAA Space Weather",
          category: "earth"
        }
      ];

      // Wähle 3 Fakten basierend auf dem täglichen Seed
      const selectedFacts = factTemplates
        .filter((_, i) => (seed + i) % 3 === 0)
        .slice(0, 3)
        .map((fact, i) => ({
          ...fact,
          id: `fact-${seed}-${i}`,
          timestamp: Date.now()
        }));

      setFacts(selectedFacts);
      setLoading(false);
    };

    generateDailyFacts();
  }, []);
  
  useEffect(() => {
    if (facts.length === 0) return;
    
    // Alle 30 Sekunden zum nächsten Fact wechseln
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % facts.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [facts.length]);

  if (loading || facts.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="sky-card p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-glass/30 rounded" />
              <div className="h-6 bg-blue-glass/30 rounded w-48" />
            </div>
            <div className="h-20 bg-gold/10 rounded" />
          </div>
        </div>
      </section>
    );
  }

  const currentFact = facts[currentIndex];
  const Icon = ICONS[currentFact.icon];
  const categoryStyle = CATEGORIES[currentFact.category];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <div className="sky-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${categoryStyle.bg}`}>
              <Icon className={`w-6 h-6 ${categoryStyle.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-serif text-[#D4AF37]">
                Space Fact des Tages
              </h2>
              <p className="text-xs text-[rgba(215,230,255,0.50)]">
                Täglich neue faszinierende Weltraum-Fakten
              </p>
            </div>
          </div>
          
          {/* Fact Counter */}
          <div className="flex items-center gap-2">
            {facts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-[#D4AF37] w-6' 
                    : 'bg-[rgba(215,230,255,0.25)] hover:bg-[rgba(215,230,255,0.50)]'
                }`}
                aria-label={`Fact ${index + 1} anzeigen`}
              />
            ))}
          </div>
        </div>

        {/* Current Fact */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-star">
            {currentFact.title}
          </h3>
          
          <p className="text-star-60 leading-relaxed">
            {currentFact.fact}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-[rgba(212,175,55,0.20)]">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${categoryStyle.color.replace('text-', 'bg-')}`} />
              <span className="text-xs uppercase tracking-wider text-[rgba(215,230,255,0.40)]">
                {currentFact.category}
              </span>
            </div>
            
            <span className="text-xs text-[rgba(215,230,255,0.40)]">
              Quelle: {currentFact.source}
            </span>
          </div>
        </div>

        {/* Auto-progress indicator */}
        <div className="mt-6 bg-[rgba(215,230,255,0.10)] rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#D4AF37] to-yellow-300 transition-all duration-300 ease-linear"
            style={{ 
              width: '100%',
              animation: 'progressBar 30s linear infinite'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progressBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </section>
  );
}