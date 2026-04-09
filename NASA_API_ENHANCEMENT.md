# 🚀 NASA API Erweiterungen für Bazodiac Sky

## Neue interessante APIs für Live-Fakten:

### 1. ISS Current Location API
```typescript
// Internationale Raumstation Live-Position
export interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  footprint: number;
  daynum: number;
  solar_lat: number;
  solar_lon: number;
}
```

### 2. NASA TechPort API
```typescript
// Aktuelle NASA Projekte und Technologien
export interface TechProject {
  projectId: number;
  title: string;
  description: string;
  primaryTechnologyTaxonomyNodes: string[];
  startDate: string;
  endDate: string;
  benefits: string;
}
```

### 3. NASA Exoplanet Archive
```typescript
// Entdeckte Exoplaneten
export interface Exoplanet {
  pl_name: string;
  hostname: string;
  sy_dist: number; // Entfernung in Parsec
  pl_rade: number; // Radius in Erdradien
  pl_masse: number; // Masse in Erdmassen
  pl_eqt: number; // Gleichgewichtstemperatur
  disc_year: number;
}
```

### 4. NASA SkyView Virtual Telescope
```typescript
// Himmelsobjekt-Bilder
export interface SkyViewImage {
  object: string;
  survey: string;
  coordinates: { ra: number; dec: number };
  imageUrl: string;
  fov: number;
}
```

### 5. NASA Asteroid Watch API
```typescript
// Aktuelle Asteroiden-Überwachung
export interface AsteroidWatch {
  name: string;
  id: string;
  close_approach_date: string;
  velocity_kms: number;
  distance_km: number;
  size_min_m: number;
  size_max_m: number;
  threat_level: "low" | "medium" | "high";
}
```

## Implementation Beispiele:

### ISS Live Tracker Component
```tsx
export function ISSTracker({ lang, t }: { lang: Lang; t: (k: string) => string }) {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  
  useEffect(() => {
    const fetchISS = async () => {
      const res = await fetch('http://api.open-notify.org/iss-now.json');
      const data = await res.json();
      setPosition({
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        // ... weitere Daten
      });
    };
    fetchISS();
    const interval = setInterval(fetchISS, 10000); // Alle 10 Sekunden
    return () => clearInterval(interval);
  }, []);
}
```

### Tagesaktuelle Space Facts
```tsx
export function DailySpaceFacts({ lang }: { lang: Lang }) {
  const facts = [
    "Die ISS umkreist die Erde alle 90 Minuten",
    "Heute wurden X neue Exoplaneten entdeckt",
    "Die Sonne produziert jede Sekunde 4 Millionen Tonnen Masse zu Energie",
    "Der nächste Asteroid passiert uns in X Tagen"
  ];
}
```

## Live-Daten Integration:
- ISS Position alle 10 Sekunden aktualisieren
- Tägliche Exoplanet-Entdeckungen
- Aktuelle NASA Mission Updates
- Live Solar Activity Index
- Astronomische Events des Tages