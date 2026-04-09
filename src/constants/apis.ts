/**
 * Centralized API endpoints for external services
 * All URLs use HTTPS for security compliance
 */

export const API_ENDPOINTS = {
  // NASA APIs
  NASA_BASE: 'https://api.nasa.gov',
  NASA_EPIC: 'https://epic.gsfc.nasa.gov',
  NASA_IMAGES: 'https://images-api.nasa.gov',
  NASA_SENTRY: 'https://ssd-api.jpl.nasa.gov',
  
  // ISS Tracking — wheretheiss.at provides live altitude, velocity & visibility
  // (Open-Notify's iss-pass.json was retired in 2022; iss-now.json has TLS issues.)
  ISS_POSITION: 'https://api.wheretheiss.at/v1/satellites/25544',
  
  // Space Weather (NOAA)
  NOAA_BASE: 'https://services.swpc.noaa.gov',
  NOAA_XRAY_FLUX: 'https://services.swpc.noaa.gov/json/goes_xray_flux.json',
  NOAA_PROTON_FLUX: 'https://services.swpc.noaa.gov/json/goes_proton_flux.json',
  NOAA_KP_INDEX: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'
} as const;

export const API_CACHE_KEYS = {
  APOD: 'apod',
  SPACE_WEATHER: 'weather_v3',
  NEO: 'neo_v2',
  SENTRY: 'sentry_v2',
  EPIC: 'epic_v2',
  MARS: 'mars_latest_v3',
  NOAA_LIVE: 'noaa_live_v1',
  ISS_POSITION: 'iss_position_v1'
} as const;

export const API_TTL = {
  // Cache Time-To-Live in milliseconds
  APOD: 12 * 60 * 60 * 1000,        // 12 hours
  SPACE_WEATHER: 4 * 60 * 60 * 1000,  // 4 hours  
  NEO: 12 * 60 * 60 * 1000,         // 12 hours
  SENTRY: 24 * 60 * 60 * 1000,      // 24 hours
  EPIC: 4 * 60 * 60 * 1000,         // 4 hours
  MARS: 8 * 60 * 60 * 1000,         // 8 hours
  NOAA_LIVE: 5 * 60 * 1000,         // 5 minutes
  ISS_POSITION: 10 * 1000,          // 10 seconds
  RATE_LIMIT: 30 * 60 * 1000        // 30 minutes
} as const;

export const DEFAULT_COORDINATES = {
  // Berlin coordinates as fallback
  LATITUDE: 52.520008,
  LONGITUDE: 13.404954
} as const;