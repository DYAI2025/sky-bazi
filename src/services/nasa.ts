const API_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY";
const BASE = "https://api.nasa.gov";

/** True when running on the public DEMO_KEY — components can show a hint */
export const IS_DEMO_KEY = API_KEY === "DEMO_KEY";

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

// ── 429 Rate-limit backoff ────────────────────────────────────────────────
// When an endpoint returns 429 we cache a sentinel for 30 min so subsequent
// renders don't hammer the API and burn through the daily quota.

const RATE_LIMIT_TTL = 30 * 60 * 1000; // 30 minutes

function isRateLimited(cacheKey: string): boolean {
  return getCached<boolean>(`rl:${cacheKey}`, RATE_LIMIT_TTL) === true;
}

function markRateLimited(cacheKey: string): void {
  setCache(`rl:${cacheKey}`, true);
}

// ── In-flight deduplication ───────────────────────────────────────────────
// Prevents N concurrent React mounts from firing N identical requests.
// The second caller waits for the same Promise the first caller started.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inFlight = new Map<string, Promise<any>>();

function fetchOnce<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (inFlight.has(key)) return inFlight.get(key) as Promise<T>;
  const p = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, p);
  return p;
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

const APOD_CACHE_KEY = "apod";
const APOD_TTL = 12 * 60 * 60 * 1000; // 12 hours — APOD changes once daily

export async function fetchApod(): Promise<ApodData> {
  return fetchOnce(APOD_CACHE_KEY, async () => {
    const cached = getCached<ApodData>(APOD_CACHE_KEY, APOD_TTL);
    if (cached) return cached;
    if (isRateLimited(APOD_CACHE_KEY)) throw new Error("Rate limited");

    const res = await fetch(`${BASE}/planetary/apod?api_key=${API_KEY}`);
    if (res.status === 429) { markRateLimited(APOD_CACHE_KEY); throw new Error("Rate limited"); }
    if (!res.ok) throw new Error(`APOD API error: ${res.status}`);
    const data: ApodData = await res.json();
    setCache(APOD_CACHE_KEY, data);
    return data;
  });
}

// ── DONKI — Solar Flares ──────────────────────────────────────────────────

export interface SolarFlare {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string | null;
  classType: string; // A, B, C, M, X + magnitude (e.g. "M1.2")
  sourceLocation: string;
  instruments?: Array<{ displayName: string }>;
}

// ── DONKI — Coronal Mass Ejections ────────────────────────────────────────

export interface CmeEnlil {
  modelCompletionTime: string;
  au: number;
  isEarthTargeted: boolean;
  estimatedArrivalTime: string | null;
  estimatedDuration: number | null;
  kp_18?: number | null;
  kp_90?: number | null;
  kp_135?: number | null;
  kp_180?: number | null;
}

export interface CmeAnalysis {
  isMostAccurate: boolean;
  speed: number;
  halfAngle: number;
  type: string; // "S" = Slow, "C" = Common, "R" = Rare/Fast
  catalog: string;
  submissionTime: string;
  enlilList: CmeEnlil[] | null;
}

export interface CME {
  activityID: string;
  startTime: string;
  sourceLocation: string;
  activeRegionNum?: number;
  note?: string;
  instruments: Array<{ displayName: string }>;
  cmeAnalyses: CmeAnalysis[] | null;
  linkedEvents: Array<{ activityID: string }> | null;
  catalog: string;
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
  cmes: CME[];
  fetchedAt: number;
}

