/**
 * Testa o RootLayout mínimo (app/layout.tsx).
 * A partir da issue #88 (i18n), o layout raiz é um pass-through — apenas
 * renderiza {children}. Fontes, metadados e componentes de seção vivem em
 * app/[locale]/layout.tsx, testado separadamente via renderização server.
 */
import React from "react";
import { render, screen } from "@testing-library/react";

import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("renderiza os children", () => {
    render(
      <RootLayout>
        <div data-testid="child">conteúdo</div>
      </RootLayout>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("não renderiza componentes de seção próprios (delega ao [locale]/layout)", () => {
    const { container } = render(
      <RootLayout>
        <span data-testid="only-child" />
      </RootLayout>
    );
    // O layout raiz não deve adicionar elementos além dos children
    expect(screen.getByTestId("only-child")).toBeInTheDocument();
    expect(container.querySelector("footer")).not.toBeInTheDocument();
    expect(container.querySelector("nav")).not.toBeInTheDocument();
  });
});
