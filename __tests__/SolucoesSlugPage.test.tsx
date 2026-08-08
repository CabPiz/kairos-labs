import React from "react";
import { render, screen } from "@testing-library/react";

const mockNotFound = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: mockNotFound,
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

import ProdutoDetalhe from "@/app/solucoes/[slug]/page";

async function renderSlug(slug: string) {
  const Component = await Promise.resolve(
    ProdutoDetalhe({ params: Promise.resolve({ slug }) })
  );
  return render(Component as React.ReactElement);
}

describe("ProdutoDetalhe", () => {
  it("renderiza DevPrint com o nome correto", async () => {
    await renderSlug("devprint");
    expect(screen.getAllByText("DevPrint").length).toBeGreaterThan(0);
  });

  it("renderiza Ascend com o nome correto", async () => {
    await renderSlug("ascend");
    expect(screen.getAllByText("Ascend").length).toBeGreaterThan(0);
  });

  it("renderiza Elucya Talk", async () => {
    await renderSlug("elucya-talk");
    expect(screen.getAllByText("Elucya Talk").length).toBeGreaterThan(0);
  });

  it("renderiza Ágora Global", async () => {
    await renderSlug("agora-global");
    expect(
      screen.getAllByText(/Plataforma Ágora Global/i).length
    ).toBeGreaterThan(0);
  });

  it("renderiza Kairos Labs", async () => {
    await renderSlug("kairos-labs");
    expect(screen.getAllByText("Kairos Labs").length).toBeGreaterThan(0);
  });

  it("chama notFound para slug inexistente", async () => {
    await expect(renderSlug("nao-existe")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("exibe link de voltar para /solucoes com texto Soluções", async () => {
    await renderSlug("devprint");
    const link = screen.getByRole("link", { name: /soluções/i });
    expect(link).toHaveAttribute("href", "/solucoes");
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
});

describe("generateStaticParams", () => {
  it("retorna os 5 slugs de produto", async () => {
    const { generateStaticParams } = await import(
      "@/app/solucoes/[slug]/page"
    );
    const params = generateStaticParams();
    expect(params).toHaveLength(5);
    const slugs = params.map((p: { slug: string }) => p.slug);
    expect(slugs).toContain("devprint");
    expect(slugs).toContain("ascend");
    expect(slugs).toContain("elucya-talk");
    expect(slugs).toContain("agora-global");
    expect(slugs).toContain("kairos-labs");
  });
});
