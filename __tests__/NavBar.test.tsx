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

  it("renderiza os links Sobre e Tecnologia como âncoras", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: /sobre/i })).toHaveAttribute("href", "#sobre");
    expect(screen.getByRole("link", { name: /tecnologia/i })).toHaveAttribute("href", "#tecnologia");
  });

  it("renderiza Contato como botão (abre modal, não navega)", () => {
    render(<NavBar />);
    const contatoBtns = screen.getAllByRole("button", { name: /contato/i });
    expect(contatoBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("abre o ContactModal ao clicar em Contato no desktop", () => {
    render(<NavBar />);
    const [contatoBtn] = screen.getAllByRole("button", { name: /contato/i });
    fireEvent.click(contatoBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
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

  it("fecha o menu mobile e abre o modal ao clicar em Contato no menu mobile", () => {
    render(<NavBar />);
    fireEvent.click(screen.getByRole("button", { name: /menu de navegação/i }));
    const contatoBtns = screen.getAllByRole("button", { name: /contato/i });
    fireEvent.click(contatoBtns[contatoBtns.length - 1]);
    expect(screen.queryByRole("button", { name: /fechar menu/i })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
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
    "altera cor do botão Contato no evento %s",
    (event) => {
      render(<NavBar />);
      const [contatoBtn] = screen.getAllByRole("button", { name: /contato/i });
      fireEvent[event](contatoBtn);
      expect(contatoBtn.style.color).toBe("rgb(255, 255, 255)");
    }
  );

  it.each(["mouseOut", "blur"] as const)(
    "restaura cor do botão Contato no evento %s",
    (event) => {
      render(<NavBar />);
      const [contatoBtn] = screen.getAllByRole("button", { name: /contato/i });
      fireEvent[event](contatoBtn);
      expect(contatoBtn.style.color).toBe("rgba(255, 255, 255, 0.75)");
    }
  );
});
