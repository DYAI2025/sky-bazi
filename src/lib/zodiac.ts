export interface ZodiacSign {
  name: string;
  nameDe: string;
  glyph: string;
  element: string;
  elementDe: string;
}

const SIGNS: ZodiacSign[] = [
  { name: "Aries",       nameDe: "Widder",       glyph: "\u2648", element: "Fire",  elementDe: "Feuer" },
  { name: "Taurus",      nameDe: "Stier",        glyph: "\u2649", element: "Earth", elementDe: "Erde" },
  { name: "Gemini",      nameDe: "Zwillinge",    glyph: "\u264A", element: "Air",   elementDe: "Luft" },
  { name: "Cancer",      nameDe: "Krebs",        glyph: "\u264B", element: "Water", elementDe: "Wasser" },
  { name: "Leo",         nameDe: "Loewe",        glyph: "\u264C", element: "Fire",  elementDe: "Feuer" },
  { name: "Virgo",       nameDe: "Jungfrau",     glyph: "\u264D", element: "Earth", elementDe: "Erde" },
  { name: "Libra",       nameDe: "Waage",        glyph: "\u264E", element: "Air",   elementDe: "Luft" },
  { name: "Scorpio",     nameDe: "Skorpion",     glyph: "\u264F", element: "Water", elementDe: "Wasser" },
  { name: "Sagittarius", nameDe: "Schuetze",     glyph: "\u2650", element: "Fire",  elementDe: "Feuer" },
  { name: "Capricorn",   nameDe: "Steinbock",    glyph: "\u2651", element: "Earth", elementDe: "Erde" },
  { name: "Aquarius",    nameDe: "Wassermann",   glyph: "\u2652", element: "Air",   elementDe: "Luft" },
  { name: "Pisces",      nameDe: "Fische",       glyph: "\u2653", element: "Water", elementDe: "Wasser" },
];

export function signFromLongitude(degrees: number): { sign: ZodiacSign; degree: number } {
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  const degree = normalized % 30;
  return { sign: SIGNS[index], degree };
}

export function getSign(index: number): ZodiacSign {
  return SIGNS[((index % 12) + 12) % 12];
}

export { SIGNS };
