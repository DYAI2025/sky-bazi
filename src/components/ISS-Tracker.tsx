import { useState, useEffect } from "react";
import { Globe, Satellite, MapPin, Gauge } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { API_ENDPOINTS, DEFAULT_COORDINATES } from "../constants/apis";

interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
  visibility: "daylight" | "eclipse";
}

interface ISSTrackerProps {
  lang: Lang;
  t: (key: string) => string;
}

export function ISSTracker({ lang, t }: ISSTrackerProps) {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchISSPosition = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        
        // ISS Current Location API (free, no key needed)
        const [posRes, velocityRes] = await Promise.all([
          fetch(API_ENDPOINTS.ISS_POSITION),
          fetch(`${API_ENDPOINTS.ISS_PASSES}?lat=${DEFAULT_COORDINATES.LATITUDE}&lon=${DEFAULT_COORDINATES.LONGITUDE}`) // Berlin coordinates
        ]);

        if (!posRes.ok) throw new Error('ISS Position API error');
        
        const posData = await posRes.json();
        const lat = parseFloat(posData.iss_position.latitude);
        const lng = parseFloat(posData.iss_position.longitude);
        
        // Berechne ungefähre Geschwindigkeit (ISS: ~7.66 km/s)
        const velocity = 7.66;
        
        // Bestimme ob ISS im Sonnenlicht oder Erdschatten
        const sunAngle = calculateSunAngle(lat, lng);
        const visibility = sunAngle > 0 ? "daylight" : "eclipse";
        
        if (mounted) {
          setPosition({
            latitude: lat,
            longitude: lng,
            altitude: 408, // ISS durchschnittliche Höhe in km
            velocity: velocity,
            timestamp: posData.timestamp * 1000,
            visibility
          });
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchISSPosition();
    const interval = setInterval(fetchISSPosition, 10000); // Alle 10 Sekunden aktualisieren
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatCoordinate = (coord: number, type: 'lat' | 'lng'): string => {
    const abs = Math.abs(coord);
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    return `${abs.toFixed(2)}° ${direction}`;
  };

  const calculateSunAngle = (lat: number, lng: number): number => {
    // Vereinfachte Berechnung - in Realität komplexer
    const now = new Date();
    const hourAngle = (now.getUTCHours() + lng / 15) % 24;
    return Math.cos((hourAngle - 12) * Math.PI / 12);
  };

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="sky-card p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-glass/30 rounded" />
              <div className="h-6 bg-blue-glass/30 rounded w-48" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-blue-glass/20 rounded w-16" />
                  <div className="h-8 bg-gold/20 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !position) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="sky-card p-6 text-center">
          <Satellite className="w-12 h-12 text-red-400/60 mx-auto mb-4" />
          <h3 className="text-lg font-serif text-star mb-2">
            ISS Position nicht verfügbar
          </h3>
          <p className="text-star-60 text-sm">
            {error || 'Verbindung zur ISS-API fehlgeschlagen'}
          </p>
        </div>
      </section>
    );
  }

  const timeSinceUpdate = Math.floor((Date.now() - position.timestamp) / 1000);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <div className="sky-card p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Satellite className="w-8 h-8 text-[#D4AF37]" />
            <div 
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                position.visibility === 'daylight' ? 'bg-yellow-400' : 'bg-blue-400'
              } animate-pulse`}
              aria-label={position.visibility === 'daylight' ? 'ISS im Sonnenlicht' : 'ISS im Erdschatten'}
              role="status"
            />
          </div>
          <div>
            <h2 className="text-xl font-serif text-[#D4AF37]">
              ISS Live Position
            </h2>
            <p className="text-xs text-[rgba(215,230,255,0.50)]">
              Aktualisiert vor {timeSinceUpdate}s • {position.visibility === 'daylight' ? '☀️ Sonnenlicht' : '🌙 Erdschatten'}
            </p>
          </div>
        </div>

        {/* Daten Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <MapPin className="w-4 h-4 text-[rgba(215,230,255,0.50)]" />
              <span className="text-xs uppercase tracking-wider text-[rgba(215,230,255,0.50)]">
                Breitengrad
              </span>
            </div>
            <div className="text-lg font-mono text-[#D4AF37]">
              {formatCoordinate(position.latitude, 'lat')}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <MapPin className="w-4 h-4 text-[rgba(215,230,255,0.50)]" />
              <span className="text-xs uppercase tracking-wider text-[rgba(215,230,255,0.50)]">
                Längengrad
              </span>
            </div>
            <div className="text-lg font-mono text-[#D4AF37]">
              {formatCoordinate(position.longitude, 'lng')}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Globe className="w-4 h-4 text-[rgba(215,230,255,0.50)]" />
              <span className="text-xs uppercase tracking-wider text-[rgba(215,230,255,0.50)]">
                Höhe
              </span>
            </div>
            <div className="text-lg font-mono text-[#D4AF37]">
              {position.altitude} km
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Gauge className="w-4 h-4 text-[rgba(215,230,255,0.50)]" />
              <span className="text-xs uppercase tracking-wider text-[rgba(215,230,255,0.50)]">
                Geschw.
              </span>
            </div>
            <div className="text-lg font-mono text-[#D4AF37]">
              {position.velocity.toFixed(1)} km/s
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.20)] rounded-lg p-4">
          <p className="text-sm text-[rgba(215,230,255,0.75)] leading-relaxed">
            <strong className="text-[#D4AF37]">ISS Fakten:</strong> Die Internationale Raumstation umkreist die Erde alle 90 Minuten in einer Höhe von ca. 408 km. 
            Sie bewegt sich mit einer Geschwindigkeit von 27.600 km/h und ist das größte von Menschen gebaute Objekt im Weltraum.
            {position.visibility === 'eclipse' && (
              <span className="ml-2">🌙 <em>Die ISS befindet sich derzeit im Erdschatten.</em></span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}