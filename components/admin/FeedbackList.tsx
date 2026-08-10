"use client";

import { useState, useEffect } from "react";
import { productNames } from "@/lib/product-names";
import type { Database } from "@/lib/types";

type FeedbackRow = Database["public"]["Tables"]["feedback"]["Row"];

interface FeedbackListProps {
  readonly feedbacks: FeedbackRow[];
  readonly locale: string;
  readonly noFeedbackText: string;
}

/**
 * Traduz um texto para o locale alvo via Google Translate (cliente, sem API key).
 * Retorna o texto original em caso de falha.
 */
async function translateText(text: string, targetLocale: string): Promise<string> {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLocale}&dt=t&q=${encodeURIComponent(text)}`
    );
    if (!res.ok) return text;
    const data = (await res.json()) as [[string[]][]];
    return data[0].map((segment) => segment[0]).join("") || text;
  } catch {
    return text;
  }
}

/**
 * Lista de feedbacks com tradução on-demand via Google Translate no browser.
 * Feedbacks cujo locale de origem já é o locale atual não são enviados para tradução.
 * Feedbacks com locale desconhecido (null) são assumidos como "pt".
 */
export function FeedbackList({ feedbacks, locale, noFeedbackText }: FeedbackListProps) {
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const toTranslate = feedbacks.filter(
      (f) => (f.mensagem_locale ?? "pt") !== locale
    );
    if (toTranslate.length === 0) return;

    const run = async () => {
      setIsTranslating(true);
      const results = await Promise.all(
        toTranslate.map(async (f) => {
          const translated = await translateText(f.mensagem, locale);
          return [f.id, translated] as const;
        })
      );
      setTranslations(new Map(results));
      setIsTranslating(false);
    };
    void run();
  }, [feedbacks, locale]);

  if (feedbacks.length === 0) {
    return <p className="text-white/35 text-[0.88rem]">{noFeedbackText}</p>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-[860px]">
      {feedbacks.map((s) => {
        const needsTranslation = (s.mensagem_locale ?? "pt") !== locale;
        const displayText = translations.get(s.id) ?? s.mensagem;
        const pending = isTranslating && needsTranslation && !translations.has(s.id);

        return (
          <div
            key={s.id}
            className="bg-white/[0.03] border border-[rgba(59,130,246,0.14)] rounded-[10px] px-6 py-5"
          >
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-[#d4a017] bg-[rgba(212,160,23,0.12)] border border-[rgba(212,160,23,0.3)] rounded-[4px] px-[0.6rem] py-[0.2rem]">
                {productNames[s.product_id] ?? s.product_id}
              </span>
              <span className="text-white/30 text-[0.78rem]">
                {new Date(s.created_at).toLocaleString(locale)}
              </span>
              {s.mensagem_locale && s.mensagem_locale !== locale && (
                <span className="text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-white/30 border border-white/[0.1] rounded-[3px] px-[0.45rem] py-[0.15rem]">
                  {s.mensagem_locale.toUpperCase()}
                </span>
              )}
              {s.nome && (
                <span className="text-white/55 text-[0.78rem]">{s.nome}</span>
              )}
              {s.email && (
                <span className="text-white/40 text-[0.78rem]">{s.email}</span>
              )}
            </div>
            <p
              className={`m-0 text-[0.88rem] leading-[1.7] whitespace-pre-wrap transition-opacity duration-300 ${
                pending ? "opacity-40 text-white/70" : "text-white/70"
              }`}
            >
              {displayText}
            </p>
          </div>
        );
      })}
    </div>
  );
}
