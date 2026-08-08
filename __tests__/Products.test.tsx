import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/components/waitlist/WaitlistCTAButton", () => ({
  WaitlistCTAButton: ({ productName }: { productName: string }) => (
    <button type="button">{`Waitlist ${productName}`}</button>
  ),
}));

import { Products } from "@/components/sections/Products";

describe("Products", () => {
  it("renderiza a section com id='products'", () => {
    const { container } = render(<Products />);
    expect(container.querySelector("section#products")).toBeInTheDocument();
  });

  it.each([
    "DevPrint",
    "Ascend",
    "Elucya Talk",
    "Talvrix",
    "Kairos Labs",
  ])("exibe o card do produto %s", (nome) => {
    render(<Products />);
    expect(screen.getAllByText(nome).length).toBeGreaterThan(0);
  });

  it("exibe botão de waitlist para cada produto", () => {
    render(<Products />);
    const buttons = screen.getAllByRole("button", { name: /waitlist/i });
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  it("exibe links 'Saiba mais' para cada produto", () => {
    render(<Products />);
    const links = screen.getAllByRole("link", { name: /saiba mais/i });
    expect(links.length).toBeGreaterThanOrEqual(6);
  });

  it("link 'Saiba mais' do Talvrix aponta para /talvrix", () => {
    render(<Products />);
    const talvrixLinks = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("href") === "/talvrix");
    expect(talvrixLinks.length).toBeGreaterThan(0);
  });

  it("exibe o título da seção 'Nosso Portfólio'", () => {
    render(<Products />);
    expect(screen.getByText("Nosso Portfólio")).toBeInTheDocument();
  });
});
