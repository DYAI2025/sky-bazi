import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCached, setCache, isRateLimited, markRateLimited } from "./nasa";

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  length: 0,
  key: () => null,
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

describe("NASA cache layer", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  describe("getCached / setCache", () => {
    it("returns null when cache is empty", () => {
      expect(getCached("test", 60_000)).toBeNull();
    });

    it("returns cached data within TTL", () => {
      setCache("test", { hello: "world" });
      expect(getCached<{ hello: string }>("test", 60_000)).toEqual({ hello: "world" });
    });

    it("returns null when TTL expired", () => {
      setCache("test", { hello: "world" });
      const raw = JSON.parse(store["sky:test"]);
      raw.timestamp = Date.now() - 120_000;
      store["sky:test"] = JSON.stringify(raw);
      expect(getCached("test", 60_000)).toBeNull();
    });

    it("handles corrupt localStorage gracefully", () => {
      store["sky:broken"] = "not-json{{{";
      expect(getCached("broken", 60_000)).toBeNull();
    });
  });

  describe("rate limiting", () => {
    it("is not rate-limited by default", () => {
      expect(isRateLimited("apod")).toBe(false);
    });

    it("is rate-limited after markRateLimited", () => {
      markRateLimited("apod");
      expect(isRateLimited("apod")).toBe(true);
    });

    it("rate limit expires after TTL", () => {
      markRateLimited("apod");
      const raw = JSON.parse(store["sky:rl:apod"]);
      raw.timestamp = Date.now() - 31 * 60 * 1000;
      store["sky:rl:apod"] = JSON.stringify(raw);
      expect(isRateLimited("apod")).toBe(false);
    });
  });
});
