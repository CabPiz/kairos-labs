"use client";

import { useEffect, useState, useTransition } from "react";
import { X, Download, Paperclip, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { markContactViewed, getAttachmentSignedUrl } from "../actions";
import type { Database } from "@/lib/types";

type ContactRequest = Database["public"]["Tables"]["contact_requests"]["Row"];
type ContactAttachment = Database["public"]["Tables"]["contact_attachments"]["Row"];

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
