import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackList } from "@/components/admin/FeedbackList";
import type { FeedbackWithMeta } from "@/lib/types";

jest.mock("@/components/admin/FeedbackDrawer", () => ({
  FeedbackDrawer: ({ feedback, onClose }: { feedback: FeedbackWithMeta | null; onClose: () => void }) => {
    if (!feedback) return null;
    return (
      <div data-testid="feedback-drawer">
        <button type="button" onClick={onClose}>Fechar</button>
      </div>
    );
  },
}));

const makeFeedback = (overrides: Partial<FeedbackWithMeta> = {}): FeedbackWithMeta => ({
  id: "fb-1",
  product_id: "devprint",
  nome: null,
  email: null,
  mensagem: "Ótimo produto!",
  mensagem_locale: "pt",
  notify_on_completion: false,
  notify_email: null,
  analysis_status: null,
  issue_draft: null,
  github_issue_number: null,
  github_issue_url: null,
  analyzed_at: null,
  created_at: "2026-08-10T12:00:00Z",
  attachment_count: 0,
  ...overrides,
});

const mockTranslateResponse = (translated: string) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([[[translated, "Ótimo produto!"]]]),
  } as Response);

describe("FeedbackList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("exibe mensagem quando não há feedbacks", () => {
    render(<FeedbackList feedbacks={[]} locale="pt" noFeedbackText="Nenhum feedback ainda." />);
    expect(screen.getByText("Nenhum feedback ainda.")).toBeInTheDocument();
  });

  it("exibe feedback original quando locale já é o mesmo", () => {
    const feedback = makeFeedback({ mensagem_locale: "pt" });
    render(<FeedbackList feedbacks={[feedback]} locale="pt" noFeedbackText="Nenhum." />);
    expect(screen.getByText("Ótimo produto!")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("translate.googleapis.com")
    );
  });

  it("não chama translate para feedback com locale null quando admin está em pt", () => {
    const feedback = makeFeedback({ mensagem_locale: null });
    render(<FeedbackList feedbacks={[feedback]} locale="pt" noFeedbackText="Nenhum." />);
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("translate.googleapis.com")
    );
  });

  it("chama translate API e exibe texto traduzido quando locales diferem", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(mockTranslateResponse("Great product!"));
    const feedback = makeFeedback({ mensagem_locale: "pt" });
    render(<FeedbackList feedbacks={[feedback]} locale="en" noFeedbackText="No feedback." />);
    expect(await screen.findByText("Great product!")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("translate.googleapis.com")
    );
  });

  it.each([
    ["en", "Great product!"],
    ["es", "¡Gran producto!"],
  ])(
    "traduz para %s corretamente",
    async (targetLocale, expectedText) => {
      (global.fetch as jest.Mock).mockReturnValueOnce(mockTranslateResponse(expectedText));
      const feedback = makeFeedback({ mensagem_locale: "pt" });
      render(
        <FeedbackList feedbacks={[feedback]} locale={targetLocale} noFeedbackText="No feedback." />
      );
      expect(await screen.findByText(expectedText)).toBeInTheDocument();
    }
  );

  it("exibe texto original como fallback quando fetch falha", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    const feedback = makeFeedback({ mensagem_locale: "pt" });
    render(<FeedbackList feedbacks={[feedback]} locale="en" noFeedbackText="No feedback." />);
    expect(await screen.findByText("Ótimo produto!")).toBeInTheDocument();
  });

  it("exibe badge do idioma original quando locale difere do admin", async () => {
    const feedback = makeFeedback({ mensagem_locale: "pt" });
    (global.fetch as jest.Mock).mockReturnValueOnce(mockTranslateResponse("Great product!"));
    render(<FeedbackList feedbacks={[feedback]} locale="en" noFeedbackText="No feedback." />);
    expect(await screen.findByText("PT")).toBeInTheDocument();
  });

  it("exibe ícone de Paperclip quando há anexos", () => {
    const feedback = makeFeedback({ attachment_count: 2 });
    render(<FeedbackList feedbacks={[feedback]} locale="pt" noFeedbackText="Nenhum." />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("não exibe contagem de anexos quando attachment_count é 0", () => {
    const feedback = makeFeedback({ attachment_count: 0 });
    render(<FeedbackList feedbacks={[feedback]} locale="pt" noFeedbackText="Nenhum." />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("exibe número da issue quando github_issue_number está definido", () => {
    const feedback = makeFeedback({ github_issue_number: 42 });
    render(<FeedbackList feedbacks={[feedback]} locale="pt" noFeedbackText="Nenhum." />);
    expect(screen.getByText("#42")).toBeInTheDocument();
  });

  it("cada card é renderizado como botão clicável", () => {
    const feedback = makeFeedback();
    render(<FeedbackList feedbacks={[feedback]} locale="pt" noFeedbackText="Nenhum." />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("clicar em um card abre o FeedbackDrawer", async () => {
    const feedback = makeFeedback();
    render(<FeedbackList feedbacks={[feedback]} locale="pt" noFeedbackText="Nenhum." />);
    await userEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.getByTestId("feedback-drawer")).toBeInTheDocument();
  });

  it("drawer fecha ao clicar em Fechar", async () => {
    const feedback = makeFeedback();
    render(<FeedbackList feedbacks={[feedback]} locale="pt" noFeedbackText="Nenhum." />);
    await userEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.getByTestId("feedback-drawer")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /fechar/i }));
    expect(screen.queryByTestId("feedback-drawer")).not.toBeInTheDocument();
  });
});