// v3: bumped TTL to 4 h (was 1 h) to cut daily calls from 72 → 18
const WEATHER_CACHE_KEY = "weather_v3";
const WEATHER_TTL = 4 * 60 * 60 * 1000; // 4 hours — 3 calls × 6/day = 18/day

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchSpaceWeather(): Promise<SpaceWeatherData> {
  return fetchOnce(WEATHER_CACHE_KEY, async () => {
    const cached = getCached<SpaceWeatherData>(WEATHER_CACHE_KEY, WEATHER_TTL);
    if (cached) return cached;
    if (isRateLimited(WEATHER_CACHE_KEY)) throw new Error("Rate limited");

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const startStr = dateStr(start);
    const endStr   = dateStr(end);

    const [flaresRes, stormsRes, cmesRes] = await Promise.all([
      fetch(`${BASE}/DONKI/FLR?startDate=${startStr}&endDate=${endStr}&api_key=${API_KEY}`),
      fetch(`${BASE}/DONKI/GST?startDate=${startStr}&endDate=${endStr}&api_key=${API_KEY}`),
      fetch(`${BASE}/DONKI/CME?startDate=${startStr}&endDate=${endStr}&api_key=${API_KEY}`),
    ]);

    // Mark rate-limited if any endpoint returns 429
    if ([flaresRes, stormsRes, cmesRes].some((r) => r.status === 429)) {
      markRateLimited(WEATHER_CACHE_KEY);
      throw new Error("Rate limited");
    }

    const flares: SolarFlare[] = flaresRes.ok ? await flaresRes.json() : [];
    const storms: GeoStorm[]   = stormsRes.ok ? await stormsRes.json() : [];
    const cmes:   CME[]        = cmesRes.ok   ? await cmesRes.json()   : [];

    const data: SpaceWeatherData = {
      flares: Array.isArray(flares) ? flares : [],
      storms: Array.isArray(storms) ? storms : [],
      cmes:   Array.isArray(cmes)   ? cmes   : [],
      fetchedAt: Date.now(),
    };

    setCache(WEATHER_CACHE_KEY, data);
    return data;
  });
}

// ── DONKI — Near Earth Objects ────────────────────────────────────────────

export interface NeoCloseApproach {
  close_approach_date: string;
  close_approach_date_full: string;
  relative_velocity: {
    kilometers_per_hour: string;
    kilometers_per_second: string;
  };
  miss_distance: {
    lunar: string;
    kilometers: string;
    astronomical: string;
  };
  orbiting_body: string;
}

export interface NearEarthObject {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: NeoCloseApproach[];
}

export interface NeoFeedData {
  neos: NearEarthObject[];
  fetchedAt: number;
}

const NEO_CACHE_KEY = "neo_v2"; // v2: 12h TTL
const NEO_TTL = 12 * 60 * 60 * 1000; // 12 hours — asteroid orbits don't change hourly

export async function fetchNeoFeed(): Promise<NeoFeedData> {
  return fetchOnce(NEO_CACHE_KEY, async () => {
    const cached = getCached<NeoFeedData>(NEO_CACHE_KEY, NEO_TTL);
    if (cached) return cached;
    if (isRateLimited(NEO_CACHE_KEY)) throw new Error("Rate limited");

    const start = new Date();
    const end   = new Date();
    end.setDate(end.getDate() + 7);

    const res = await fetch(
      `${BASE}/neo/rest/v1/feed?start_date=${dateStr(start)}&end_date=${dateStr(end)}&api_key=${API_KEY}`
    );
    if (res.status === 429) { markRateLimited(NEO_CACHE_KEY); throw new Error("Rate limited"); }
    if (!res.ok) throw new Error(`NEO API error: ${res.status}`);

    const json = await res.json();
    const allNeos: NearEarthObject[] = Object.values(
      json.near_earth_objects as Record<string, NearEarthObject[]>
    ).flat();

    const data: NeoFeedData = { neos: allNeos, fetchedAt: Date.now() };
    setCache(NEO_CACHE_KEY, data);
    return data;
  });
}

// ── NASA JPL Sentry — Potential Impactors ─────────────────────────────────

export interface SentryObject {
  des: string;          // designation e.g. "2023 DW"
  fullname: string;     // "(2023 DW)"
  range: string;        // year range e.g. "2046-2046"
  ps_max: string;       // Palermo Scale max (logarithmic)
  ts_max: string;       // Turin Scale max (0-10)
  ip: string;           // impact probability as decimal string
  diameter: string;     // diameter in km
  v_inf: string;        // relative velocity km/s
  n_imp: number;        // number of potential impacts
  last_obs: string;     // last observation date
}

