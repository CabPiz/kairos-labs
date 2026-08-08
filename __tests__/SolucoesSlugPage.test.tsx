import React from "react";
import { render, screen } from "@testing-library/react";

const mockNotFound = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: mockNotFound,
  redirect: jest.fn(),
}));

jest.mock("@/components/waitlist/WaitlistCTAButton", () => ({
  WaitlistCTAButton: ({ productName }: { productName: string }) => (
    <button type="button">{`Waitlist ${productName}`}</button>
  ),
}));

jest.mock("@/components/feedback/FeedbackCTAButton", () => ({
  FeedbackCTAButton: ({ productName }: { productName: string }) => (
    <button type="button">{`Feedback ${productName}`}</button>
  ),
}));

import ProdutoDetalhe from "@/app/[slug]/page";

async function renderSlug(slug: string) {
  const Component = await Promise.resolve(
    ProdutoDetalhe({ params: Promise.resolve({ slug }) })
  );
  return render(Component as React.ReactElement);
}

describe("ProdutoDetalhe", () => {
  it.each([
    { slug: "devprint", nome: "DevPrint" },
    { slug: "ascend", nome: "Ascend" },
    { slug: "elucya-talk", nome: "Elucya Talk" },
    { slug: "agora-global", nome: "Plataforma Ágora Global" },
    { slug: "talvrix", nome: "Talvrix" },
    { slug: "kairos-labs", nome: "Kairos Labs" },
  ])("renderiza $nome com o nome correto", async ({ slug, nome }) => {
    await renderSlug(slug);
    expect(screen.getAllByText(new RegExp(nome, "i")).length).toBeGreaterThan(0);
  });

  it("chama notFound para slug inexistente", async () => {
    await expect(renderSlug("nao-existe")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("exibe link de voltar com texto Portfólio apontando para /#products", async () => {
    await renderSlug("devprint");
    const link = screen.getByRole("link", { name: /portfólio/i });
    expect(link).toHaveAttribute("href", "/#products");
  });

  it("exibe botões de waitlist e feedback", async () => {
    await renderSlug("devprint");
    expect(
      screen.getByRole("button", { name: /waitlist devprint/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /feedback devprint/i })
    ).toBeInTheDocument();
  });

  it("exibe botões de waitlist e feedback para o Talvrix", async () => {
    await renderSlug("talvrix");
    expect(
      screen.getByRole("button", { name: /waitlist talvrix/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /feedback talvrix/i })
    ).toBeInTheDocument();
  });
});

describe("generateStaticParams", () => {
  it("retorna os 6 slugs de produto", async () => {
    const { generateStaticParams } = await import("@/app/[slug]/page");
    const params = generateStaticParams();
    expect(params).toHaveLength(6);
    const slugs = params.map((p: { slug: string }) => p.slug);
    expect(slugs).toContain("devprint");
    expect(slugs).toContain("ascend");
    expect(slugs).toContain("elucya-talk");
    expect(slugs).toContain("agora-global");
    expect(slugs).toContain("talvrix");
    expect(slugs).toContain("kairos-labs");
  });
});
