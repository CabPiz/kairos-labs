import React from "react";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/sections/Header";

describe("Header", () => {
  it("renderiza sem erros", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("exibe o nome da marca", () => {
    render(<Header />);
    expect(screen.getByText(/Kairos Labs/i)).toBeInTheDocument();
  });
});