export interface SentryFeedData {
  objects: SentryObject[];
  fetchedAt: number;
}

const SENTRY_CACHE_KEY = "sentry_v2"; // JPL API — no NASA key needed
const SENTRY_TTL = 24 * 60 * 60 * 1000; // 24 hours — impact risk data barely changes

export async function fetchSentryData(): Promise<SentryFeedData> {
  return fetchOnce(SENTRY_CACHE_KEY, async () => {
    const cached = getCached<SentryFeedData>(SENTRY_CACHE_KEY, SENTRY_TTL);
    if (cached) return cached;

    // JPL SSD API — proxied via Vite (/api/sentry → ssd-api.jpl.nasa.gov/sentry.api)
    // to avoid CORS in browser. In production add a redirect proxy.
    const res = await fetch("/api/sentry");
    if (!res.ok) throw new Error(`Sentry API error: ${res.status}`);

    const json = await res.json();
    const raw: SentryObject[] = Array.isArray(json.data) ? json.data : [];

    const sorted = raw
      .filter((o) => o.ip && parseFloat(o.ip) > 0)
      .sort((a, b) => parseFloat(b.ps_max) - parseFloat(a.ps_max));

    const data: SentryFeedData = { objects: sorted, fetchedAt: Date.now() };
    setCache(SENTRY_CACHE_KEY, data);
    return data;
  });
}

// ── EPIC — Earth Polychromatic Imaging Camera ─────────────────────────────

export interface EpicImage {
  identifier: string;
  caption: string;
  image: string;       // filename, used to build URL
  version: string;
  date: string;        // "2024-03-10 01:15:42"
  centroid_coordinates: {
    lat: number;
    lon: number;
  };
  dscovr_j2000_position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface EpicFeedData {
  images: EpicImage[];
  imageDate: string; // YYYY-MM-DD of the returned images
  fetchedAt: number;
}

const EPIC_CACHE_KEY = "epic_v2"; // v2: 4h TTL
const EPIC_TTL = 4 * 60 * 60 * 1000; // 4 hours — EPIC posts ~12 images/day, refreshing often not needed

/** Builds the full JPG URL for an EPIC image */
export function buildEpicImageUrl(image: string, date: string): string {
  // date: "2024-03-10 01:15:42" → 2024/03/10
  const d = date.slice(0, 10);
  const [y, m, day] = d.split("-");
  return `${BASE}/EPIC/archive/natural/${y}/${m}/${day}/jpg/${image}.jpg?api_key=${API_KEY}`;
}

export async function fetchEpicLatest(): Promise<EpicFeedData> {
  return fetchOnce(EPIC_CACHE_KEY, async () => {
    const cached = getCached<EpicFeedData>(EPIC_CACHE_KEY, EPIC_TTL);
    if (cached) return cached;
    if (isRateLimited(EPIC_CACHE_KEY)) throw new Error("Rate limited");

    const res = await fetch(`${BASE}/EPIC/api/natural/images?api_key=${API_KEY}`);
    if (res.status === 429) { markRateLimited(EPIC_CACHE_KEY); throw new Error("Rate limited"); }
    if (!res.ok) throw new Error(`EPIC API error: ${res.status}`);
    const images: EpicImage[] = await res.json();
    const arr = Array.isArray(images) ? images : [];

    const imageDate = arr.length > 0 ? arr[0].date.slice(0, 10) : "";
    const data: EpicFeedData = { images: arr, imageDate, fetchedAt: Date.now() };
    setCache(EPIC_CACHE_KEY, data);
    return data;
  });
}

// ── Mars Rover Photos ─────────────────────────────────────────────────────

export interface MarsCamera {
  id: number;
  name: string;       // "FHAZ", "MAST", etc.
  full_name: string;
}

export interface MarsPhoto {
  id: number;
  sol: number;
  camera: MarsCamera;
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    status: string;  // "active" | "complete"
    landing_date: string;
    launch_date: string;
    max_sol: number;
    max_date: string;
    total_photos: number;
  };
}

