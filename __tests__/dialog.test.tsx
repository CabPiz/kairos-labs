import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogPortal,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

describe("Dialog — sub-components não cobertos pelos testes de modal", () => {
  it("DialogTrigger renderiza o gatilho do dialog", () => {
    render(
      <Dialog>
        <DialogTrigger>Abrir dialog</DialogTrigger>
      </Dialog>
    );
    expect(screen.getByText("Abrir dialog")).toBeInTheDocument();
  });

  it("DialogClose renderiza dentro de dialog aberto", () => {
    render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogClose>Fechar</DialogClose>
        </DialogPortal>
      </Dialog>
    );
    expect(screen.getByText("Fechar")).toBeInTheDocument();
  });

  it("DialogFooter renderiza children sem showCloseButton", () => {
    render(
      <DialogFooter>
        <button type="button">Cancelar</button>
      </DialogFooter>
    );
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("DialogFooter com showCloseButton renderiza botão Close dentro de dialog aberto", () => {
    render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogFooter showCloseButton>
            <span>conteúdo</span>
          </DialogFooter>
        </DialogPortal>
      </Dialog>
    );
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("DialogTitle renderiza o título", () => {
    render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogTitle>Título do dialog</DialogTitle>
        </DialogPortal>
      </Dialog>
    );
    expect(screen.getByText("Título do dialog")).toBeInTheDocument();
  });

  it("DialogDescription renderiza a descrição", () => {
    render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogDescription>Descrição do dialog</DialogDescription>
        </DialogPortal>
      </Dialog>
    );
    expect(screen.getByText("Descrição do dialog")).toBeInTheDocument();
  });
});
