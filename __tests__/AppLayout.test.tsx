import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/components/sections/Footer", () => ({
  Footer: () => <footer data-testid="footer-mock" />,
}));

import RootLayout, { metadata } from "@/app/layout";

describe("RootLayout", () => {
  it("renderiza os children", () => {
    render(
      <RootLayout>
        <div data-testid="child">conteúdo</div>
      </RootLayout>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renderiza o Footer", () => {
    render(
      <RootLayout>
        <span />
      </RootLayout>
    );
    expect(screen.getByTestId("footer-mock")).toBeInTheDocument();
  });
});

describe("metadata", () => {
  it("tem title padrão Kairos Labs", () => {
    const title = metadata.title as { default: string; template: string };
    expect(title.default).toBe("Kairos Labs");
  });

  it("tem template de título correto", () => {
    const title = metadata.title as { default: string; template: string };
    expect(title.template).toBe("%s | Kairos Labs");
  });

  it("tem metadataBase apontando para o domínio", () => {
    expect((metadata.metadataBase as URL)?.href).toContain("kairoslabs.com.br");
  });
});
