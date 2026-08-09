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

// i18n routing mock — evita import de next-intl/server dentro do page.tsx
jest.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["pt", "en", "es"],
    defaultLocale: "pt",
  },
}));

import ProdutoDetalhe from "@/app/[locale]/[slug]/page";

async function renderSlug(slug: string, locale = "pt") {
  const Component = await Promise.resolve(
    ProdutoDetalhe({ params: Promise.resolve({ locale, slug }) })
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

  it("exibe link de voltar apontando para /${locale}#products", async () => {
    await renderSlug("devprint", "pt");
    const link = screen.getByRole("link", { name: /portfólio/i });
    expect(link).toHaveAttribute("href", "/pt#products");
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
  it("retorna 18 combinações locale × slug (3 locales × 6 produtos)", async () => {
    const { generateStaticParams } = await import("@/app/[locale]/[slug]/page");
    const params = generateStaticParams();
    expect(params).toHaveLength(18);
    const ptDevprint = params.find(
      (p: { locale: string; slug: string }) =>
        p.locale === "pt" && p.slug === "devprint"
    );
    expect(ptDevprint).toBeDefined();
    const enTalvrix = params.find(
      (p: { locale: string; slug: string }) =>
        p.locale === "en" && p.slug === "talvrix"
    );
    expect(enTalvrix).toBeDefined();
  });
});
