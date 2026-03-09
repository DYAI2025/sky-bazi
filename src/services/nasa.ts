const API_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY";
const BASE = "https://api.nasa.gov";

// ── Cache Layer ───────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCached<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(`sky:${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > ttlMs) {
      localStorage.removeItem(`sky:${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(`sky:${key}`, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

// ── APOD ──────────────────────────────────────────────────────────────────

export interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  date: string;
  media_type: "image" | "video";
  copyright?: string;
}

const APOD_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function fetchApod(): Promise<ApodData> {
  const cached = getCached<ApodData>("apod", APOD_TTL);
  if (cached) return cached;

  const res = await fetch(`${BASE}/planetary/apod?api_key=${API_KEY}`);
  if (!res.ok) throw new Error(`APOD API error: ${res.status}`);
  const data: ApodData = await res.json();
  setCache("apod", data);
  return data;
}

// ── DONKI — Solar Flares ──────────────────────────────────────────────────

export interface SolarFlare {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string | null;
  classType: string; // A, B, C, M, X + magnitude (e.g. "M1.2")
  sourceLocation: string;
}

// ── DONKI — Geomagnetic Storms ────────────────────────────────────────────

export interface GeoStorm {
  gstID: string;
  startTime: string;
  allKpIndex: Array<{
    kpIndex: number;
    observedTime: string;
    source: string;
  }>;
}

export interface SpaceWeatherData {
  flares: SolarFlare[];
  storms: GeoStorm[];
  fetchedAt: number;
}

const WEATHER_TTL = 60 * 60 * 1000; // 1 hour

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchSpaceWeather(): Promise<SpaceWeatherData> {
  const cached = getCached<SpaceWeatherData>("weather", WEATHER_TTL);
  if (cached) return cached;

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);

  const startStr = dateStr(start);
  const endStr = dateStr(end);

  const [flaresRes, stormsRes] = await Promise.all([
    fetch(`${BASE}/DONKI/FLR?startDate=${startStr}&endDate=${endStr}&api_key=${API_KEY}`),
    fetch(`${BASE}/DONKI/GST?startDate=${startStr}&endDate=${endStr}&api_key=${API_KEY}`),
  ]);

  const flares: SolarFlare[] = flaresRes.ok ? await flaresRes.json() : [];
  const storms: GeoStorm[] = stormsRes.ok ? await stormsRes.json() : [];

  // DONKI returns empty string for no results on some endpoints
  const data: SpaceWeatherData = {
    flares: Array.isArray(flares) ? flares : [],
    storms: Array.isArray(storms) ? storms : [],
    fetchedAt: Date.now(),
  };

  setCache("weather", data);
  return data;
}

// ── Helpers ───────────────────────────────────────────────────────────────

export type SolarActivityLevel = "quiet" | "active" | "storm" | "severe";

export function classifyFlareActivity(flares: SolarFlare[]): SolarActivityLevel {
  if (flares.length === 0) return "quiet";
  const strongest = flares.reduce((max, f) => {
    const letter = f.classType.charAt(0);
    const maxLetter = max.classType.charAt(0);
    const order = "ABCMX";
    return order.indexOf(letter) > order.indexOf(maxLetter) ? f : max;
  }, flares[0]);
  const letter = strongest.classType.charAt(0);
  if (letter === "X") return "severe";
  if (letter === "M") return "storm";
  if (letter === "C") return "active";
  return "quiet";
}

export function classifyGeoActivity(storms: GeoStorm[]): { level: SolarActivityLevel; maxKp: number } {
  if (storms.length === 0) return { level: "quiet", maxKp: 0 };
  let maxKp = 0;
  for (const storm of storms) {
    for (const kp of storm.allKpIndex) {
      if (kp.kpIndex > maxKp) maxKp = kp.kpIndex;
    }
  }
  if (maxKp >= 8) return { level: "severe", maxKp };
  if (maxKp >= 5) return { level: "storm", maxKp };
  if (maxKp >= 4) return { level: "active", maxKp };
  return { level: "quiet", maxKp };
}
