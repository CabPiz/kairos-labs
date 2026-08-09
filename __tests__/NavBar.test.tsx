import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NavBar } from "@/components/sections/NavBar";

describe("NavBar", () => {
  it("renderiza a logo com alt Kairos Labs", () => {
    render(<NavBar />);
    expect(screen.getByAltText("Kairos Labs")).toBeInTheDocument();
  });

  it("renderiza o link da logo apontando para /", () => {
    render(<NavBar />);
    const logoLink = screen.getByRole("link", { name: /kairos labs/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("renderiza os links Sobre, Tecnologia e Contato como âncoras", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: /sobre/i })).toHaveAttribute("href", "#sobre");
    expect(screen.getByRole("link", { name: /tecnologia/i })).toHaveAttribute("href", "#tecnologia");
    const contatoLinks = screen.getAllByRole("link", { name: /^contato$/i });
    expect(contatoLinks.length).toBeGreaterThanOrEqual(1);
    expect(contatoLinks[0]).toHaveAttribute("href", "#contato");
  });

  it("renderiza o botão Acesso com link para /admin/login", () => {
    render(<NavBar />);
    const acessoLink = screen.getByRole("link", { name: /acesso/i });
    expect(acessoLink).toHaveAttribute("href", "/admin/login");
  });

  it.each(["mouseOver", "focus"] as const)(
    "altera cor do link Sobre no evento %s",
    (event) => {
      render(<NavBar />);
      const link = screen.getByRole("link", { name: /sobre/i });
      fireEvent[event](link);
      expect(link.style.color).toBe("rgb(255, 255, 255)");
    }
  );

  it.each(["mouseOut", "blur"] as const)(
    "restaura cor do link Sobre no evento %s",
    (event) => {
      render(<NavBar />);
      const link = screen.getByRole("link", { name: /sobre/i });
      fireEvent[event](link);
      expect(link.style.color).toBe("rgba(255, 255, 255, 0.75)");
    }
  );

  it.each(["mouseOver", "focus"] as const)(
    "altera cor do botão Acesso no evento %s",
    (event) => {
      render(<NavBar />);
      const btn = screen.getByRole("button", { name: /acesso/i });
      fireEvent[event](btn);
      expect(btn.style.color).toBe("rgb(5, 10, 20)");
    }
  );

  it.each(["mouseOut", "blur"] as const)(
    "restaura cor do botão Acesso no evento %s",
    (event) => {
      render(<NavBar />);
      const btn = screen.getByRole("button", { name: /acesso/i });
      fireEvent[event](btn);
      expect(btn.style.color).toBe("rgb(212, 160, 23)");
    }
  );

  it("abre o menu mobile ao clicar no hamburger", () => {
    render(<NavBar />);
    const hamburger = screen.getByRole("button", { name: /menu de navegação/i });
    fireEvent.click(hamburger);
    expect(screen.getByRole("button", { name: /fechar menu/i })).toBeInTheDocument();
  });

  it("fecha o menu mobile ao clicar no botão fechar", () => {
    render(<NavBar />);
    fireEvent.click(screen.getByRole("button", { name: /menu de navegação/i }));
    fireEvent.click(screen.getByRole("button", { name: /fechar menu/i }));
    expect(screen.queryByRole("button", { name: /fechar menu/i })).not.toBeInTheDocument();
  });

  it("fecha o menu mobile ao clicar em um link de seção", () => {
    render(<NavBar />);
    fireEvent.click(screen.getByRole("button", { name: /menu de navegação/i }));
    const sobreLinks = screen.getAllByRole("link", { name: /sobre/i });
    fireEvent.click(sobreLinks[sobreLinks.length - 1]);
    expect(screen.queryByRole("button", { name: /fechar menu/i })).not.toBeInTheDocument();
  });

  it("fecha o menu mobile ao clicar no link Contato no menu mobile", () => {
    render(<NavBar />);
    fireEvent.click(screen.getByRole("button", { name: /menu de navegação/i }));
    const contatoLinks = screen.getAllByRole("link", { name: /^contato$/i });
    fireEvent.click(contatoLinks[contatoLinks.length - 1]);
    expect(screen.queryByRole("button", { name: /fechar menu/i })).not.toBeInTheDocument();
  });

  it.each(["mouseOver", "focus"] as const)(
    "altera cor do link Tecnologia no evento %s",
    (event) => {
      render(<NavBar />);
      const link = screen.getByRole("link", { name: /tecnologia/i });
      fireEvent[event](link);
      expect(link.style.color).toBe("rgb(255, 255, 255)");
    }
  );

  it.each(["mouseOut", "blur"] as const)(
    "restaura cor do link Tecnologia no evento %s",
    (event) => {
      render(<NavBar />);
      const link = screen.getByRole("link", { name: /tecnologia/i });
      fireEvent[event](link);
      expect(link.style.color).toBe("rgba(255, 255, 255, 0.75)");
    }
  );

  it.each(["mouseOver", "focus"] as const)(
    "altera cor do link Contato no evento %s",
    (event) => {
      render(<NavBar />);
      const [contatoLink] = screen.getAllByRole("link", { name: /^contato$/i });
      fireEvent[event](contatoLink);
      expect(contatoLink.style.color).toBe("rgb(255, 255, 255)");
    }
  );

  it.each(["mouseOut", "blur"] as const)(
    "restaura cor do link Contato no evento %s",
    (event) => {
      render(<NavBar />);
      const [contatoLink] = screen.getAllByRole("link", { name: /^contato$/i });
      fireEvent[event](contatoLink);
      expect(contatoLink.style.color).toBe("rgba(255, 255, 255, 0.75)");
    }
  );
});
