"use client";

import { useState } from "react";
import { X, Paperclip, Download, Loader2, Sparkles, ExternalLink, Bell } from "lucide-react";
import type { FeedbackWithMeta, IssueDraftJson } from "@/lib/types";
import { AIDisclosureBadge } from "@/components/legal/AIDisclosureBadge";

interface FeedbackDrawerProps {
  readonly feedback: FeedbackWithMeta | null;
  readonly onClose: () => void;
}

interface AttachmentRow {
  id: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function FeedbackDrawer({ feedback, onClose }: FeedbackDrawerProps) {
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState<Map<string, string>>(new Map());
  const [downloadErrors, setDownloadErrors] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [draft, setDraft] = useState<IssueDraftJson | null>(feedback?.issue_draft ?? null);
  const [draftTitle, setDraftTitle] = useState(feedback?.issue_draft?.title ?? "");
  const [draftBody, setDraftBody] = useState(feedback?.issue_draft?.body ?? "");
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [createdIssueUrl, setCreatedIssueUrl] = useState<string | null>(feedback?.github_issue_url ?? null);
  const [issueError, setIssueError] = useState<string | null>(null);

  if (!feedback) return null;

  const isAnalyzed = feedback.analysis_status === "done" || draft !== null;
  const hasIssue = feedback.github_issue_number !== null || createdIssueUrl !== null;

  async function loadAttachments() {
    if (attachmentsLoaded || feedback === null) return;
    setLoadingAttachments(true);
    try {
      const res = await fetch(`/api/admin/feedback-attachments?feedback_id=${feedback.id}`);
      if (res.ok) {
        const data = await res.json() as { attachments: AttachmentRow[] };
        setAttachments(data.attachments);
      }
    } finally {
      setLoadingAttachments(false);
      setAttachmentsLoaded(true);
    }
  }

  async function downloadAttachment(id: string, storagePath: string) {
    if (downloadUrls.has(id)) {
      window.open(downloadUrls.get(id), "_blank");
      return;
    }
    try {
      const res = await fetch(`/api/admin/feedback-attachments/signed-url?path=${encodeURIComponent(storagePath)}`);
      if (!res.ok) throw new Error();
      const { url } = await res.json() as { url: string };
      setDownloadUrls((prev) => new Map(prev).set(id, url));
      window.open(url, "_blank");
    } catch {
      setDownloadErrors((prev) => new Set(prev).add(id));
    }
  }

  async function handleAnalyze() {
    if (feedback === null) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/admin/analyze-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: feedback.id }),
      });
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? "Erro");
      const data = await res.json() as { draft: IssueDraftJson };
      setDraft(data.draft);
      setDraftTitle(data.draft.title);
      setDraftBody(data.draft.body);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Erro ao analisar. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleCreateIssue() {
    if (feedback === null || !draft) return;
    setIsCreatingIssue(true);
    setIssueError(null);
    try {
      const res = await fetch("/api/admin/create-github-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackId: feedback.id,
          title: draftTitle,
          issueBody: draftBody,
          labels: draft.labels,
          milestone: draft.milestone,
        }),
      });
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? "Erro");
      const data = await res.json() as { issueUrl: string };
      setCreatedIssueUrl(data.issueUrl);
    } catch (err) {
      setIssueError(err instanceof Error ? err.message : "Erro ao criar issue. Tente novamente.");
    } finally {
      setIsCreatingIssue(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        role="presentation"
      />
      <aside
        role="complementary"
        aria-label="Detalhes do feedback"
        className="relative w-full max-w-[520px] bg-[#0b1221] border-l border-[rgba(59,130,246,0.15)] flex flex-col overflow-y-auto"
      >
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.07]">
          <h2 className="text-[0.72rem] font-bold tracking-[0.18em] uppercase text-white/40">
            Detalhe do Feedback
          </h2>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors" aria-label="Fechar painel">
            <X size={18} />
          </button>
        </header>

        <div className="px-8 py-6 flex flex-col gap-6 flex-1">
          {/* Cabeçalho do feedback */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-[#d4a017] bg-[rgba(212,160,23,0.12)] border border-[rgba(212,160,23,0.3)] rounded-[4px] px-[0.6rem] py-[0.2rem]">
                {feedback.product_id}
              </span>
              {feedback.notify_on_completion && (
                <span className="flex items-center gap-1 text-[0.65rem] font-semibold text-blue-400/80 border border-blue-400/20 rounded-[4px] px-[0.5rem] py-[0.15rem]">
                  <Bell size={10} />{" "}Notificar
                </span>
              )}
              <span className="text-white/30 text-[0.78rem]">
                {new Date(feedback.created_at).toLocaleString("pt-BR")}
              </span>
            </div>
            {feedback.nome && <p className="text-white/55 text-[0.83rem] mb-1">{feedback.nome}</p>}
            {feedback.email && <p className="text-white/40 text-[0.78rem] mb-1">{feedback.email}</p>}
            {feedback.notify_on_completion && feedback.notify_email && (
              <p className="text-blue-400/60 text-[0.75rem]">
                📧 Notificação: {feedback.notify_email}
              </p>
            )}
            <p className="mt-3 text-white/75 text-[0.9rem] leading-[1.7] whitespace-pre-wrap">
              {feedback.mensagem}
            </p>
          </div>

          {/* Anexos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[0.68rem] font-bold tracking-[0.16em] uppercase text-white/35">
                Anexos {feedback.attachment_count > 0 && `(${feedback.attachment_count})`}
              </h3>
              {!attachmentsLoaded && feedback.attachment_count > 0 && (
                <button
                  type="button"
                  onClick={() => { void loadAttachments(); }}
                  className="text-[0.75rem] text-blue-400/70 hover:text-blue-300 transition-colors"
                >
                  Carregar
                </button>
              )}
            </div>
            {feedback.attachment_count === 0 && (
              <p className="text-white/25 text-[0.82rem]">Nenhum anexo.</p>
            )}
            {loadingAttachments && <Loader2 size={14} className="animate-spin text-white/30" />}
            {attachmentsLoaded && attachments.map((att) => (
              <div key={att.id} className="flex items-center justify-between gap-2 py-2 border-b border-white/[0.06] last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip size={12} className="text-white/30 flex-shrink-0" />
                  <span className="text-white/65 text-[0.82rem] truncate">{att.filename}</span>
                  <span className="text-white/25 text-[0.75rem] flex-shrink-0">{formatBytes(att.size_bytes)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { void downloadAttachment(att.id, att.storage_path); }}
                  className="flex items-center gap-1 text-[0.75rem] text-blue-400/70 hover:text-blue-300 transition-colors flex-shrink-0"
                >
                  {downloadErrors.has(att.id) ? (
                    <span className="text-red-400/70">Erro</span>
                  ) : (
                    <><Download size={12} /> Baixar</>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Seção de IA */}
          <div className="border border-[rgba(59,130,246,0.15)] rounded-[10px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[0.68rem] font-bold tracking-[0.16em] uppercase text-white/35">
                Análise por IA
              </h3>
              <AIDisclosureBadge />
            </div>

            {!isAnalyzed && !hasIssue && (
              <button
                type="button"
                onClick={() => { void handleAnalyze(); }}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-[6px] text-blue-300 text-[0.82rem] font-semibold hover:bg-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isAnalyzing ? "Analisando…" : "Analisar com IA"}
              </button>
            )}

            {analyzeError && (
              <p className="mt-2 text-red-400/80 text-[0.82rem]">{analyzeError}</p>
            )}

            {isAnalyzed && draft && !hasIssue && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-white/30">Classificação:</span>
                  <span className="text-[0.78rem] text-white/70 font-semibold">{draft.classification}</span>
                </div>

                <div>
                  <label className="block mb-1 text-[0.68rem] font-bold tracking-[0.1em] uppercase text-white/30">
                    Título
                  </label>
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full px-3 py-2 text-[0.88rem] text-white bg-white/5 border border-white/15 rounded-[6px] outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[0.68rem] font-bold tracking-[0.1em] uppercase text-white/30">
                    Body (Markdown)
                  </label>
                  <textarea
                    rows={8}
                    value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                    className="w-full px-3 py-2 text-[0.83rem] text-white bg-white/5 border border-white/15 rounded-[6px] outline-none resize-y font-mono"
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {draft.labels.map((lbl) => (
                    <span key={lbl} className="text-[0.68rem] border border-white/15 rounded-[3px] px-2 py-[2px] text-white/50">
                      {lbl}
                    </span>
                  ))}
                </div>

                {issueError && (
                  <p className="text-red-400/80 text-[0.82rem]">{issueError}</p>
                )}

                <button
                  type="button"
                  onClick={() => { void handleCreateIssue(); }}
                  disabled={isCreatingIssue || !draftTitle.trim()}
                  className="flex items-center justify-center gap-2 py-2 bg-[#d4a017]/20 border border-[#d4a017]/40 rounded-[6px] text-[#d4a017] text-[0.82rem] font-bold tracking-[0.08em] hover:bg-[#d4a017]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isCreatingIssue ? <Loader2 size={14} className="animate-spin" /> : null}
                  {isCreatingIssue ? "Criando…" : "Criar Issue no GitHub"}
                </button>
              </div>
            )}

            {hasIssue && (
              <a
                href={createdIssueUrl ?? feedback.github_issue_url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 text-[0.83rem] hover:text-blue-300 transition-colors"
              >
                <ExternalLink size={13} />
                Issue #{feedback.github_issue_number ?? ""} criada no GitHub
              </a>
            )}

            {feedback.analysis_status === "error" && !isAnalyzed && (
              <div className="flex flex-col gap-2">
                <p className="text-red-400/70 text-[0.82rem]">Análise anterior falhou.</p>
                <button
                  type="button"
                  onClick={() => { void handleAnalyze(); }}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-[6px] text-blue-300 text-[0.82rem] font-semibold hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
