import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CatalogFiltersSkeleton } from "../CatalogFiltersSkeleton";

describe("CatalogFiltersSkeleton", () => {
  it("renderiza seção de placeholder com aria-hidden", () => {
    const { container } = render(<CatalogFiltersSkeleton />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-hidden");
    expect(section).toHaveClass("rounded-2xl");
    expect(container.querySelector(".grid")).toBeInTheDocument();
  });
});
