import React from "react";
import { render, screen, act } from "@testing-library/react";
import { FeedbackList } from "@/components/admin/FeedbackList";
import type { Database } from "@/lib/types";

type FeedbackRow = Database["public"]["Tables"]["feedback"]["Row"];

const makeFeedback = (overrides: Partial<FeedbackRow> = {}): FeedbackRow => ({
  id: "fb-1",
  product_id: "devprint",
  nome: null,
  email: null,
  mensagem: "Ótimo produto!",
  mensagem_locale: "pt",
  created_at: "2026-08-10T12:00:00Z",
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
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("não chama fetch para feedback com locale null quando admin está em pt", () => {
    const feedback = makeFeedback({ mensagem_locale: null });
    render(<FeedbackList feedbacks={[feedback]} locale="pt" noFeedbackText="Nenhum." />);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("chama translate API e exibe texto traduzido quando locales diferem", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(mockTranslateResponse("Great product!"));
    const feedback = makeFeedback({ mensagem_locale: "pt" });
    await act(async () => {
      render(<FeedbackList feedbacks={[feedback]} locale="en" noFeedbackText="No feedback." />);
    });

    expect(screen.getByText("Great product!")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("translate.googleapis.com")
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("tl=en")
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
      await act(async () => {
        render(
          <FeedbackList feedbacks={[feedback]} locale={targetLocale} noFeedbackText="No feedback." />
        );
      });
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    }
  );

  it("exibe texto original como fallback quando fetch falha", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    const feedback = makeFeedback({ mensagem_locale: "pt" });
    await act(async () => {
      render(<FeedbackList feedbacks={[feedback]} locale="en" noFeedbackText="No feedback." />);
    });
    expect(screen.getByText("Ótimo produto!")).toBeInTheDocument();
  });

  it("exibe badge do idioma original quando locale difere do admin", async () => {
    const feedback = makeFeedback({ mensagem_locale: "pt" });
    (global.fetch as jest.Mock).mockReturnValueOnce(mockTranslateResponse("Great product!"));
    await act(async () => {
      render(<FeedbackList feedbacks={[feedback]} locale="en" noFeedbackText="No feedback." />);
    });
    expect(screen.getByText("PT")).toBeInTheDocument();
  });
});
