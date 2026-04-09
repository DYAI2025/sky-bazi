import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary, NASAApiErrorBoundary } from "./ErrorBoundary";

function Bomb(): JSX.Element {
  throw new Error("Kaboom!");
}

// Suppress expected console.error from React error boundary internals
vi.spyOn(console, "error").mockImplementation(() => {});

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/NASA-Daten temporär nicht verfügbar/)).toBeInTheDocument();
    expect(screen.getByText(/Erneut versuchen/)).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });
});

describe("NASAApiErrorBoundary", () => {
  it("shows API name in fallback when child throws", () => {
    render(
      <NASAApiErrorBoundary apiName="ISS Tracker">
        <Bomb />
      </NASAApiErrorBoundary>,
    );
    expect(screen.getByText(/ISS Tracker ist momentan nicht verfügbar/)).toBeInTheDocument();
  });
});
