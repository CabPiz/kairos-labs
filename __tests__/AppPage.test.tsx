import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/components/sections/HeroSection", () => ({
  HeroSection: () => <div data-testid="herosection-mock" />,
}));

import Home from "@/app/page";

describe("Home page", () => {
  it("renderiza o elemento main", () => {
    render(<Home />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renderiza o HeroSection", () => {
    render(<Home />);
    expect(screen.getByTestId("herosection-mock")).toBeInTheDocument();
  });
});
