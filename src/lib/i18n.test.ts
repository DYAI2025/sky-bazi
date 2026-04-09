import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLang } from "./i18n";

// Mock localStorage
const store: Record<string, string> = {};
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    length: 0,
    key: () => null,
  },
  writable: true,
});

describe("useLang", () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
  });

  it("defaults to 'de'", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current.lang).toBe("de");
  });

  it("t() returns German string by default", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current.t("nav.ring")).toBe("Deine Signatur");
  });

  it("switches to English", () => {
    const { result } = renderHook(() => useLang());
    act(() => result.current.setLang("en"));
    expect(result.current.lang).toBe("en");
    expect(result.current.t("nav.ring")).toBe("Your Signature");
  });

  it("returns the key for unknown translations", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current.t("nonexistent.key")).toBe("nonexistent.key");
  });

  it("translates ISS keys (verifies new keys exist)", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current.t("iss.title")).toBe("ISS Live-Position");
    act(() => result.current.setLang("en"));
    expect(result.current.t("iss.title")).toBe("ISS Live Position");
  });

  it("translates Facts keys (verifies new keys exist)", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current.t("facts.solar.title")).toBe("Die Sonne als Fusionsreaktor");
    act(() => result.current.setLang("en"));
    expect(result.current.t("facts.solar.title")).toBe("The Sun as a Fusion Reactor");
  });
});
