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
  it.each(["navbar-mock", "herocontent-mock", "featurecards-mock"])(
    "renderiza o elemento %s",
    (testId) => {
      render(<HeroSection />);
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
  );
});
