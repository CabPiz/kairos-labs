/**
 * Testa a página raiz (app/page.tsx).
 * A partir da issue #88 (i18n), a rota / é interceptada pelo proxy (next-intl)
 * que redireciona para /[locale]. A página retorna null — o conteúdo real
 * está em app/[locale]/page.tsx.
 */
import React from "react";
import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

describe("Home page (raiz /)", () => {
  it("retorna null — o conteúdo fica em /[locale]/page.tsx", () => {
    // O proxy redireciona / para /pt, /en ou /es antes do render.
    // A página raiz não deve renderizar nenhum conteúdo próprio.
    const { container } = render(<Home />);
    expect(container.firstChild).toBeNull();
  });

  it("não renderiza HeroSection diretamente", () => {
    render(<Home />);
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });
});
