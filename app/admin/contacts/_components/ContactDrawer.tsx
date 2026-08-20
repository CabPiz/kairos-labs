"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { X, Download, Paperclip, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  markContactViewed,
  getAttachmentSignedUrl,
  triggerContactAnalysis,
  getContactAnalysis,
  createGitHubIssue,
} from "../actions";
import { AIDisclosureBadge } from "@/components/legal/AIDisclosureBadge";
import type { Database, IssueDraftJson } from "@/lib/types";

type ContactRequest = Database["public"]["Tables"]["contact_requests"]["Row"];
type ContactAttachment = Database["public"]["Tables"]["contact_attachments"]["Row"];
type ContactAnalysisRow = Database["public"]["Tables"]["contact_analysis"]["Row"];

interface ContactDrawerProps {
  readonly contact: (ContactRequest & { attachments: ContactAttachment[] }) | null;
  readonly onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_STYLE: Record<string, { color: string; background: string; border: string }> = {
  novo: { color: "#60a5fa", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)" },
  respondido: { color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" },
  visualizado: { color: "#9ca3af", background: "rgba(156,163,175,0.1)", border: "1px solid rgba(156,163,175,0.2)" },
};

interface IssueDraftEditorProps {
  readonly draft: IssueDraftJson;
  readonly index: number;
  readonly onChange: (index: number, updated: IssueDraftJson) => void;
  readonly onCreateIssue: (index: number) => void;
  readonly creating: boolean;
  readonly created: boolean;
  readonly issueUrl: string | null;
}

function IssueDraftEditor({
  draft,
  index,
  onChange,
  onCreateIssue,
  creating,
  created,
  issueUrl,
}: IssueDraftEditorProps) {
  const t = useTranslations("admin.contacts.drawer.analysis");
  const [reviewed, setReviewed] = useState(false);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(index, { ...draft, title: e.target.value });
  }

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(index, { ...draft, body: e.target.value });
  }

  function handleCreate() {
    if (!reviewed) return;
    onCreateIssue(index);
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        padding: "0.875rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
      }}
    >
      <div>
        <label
          htmlFor={`draft-title-${index}`}
          className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-white/30"
        >
          {t("titleLabel")}
        </label>
        <input
          id={`draft-title-${index}`}
          type="text"
          value={draft.title}
          onChange={handleTitleChange}
          disabled={created}
          className="w-full mt-1 bg-transparent text-white/80 text-xs border border-white/[0.1] rounded-[4px] px-2 py-1.5 outline-none focus:border-blue-400/40 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor={`draft-body-${index}`}
          className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-white/30"
        >
          {t("bodyLabel")}
        </label>
        <textarea
          id={`draft-body-${index}`}
          rows={4}
          value={draft.body}
          onChange={handleBodyChange}
          disabled={created}
          className="w-full mt-1 bg-transparent text-white/80 text-xs border border-white/[0.1] rounded-[4px] px-2 py-1.5 outline-none focus:border-blue-400/40 disabled:opacity-50 resize-none"
        />
      </div>

      {draft.labels.length > 0 && (
        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-white/30 mb-1">
            {t("labelsLabel")}
          </p>
          <div className="flex flex-wrap gap-1">
            {draft.labels.map((label) => (
              <span
                key={label}
                className="text-[0.6rem] px-1.5 py-0.5 rounded-[3px] bg-white/[0.06] text-white/50 border border-white/[0.08]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {!created && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
            className="w-3.5 h-3.5 accent-blue-400"
          />
          <span className="text-[0.65rem] text-white/40">{t("reviewPrompt")}</span>
        </label>
      )}

      {created && issueUrl ? (
        <a
          href={issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[0.65rem] font-bold text-emerald-400 tracking-[0.08em]"
        >
          <ExternalLink size={11} />
          {t("issueCreated")}
        </a>
      ) : (
        <button
          type="button"
          onClick={handleCreate}
          disabled={!reviewed || creating}
          className="flex items-center gap-1.5 text-[0.65rem] font-bold tracking-[0.1em] uppercase text-blue-400/80 hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors w-fit"
        >
          {creating ? <Loader2 size={11} className="animate-spin" /> : <ExternalLink size={11} />}
          {creating ? t("creating") : t("createIssue")}
        </button>
      )}
    </div>
  );
}

const PIPELINE_STEPS = [
  "fetch-contact",
  "extract-attachments",
  "run-product-agent",
  "save-analysis",
] as const;

type StepKey = (typeof PIPELINE_STEPS)[number];

const STEP_ESTIMATES: Record<StepKey, { expected: number; max: number }> = {
  "fetch-contact":       { expected: 10, max: 60  },
  "extract-attachments": { expected: 20, max: 60  },
  "run-product-agent":   { expected: 45, max: 120 },
  "save-analysis":       { expected: 10, max: 60  },
};

interface PipelineStepsProps {
  readonly currentStep: string | null;
  readonly isSlow: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly t: (key: string) => any;
}

function PipelineSteps({ currentStep, isSlow, t }: PipelineStepsProps) {
  const foundIndex = PIPELINE_STEPS.findIndex((s) => s === currentStep);
  const activeIndex = foundIndex === -1 ? 0 : foundIndex;
  const activeStep = PIPELINE_STEPS[activeIndex];
  const initialCountdown = STEP_ESTIMATES[activeStep].expected;

  const [countdown, setCountdown] = useState(initialCountdown);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {PIPELINE_STEPS.map((step, i) => {
        const isDone = activeIndex > i;
        const isActive = activeIndex === i;

        return (
          <div key={step} className="flex items-center gap-2.5">
            <div
              className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                background: isDone
                  ? "rgba(16,185,129,0.15)"
                  : isActive
                    ? "rgba(96,165,250,0.15)"
                    : "rgba(255,255,255,0.04)",
                border: isDone
                  ? "1px solid rgba(16,185,129,0.4)"
                  : isActive
                    ? "1px solid rgba(96,165,250,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {isDone ? (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3.5 6L6.5 2" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : isActive ? (
                <Loader2 size={8} className="animate-spin text-blue-400" />
              ) : null}
            </div>
            <span
              className="text-[0.65rem] leading-none"
              style={{
                color: isDone
                  ? "rgba(16,185,129,0.6)"
                  : isActive
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.2)",
              }}
            >
              {t(`steps.${step as StepKey}`)}
              {isActive && (
                <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: "0.25rem" }}>
                  {countdown === 0 ? `(${t("waiting")})` : `(~${countdown}s)`}
                </span>
              )}
            </span>
          </div>
        );
      })}
      {isSlow && (
        <p className="text-[0.62rem] leading-snug" style={{ color: "rgba(251,191,36,0.75)" }}>
          {t("slow")}
        </p>
      )}
    </div>
  );
}