export interface MarsPhotoFeedData {
  photos: MarsPhoto[];
  fetchedAt: number;
}

const MARS_CACHE_KEY = "mars_latest_v2"; // v2: 8h TTL
const MARS_TTL = 8 * 60 * 60 * 1000; // 8 hours — Curiosity sends batches once per sol (~24.6 h)

export async function fetchMarsLatestPhotos(): Promise<MarsPhotoFeedData> {
  return fetchOnce(MARS_CACHE_KEY, async () => {
    const cached = getCached<MarsPhotoFeedData>(MARS_CACHE_KEY, MARS_TTL);
    if (cached) return cached;
    if (isRateLimited(MARS_CACHE_KEY)) throw new Error("Rate limited");

    const res = await fetch(
      `${BASE}/mars-photos/api/v1/rovers/curiosity/latest_photos?api_key=${API_KEY}`
    );
    if (res.status === 429) { markRateLimited(MARS_CACHE_KEY); throw new Error("Rate limited"); }
    if (!res.ok) throw new Error(`Mars Rover API error: ${res.status}`);
    const json = await res.json();
    const photos: MarsPhoto[] = Array.isArray(json.latest_photos) ? json.latest_photos : [];

    const data: MarsPhotoFeedData = { photos, fetchedAt: Date.now() };
    setCache(MARS_CACHE_KEY, data);
    return data;
  });
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

// ── NOAA SWPC — Live Solar Data ──────────────────────────────────────────

// NOAA endpoints are proxied via Caddyfile to avoid CORS (no CORS headers on swpc.noaa.gov)
const NOAA_BASE = "";

export interface NoaaLiveData {
  kp: number;
  xrayFlux: number;
  xrayClass: string;
  protonFlux: number;
  fetchedAt: number;
}

const NOAA_CACHE_KEY = "noaa_live_v1";
const NOAA_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchNoaaLive(): Promise<NoaaLiveData> {
  return fetchOnce(NOAA_CACHE_KEY, async () => {
    const cached = getCached<NoaaLiveData>(NOAA_CACHE_KEY, NOAA_TTL);
    if (cached) return cached;

    const [kpRes, xrayRes, protonRes] = await Promise.allSettled([
      fetch(`${NOAA_BASE}/json/planetary_k_index_1m.json`),
      fetch(`/api/noaa-xray`),
      fetch(`/api/noaa-proton`),
    ]);

    let kp = 0;
    if (kpRes.status === "fulfilled" && kpRes.value.ok) {
      const data = await kpRes.value.json();
      if (Array.isArray(data) && data.length > 0) {
        const filtered = data.filter((r: Record<string, unknown>) => !r.estimated);
        const latest = (filtered.length > 0 ? filtered[filtered.length - 1] : data[data.length - 1]);
        kp = Math.max(0, Math.min(9, Number.parseFloat(String(latest?.kp ?? 0)) || 0));
      }
    }

    let xrayFlux = 0, xrayClass = "A";
    if (xrayRes.status === "fulfilled" && xrayRes.value.ok) {
      const data = await xrayRes.value.json();
      if (Array.isArray(data) && data.length > 0) {
        xrayFlux = Number.parseFloat(String(data[data.length - 1]?.flux ?? 0)) || 0;
        if (xrayFlux >= 1e-4) xrayClass = "X";
        else if (xrayFlux >= 1e-5) xrayClass = "M";
        else if (xrayFlux >= 1e-6) xrayClass = "C";
        else if (xrayFlux >= 1e-7) xrayClass = "B";
      }
    }

    let protonFlux = 0;
    if (protonRes.status === "fulfilled" && protonRes.value.ok) {
      const data = await protonRes.value.json();
      if (Array.isArray(data) && data.length > 0) {
        protonFlux = Number.parseFloat(String(data[data.length - 1]?.flux ?? 0)) || 0;
      }
    }

    const result: NoaaLiveData = { kp, xrayFlux, xrayClass, protonFlux, fetchedAt: Date.now() };
    setCache(NOAA_CACHE_KEY, result);
    return result;
  });
}
