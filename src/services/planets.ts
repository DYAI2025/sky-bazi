import {
  Body,
  EclipticLongitude,
  MoonPhase,
  GeoMoon,
  Ecliptic,
  SunPosition,
  MakeTime,
} from "astronomy-engine";
import { signFromLongitude, type ZodiacSign } from "../lib/zodiac";

export interface PlanetPosition {
  name: string;
  nameDe: string;
  symbol: string;
  longitude: number;
  sign: ZodiacSign;
  degree: number;
}

export interface MoonInfo {
  longitude: number;
  sign: ZodiacSign;
  degree: number;
  phaseAngle: number;
  phaseName: string;
  phaseNameDe: string;
  phaseEmoji: string;
}

const PLANETS: Array<{ body: Body; name: string; nameDe: string; symbol: string }> = [
  { body: Body.Mercury,  name: "Mercury",  nameDe: "Merkur",   symbol: "\u263F" },
  { body: Body.Venus,    name: "Venus",    nameDe: "Venus",    symbol: "\u2640" },
  { body: Body.Mars,     name: "Mars",     nameDe: "Mars",     symbol: "\u2642" },
  { body: Body.Jupiter,  name: "Jupiter",  nameDe: "Jupiter",  symbol: "\u2643" },
  { body: Body.Saturn,   name: "Saturn",   nameDe: "Saturn",   symbol: "\u2644" },
  { body: Body.Uranus,   name: "Uranus",   nameDe: "Uranus",   symbol: "\u26E2" },
  { body: Body.Neptune,  name: "Neptune",  nameDe: "Neptun",   symbol: "\u2646" },
  { body: Body.Pluto,    name: "Pluto",    nameDe: "Pluto",    symbol: "\u2647" },
];

export function calculatePlanetPositions(date: Date = new Date()): PlanetPosition[] {
  return PLANETS.map(({ body, name, nameDe, symbol }) => {
    const longitude = EclipticLongitude(body, date);
    const { sign, degree } = signFromLongitude(longitude);
    return { name, nameDe, symbol, longitude, sign, degree };
  });
}

export function calculateSunPosition(date: Date = new Date()): PlanetPosition {
  const sun = SunPosition(date);
  const longitude = sun.elon;
  const { sign, degree } = signFromLongitude(longitude);
  return { name: "Sun", nameDe: "Sonne", symbol: "\u2609", longitude, sign, degree };
}

export function calculateMoonPosition(date: Date = new Date()): MoonInfo {
  const astroDate = MakeTime(date);
  const moonVec = GeoMoon(astroDate);
  const ecl = Ecliptic(moonVec);
  const longitude = ecl.elon;
  const { sign, degree } = signFromLongitude(longitude);

  const phaseAngle = MoonPhase(date);
  const { name, nameDe, emoji } = moonPhaseName(phaseAngle);

  return {
    longitude,
    sign,
    degree,
    phaseAngle,
    phaseName: name,
    phaseNameDe: nameDe,
    phaseEmoji: emoji,
  };
}

function moonPhaseName(angle: number): { name: string; nameDe: string; emoji: string } {
  if (angle < 22.5)  return { name: "New Moon",        nameDe: "Neumond",              emoji: "\uD83C\uDF11" };
  if (angle < 67.5)  return { name: "Waxing Crescent", nameDe: "Zunehmende Sichel",    emoji: "\uD83C\uDF12" };
  if (angle < 112.5) return { name: "First Quarter",   nameDe: "Erstes Viertel",       emoji: "\uD83C\uDF13" };
  if (angle < 157.5) return { name: "Waxing Gibbous",  nameDe: "Zunehmender Mond",     emoji: "\uD83C\uDF14" };
  if (angle < 202.5) return { name: "Full Moon",       nameDe: "Vollmond",             emoji: "\uD83C\uDF15" };
  if (angle < 247.5) return { name: "Waning Gibbous",  nameDe: "Abnehmender Mond",     emoji: "\uD83C\uDF16" };
  if (angle < 292.5) return { name: "Last Quarter",    nameDe: "Letztes Viertel",      emoji: "\uD83C\uDF17" };
  if (angle < 337.5) return { name: "Waning Crescent", nameDe: "Abnehmende Sichel",    emoji: "\uD83C\uDF18" };
  return               { name: "New Moon",        nameDe: "Neumond",              emoji: "\uD83C\uDF11" };
}