interface AnalysisPanelProps {
  readonly contactId: string;
  readonly onContactRespondido: () => void;
}

function AnalysisPanel({ contactId, onContactRespondido }: AnalysisPanelProps) {
  const t = useTranslations("admin.contacts.drawer.analysis");
  const [, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<ContactAnalysisRow | null>(null);
  const [triggering, setTriggering] = useState(false);
  const [drafts, setDrafts] = useState<IssueDraftJson[]>([]);
  const [creatingIndex, setCreatingIndex] = useState<number | null>(null);
  const [createdIndices, setCreatedIndices] = useState<Set<number>>(new Set());
  const [issueUrls, setIssueUrls] = useState<Record<number, string>>({});
  const [isSlow, setIsSlow] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepStartedAtRef = useRef<number>(0);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const loadAnalysis = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await getContactAnalysis(contactId);
        setAnalysis(result);
        if (result) {
          setDrafts(result.draft_issues as IssueDraftJson[]);
        }
        if (result?.status === "done" || result?.status === "error") {
          stopPolling();
        }
      } catch {
        stopPolling();
      }
    });
  }, [contactId, stopPolling]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const isAnalyzing = analysis?.status === "pending" || analysis?.status === "analyzing";

  useEffect(() => {
    if (!isAnalyzing) return;

    stepStartedAtRef.current = Date.now();

    const currentStep = analysis?.current_step as StepKey | undefined;
    const estimates = currentStep ? STEP_ESTIMATES[currentStep] : null;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - stepStartedAtRef.current) / 1000;

      if (estimates && elapsed > estimates.max) {
        clearInterval(interval);
        stopPolling();
        setAnalysis((prev) => ({
          ...(prev ?? { contact_request_id: contactId }),
          status: "error",
          error_message: t("timeout"),
        } as ContactAnalysisRow));
      } else if (estimates && elapsed > estimates.expected * 2) {
        setIsSlow(true);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      setIsSlow(false);
    };
  }, [isAnalyzing, analysis?.current_step, contactId, stopPolling, t]);

  function startPolling() {
    stopPolling();
    pollingRef.current = setInterval(loadAnalysis, 3000);
  }

  function handleCancel() {
    stopPolling();
    setAnalysis(null);
    setIsSlow(false);
  }

  function handleTrigger() {
    setTriggering(true);
    startTransition(async () => {
      try {
        await triggerContactAnalysis(contactId);
        setAnalysis((prev) =>
          prev
            ? { ...prev, status: "pending" }
            : ({ contact_request_id: contactId, status: "pending" } as ContactAnalysisRow),
        );
        startPolling();
      } catch {
        // Em produção Next.js sanitiza err.message em Server Actions — mensagem fixa evita vazar internals.
        setAnalysis((prev) => ({
          ...(prev ?? { contact_request_id: contactId }),
          status: "error",
          error_message: "Erro ao iniciar análise",
        } as ContactAnalysisRow));
      } finally {
        setTriggering(false);
      }
    });
  }

  function handleDraftChange(index: number, updated: IssueDraftJson) {
    setDrafts((prev) => prev.map((d, i) => (i === index ? updated : d)));
  }

  function handleCreateIssue(index: number) {
    const draft = drafts[index];
    if (!draft) return;
    setCreatingIndex(index);
    startTransition(async () => {
      try {
        const result = await createGitHubIssue(contactId, {
          title: draft.title,
          body: draft.body,
          labels: draft.labels,
        });
        setIssueUrls((prev) => ({ ...prev, [index]: result.url }));
        setCreatedIndices((prev) => new Set([...prev, index]));
        onContactRespondido();
      } finally {
        setCreatingIndex(null);
      }
    });
  }

  const isDone = analysis?.status === "done";
  const isError = analysis?.status === "error";
  const hasAnalysis = analysis !== null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[0.68rem] font-bold tracking-[0.18em] uppercase text-white/30 flex items-center gap-2">
          <Sparkles size={11} />
          Análise IA
        </p>
        <AIDisclosureBadge variant="inline" />
      </div>

      {(!hasAnalysis || isError) && (
        <button
          type="button"
          onClick={handleTrigger}
          disabled={triggering || isAnalyzing}
          className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.1em] uppercase text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors w-fit border border-blue-400/30 hover:border-blue-400/60 rounded-[6px] px-3 py-1.5"
        >
          {triggering ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {isError ? t("retrigger") : t("trigger")}
        </button>
      )}

      {isAnalyzing && (
        <>
          <PipelineSteps key={analysis?.current_step ?? "pending"} currentStep={analysis?.current_step ?? null} isSlow={isSlow} t={t} />
          <button
            type="button"
            onClick={handleCancel}
            className="text-[0.62rem] text-white/30 hover:text-white/60 transition-colors w-fit underline underline-offset-2"
          >
            {t("cancel")}
          </button>
        </>
      )}

      {isError && analysis.error_message && (
        <p className="text-[0.65rem] text-red-400/80">
          {t("errorLabel")}: {analysis.error_message}
        </p>
      )}

      {isDone && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-white/30 mb-1.5">
              {t("problema")}
            </p>
            <p className="text-white/70 text-xs leading-relaxed">{analysis.problema}</p>
          </div>

          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-white/30 mb-1.5">
              {t("solucao")}
            </p>
            <p className="text-[0.65rem] text-blue-300/70 mb-1">
              {t("typeLabel")}:{" "}
              {analysis.solucao_tipo === "novo_produto" ? t("novo_produto") : t("aprimoramento")}
            </p>
            <p className="text-white/80 text-xs font-semibold mb-1">{analysis.solucao_titulo}</p>
            <p className="text-white/60 text-xs leading-relaxed">{analysis.solucao_descricao}</p>
          </div>

          {Array.isArray(analysis.nichos) && analysis.nichos.length > 0 && (
            <div>
              <p className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-white/30 mb-2">
                {t("nichos")}
              </p>
              <ul className="flex flex-col gap-2">
                {(analysis.nichos as { publico: string; justificativa: string }[]).map((n) => (
                  <li
                    key={n.publico}
                    className="bg-white/[0.03] border border-white/[0.07] rounded-[6px] px-3 py-2"
                  >
                    <p className="text-white/80 text-xs font-semibold">{n.publico}</p>
                    <p className="text-white/40 text-[0.65rem] leading-snug mt-0.5">{n.justificativa}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {drafts.length > 0 && (
            <div>
              <p className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-white/30 mb-2">
                {t("drafts")}
              </p>
              <div className="flex flex-col gap-3">
                {drafts.map((draft, i) => (
                  <IssueDraftEditor
                    key={draft.title}
                    draft={draft}
                    index={i}
                    onChange={handleDraftChange}
                    onCreateIssue={handleCreateIssue}
                    creating={creatingIndex === i}
                    created={createdIndices.has(i)}
                    issueUrl={issueUrls[i] ?? null}
                  />
                ))}
              </div>
            </div>
          )}

          {Array.isArray(analysis.attachments_used) && analysis.attachments_used.length > 0 && (
            <div>
              <p className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-white/30 mb-1.5">
                {t("attachmentsUsed")}
              </p>
              <ul className="flex flex-col gap-0.5">
                {(analysis.attachments_used as string[]).map((name) => (
                  <li key={name} className="text-[0.65rem] text-white/40 flex items-center gap-1.5">
                    <Paperclip size={9} />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ContactDrawer({ contact, onClose }: ContactDrawerProps) {
  const t = useTranslations("admin");
  const [, startTransition] = useTransition();
  const [downloadStates, setDownloadStates] = useState<Record<string, "idle" | "loading" | "error">>({});

  useEffect(() => {
    if (contact?.status !== "novo") return;
    startTransition(async () => {
      await markContactViewed(contact.id);
    });
  }, [contact]);

  function handleDownload(attachment: ContactAttachment) {
    setDownloadStates((prev) => ({ ...prev, [attachment.id]: "loading" }));
    startTransition(async () => {
      const url = await getAttachmentSignedUrl(attachment.storage_path);
      if (!url) {
        setDownloadStates((prev) => ({ ...prev, [attachment.id]: "error" }));
        return;
      }
      setDownloadStates((prev) => ({ ...prev, [attachment.id]: "idle" }));
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  const isOpen = contact !== null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label={t("contacts.drawer.message")}
        className="fixed top-0 right-0 h-full w-full max-w-[480px] z-50 flex flex-col transition-transform duration-300"
        style={{
          background: "#0b1221",
          borderLeft: "1px solid rgba(59,130,246,0.2)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {contact && (
          <>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] flex-shrink-0">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-white font-bold text-sm truncate">{contact.name}</span>
                <span className="text-white/40 text-xs truncate">{contact.email}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 ml-3 text-white/40 hover:text-white/80 transition-colors"
                aria-label={t("contacts.drawer.close")}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
              <div className="flex gap-2 flex-wrap">
                <span
                  className="text-[0.65rem] font-bold tracking-[0.14em] uppercase rounded-[4px] px-[0.6rem] py-[0.2rem]"
                  style={STATUS_STYLE[contact.status] ?? STATUS_STYLE.visualizado}
                >
                  {t(`contacts.status.${contact.status}`)}
                </span>
                <span className="text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-white/30 border border-white/[0.1] rounded-[3px] px-[0.45rem] py-[0.15rem]">
                  {contact.project_type}
                </span>
                {contact.whatsapp_preferred && (
                  <span className="text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-emerald-400/60 border border-emerald-400/20 rounded-[3px] px-[0.45rem] py-[0.15rem]">
                    WhatsApp
                  </span>
                )}
              </div>

              <div>
                <p className="text-[0.68rem] font-bold tracking-[0.18em] uppercase text-white/30 mb-2">
                  {t("contacts.drawer.message")}
                </p>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {contact.description}
                </p>
              </div>

              {contact.phone && (
                <div>
                  <p className="text-[0.68rem] font-bold tracking-[0.18em] uppercase text-white/30 mb-1">
                    Telefone
                  </p>
                  <p className="text-white/70 text-sm">{contact.phone}</p>
                </div>
              )}

              <div>
                <p className="text-[0.68rem] font-bold tracking-[0.18em] uppercase text-white/30 mb-3 flex items-center gap-2">
                  <Paperclip size={11} />{" "}{t("contacts.drawer.attachments")}
                </p>
                {contact.attachments.length === 0 ? (
                  <p className="text-white/30 text-xs">{t("contacts.drawer.noAttachments")}</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {contact.attachments.map((att) => {
                      const state = downloadStates[att.id] ?? "idle";
                      return (
                        <li
                          key={att.id}
                          className="flex items-center justify-between gap-3 bg-white/[0.04] border border-white/[0.08] rounded-[8px] px-4 py-3"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-white/80 text-xs truncate">{att.filename}</span>
                            <span className="text-white/30 text-[0.65rem]">{formatBytes(att.size_bytes)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownload(att)}
                            disabled={state === "loading"}
                            className="flex-shrink-0 flex items-center gap-1.5 text-[0.65rem] font-bold tracking-[0.1em] uppercase text-blue-400/80 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label={`${t("contacts.drawer.download")} ${att.filename}`}
                          >
                            {state === "loading" ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Download size={12} />
                            )}
                            {state === "loading"
                              ? t("contacts.drawer.loadingUrl")
                              : t("contacts.drawer.download")}
                          </button>
                          {state === "error" && (
                            <span className="text-red-400 text-[0.65rem]">
                              {t("contacts.drawer.urlError")}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="border-t border-white/[0.06] pt-5">
                <AnalysisPanel
                  contactId={contact.id}
                  onContactRespondido={() => {
                    // optimistic: contact_request será marcado 'respondido' pela action
                  }}
                />
              </div>

              <p className="text-white/20 text-[0.65rem] mt-auto">
                {new Date(contact.created_at).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
