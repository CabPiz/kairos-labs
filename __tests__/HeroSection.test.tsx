import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/components/sections/NavBar", () => ({
  NavBar: () => <nav data-testid="navbar-mock" />,
}));
jest.mock("@/components/sections/HeroContent", () => ({
  HeroContent: () => <div data-testid="herocontent-mock" />,
}));
jest.mock("@/components/sections/FeatureCards", () => ({
  FeatureCards: () => <div data-testid="featurecards-mock" />,
}));

import { HeroSection } from "@/components/sections/HeroSection";

describe("HeroSection", () => {
  it("renderiza o NavBar", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("navbar-mock")).toBeInTheDocument();
  });

  it("renderiza o HeroContent", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("herocontent-mock")).toBeInTheDocument();
  });

  it("renderiza o FeatureCards", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("featurecards-mock")).toBeInTheDocument();
  });
});
