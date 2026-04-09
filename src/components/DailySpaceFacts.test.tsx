import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DailySpaceFacts } from "./DailySpaceFacts";

// Minimal t() stub that returns the key — verifies i18n keys are used, not hardcoded strings
const t = (key: string) => key;

describe("DailySpaceFacts", () => {
  it("renders the section with i18n keys (not hardcoded strings)", () => {
    render(<DailySpaceFacts lang="de" t={t} />);
    expect(screen.getByText("facts.title")).toBeInTheDocument();
    expect(screen.getByText("facts.subtitle")).toBeInTheDocument();
  });

  it("renders exactly 3 pagination dots", () => {
    render(<DailySpaceFacts lang="en" t={t} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3);
  });

  it("displays a source for the current fact", () => {
    render(<DailySpaceFacts lang="de" t={t} />);
    expect(screen.getByText(/facts\.source/)).toBeInTheDocument();
  });
});
