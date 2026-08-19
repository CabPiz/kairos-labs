"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle, Loader2, MessageSquare, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidEmail } from "@/components/contact/contact-schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ModalResultPanel } from "@/components/ui/ModalResultPanel";
import { ModalErrorBanner } from "@/components/ui/ModalErrorBanner";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
]);
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_FILES = 5;

interface FeedbackModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly productId: string;
  readonly productName: string;
  readonly productColor: string;
}

type ActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FeedbackModal({
  open,
  onOpenChange,
  productId,
  productName,
  productColor,
}: FeedbackModalProps) {
  const t = useTranslations("feedbackModal");
  const currentLocale = useLocale();

  const formSchema = z.object({
    nome: z.string().optional(),
    email: z.union([
      z.literal(""),
      z.string().refine(isValidEmail, { message: t("validation.emailInvalid") }),
    ]),
    mensagem: z.string().min(10, t("validation.messageMin")),
    notify_email: z.union([
      z.literal(""),
      z.string().refine(isValidEmail, { message: t("notify.emailInvalid") }),
    ]).optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const [actionState, setActionState] = useState<ActionState>({ status: "idle" });
  const [isPending, setIsPending] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [notifyOnCompletion, setNotifyOnCompletion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setActionState({ status: "idle" });
      setFiles([]);
      setFileErrors([]);
      setNotifyOnCompletion(false);
    }
    onOpenChange(nextOpen);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []);
    const errs: string[] = [];
    const valid: File[] = [];

    for (const file of incoming) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        errs.push(t("attachments.fileTypeError"));
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errs.push(t("attachments.fileSizeError"));
        continue;
      }
      valid.push(file);
    }

    const combined = [...files, ...valid];
    if (combined.length > MAX_FILES) {
      errs.push(t("attachments.maxFilesError"));
      setFiles(combined.slice(0, MAX_FILES));
    } else {
      setFiles(combined);
    }
    setFileErrors(errs);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileErrors([]);
  }

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    setActionState({ status: "idle" });

    const fd = new FormData();
    fd.set("product_id", productId);
    fd.set("nome", values.nome ?? "");
    fd.set("email", values.email ?? "");
    fd.set("mensagem", values.mensagem);
    fd.set("locale", currentLocale);
    fd.set("notify_on_completion", notifyOnCompletion ? "true" : "false");
    if (notifyOnCompletion) {
      fd.set("notify_email", values.notify_email ?? values.email ?? "");
    }
    files.forEach((f) => fd.append("attachments", f));

    try {
      const res = await fetch("/api/feedback", { method: "POST", body: fd });
      const data = await res.json() as { status: string; message?: string };
      if (data.status === "success") {
        setActionState({ status: "success" });
      } else {
        setActionState({ status: "error", message: data.message ?? "Erro ao enviar sugestão." });
      }
    } catch {
      setActionState({ status: "error", message: "Não foi possível enviar a sugestão. Tente novamente." });
    } finally {
      setIsPending(false);
    }
  }

  if (actionState.status === "success") {
    return (
      <ModalResultPanel
        open={open}
        onOpenChange={handleOpenChange}
        icon={<CheckCircle size={30} color="#10b981" />}
        iconColor="#10b981"
        title={t("successTitle")}
        message={<>{t("successMessage", { productName })}</>}
        buttonColor="#10b981"
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="border-0 p-0 bg-[#0b1221] border border-[rgba(59,130,246,0.2)] max-w-[440px]"
      >
        <div
          className="h-[3px] rounded-t-[8px]"
          style={{ background: `linear-gradient(to right, ${productColor}, transparent)` }}
        />

        <div className="px-8 pt-[1.8rem] pb-8">
          <DialogHeader className="mb-6">
            <div
              className="w-11 h-11 rounded-[8px] flex items-center justify-center mb-4"
              style={{
                background: `${productColor}18`,
                border: `1px solid ${productColor}40`,
                color: productColor,
              }}
            >
              <MessageSquare size={20} />
            </div>

            <DialogTitle
              className="text-white text-base font-bold tracking-[0.04em] uppercase"
              style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              {t("title")}
            </DialogTitle>
            <DialogDescription className="text-white/50 text-[0.83rem] leading-[1.6] mt-[0.4rem]">
              {t("description", { productName })}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Nome */}
            <div className="mb-4">
              <label
                htmlFor="feedback-nome"
                className="block mb-[0.4rem] text-white/70 text-xs font-semibold tracking-[0.12em] uppercase"
              >
                {t("nameLabel")}{" "}
                <span className="text-white/30 font-normal">{t("optional")}</span>
              </label>
              <input
                id="feedback-nome"
                type="text"
                autoComplete="name"
                placeholder={t("namePlaceholder")}
                disabled={isPending}
                {...register("nome")}
                className={cn(
                  "w-full px-[0.9rem] py-[0.65rem] text-[0.9rem] text-white bg-white/5 border border-white/15 rounded-[6px] outline-none box-border",
                  isPending && "opacity-60"
                )}
              />
            </div>

            {/* E-mail */}
            <div className="mb-4">
              <label
                htmlFor="feedback-email"
                className="block mb-[0.4rem] text-white/70 text-xs font-semibold tracking-[0.12em] uppercase"
              >
                {t("emailLabel")}{" "}
                <span className="text-white/30 font-normal">{t("optional")}</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                disabled={isPending}
                {...register("email")}
                className={cn(
                  "w-full px-[0.9rem] py-[0.65rem] text-[0.9rem] text-white bg-white/5 border rounded-[6px] outline-none box-border",
                  isPending && "opacity-60",
                  errors.email ? "border-red-500/70" : "border-white/15"
                )}
              />
              {errors.email && (
                <p className="mt-[0.4rem] m-0 text-red-500/90 text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Mensagem */}
            <div className="mb-4">
              <label
                htmlFor="feedback-mensagem"
                className="block mb-[0.4rem] text-white/70 text-xs font-semibold tracking-[0.12em] uppercase"
              >
                {t("messageLabel")}
              </label>
              <textarea
                id="feedback-mensagem"
                rows={4}
                placeholder={t("messagePlaceholder")}
                disabled={isPending}
                {...register("mensagem")}
                className={cn(
                  "w-full px-[0.9rem] py-[0.65rem] text-[0.9rem] text-white bg-white/5 border rounded-[6px] outline-none box-border resize-y font-[inherit]",
                  isPending && "opacity-60",
                  errors.mensagem ? "border-red-500/70" : "border-white/15"
                )}
              />
              {errors.mensagem && (
                <p className="mt-[0.4rem] m-0 text-red-500/90 text-xs">
                  {errors.mensagem.message}
                </p>
              )}
            </div>

            {/* Anexos */}
            <div className="mb-4">
              <label className="block mb-[0.4rem] text-white/70 text-xs font-semibold tracking-[0.12em] uppercase">
                {t("attachments.label")}{" "}
                <span className="text-white/30 font-normal normal-case tracking-normal">{t("attachments.hint")}</span>
              </label>

              <input
                ref={fileInputRef}
                id="feedback-attachments"
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                disabled={isPending}
                onChange={handleFileChange}
                className="sr-only"
              />

              {files.length === 0 ? (
                <label
                  htmlFor="feedback-attachments"
                  className={cn(
                    "flex items-center gap-2 px-[0.9rem] py-[0.65rem] border border-dashed border-white/20 rounded-[6px] text-white/40 text-[0.83rem] cursor-pointer transition-colors hover:border-white/35 hover:text-white/60",
                    isPending && "pointer-events-none opacity-40"
                  )}
                >
                  <Paperclip size={14} />
                  {t("attachments.add")}
                </label>
              ) : (
                <div className="flex flex-col gap-1">
                  {files.map((file, i) => (
                    <div
                      key={`${file.name}-${file.size}`}
                      className="flex items-center justify-between gap-2 px-[0.9rem] py-[0.55rem] bg-white/[0.04] border border-white/10 rounded-[6px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip size={12} className="text-white/35 flex-shrink-0" />
                        <span className="text-white/70 text-[0.82rem] truncate">{file.name}</span>
                        <span className="text-white/30 text-[0.75rem] flex-shrink-0">{formatBytes(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        disabled={isPending}
                        className="text-white/30 hover:text-white/60 flex-shrink-0 p-0.5"
                        aria-label={`Remover ${file.name}`}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  {files.length < MAX_FILES && (
                    <label
                      htmlFor="feedback-attachments"
                      className={cn(
                        "flex items-center gap-2 px-[0.9rem] py-[0.4rem] text-white/35 text-[0.78rem] cursor-pointer hover:text-white/55",
                        isPending && "pointer-events-none opacity-40"
                      )}
                    >
                      <Paperclip size={12} />
                      {t("attachments.add")}
                    </label>
                  )}
                </div>
              )}

              {fileErrors.map((err, i) => (
                <p key={i} className="mt-[0.3rem] m-0 text-red-500/90 text-xs">{err}</p>
              ))}
            </div>

            {/* Checkbox de notificação */}
            <div className="mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnCompletion}
                  onChange={(e) => setNotifyOnCompletion(e.target.checked)}
                  disabled={isPending}
                  className="mt-[2px] w-4 h-4 flex-shrink-0 accent-[#3b82f6]"
                />
                <span className="text-white/65 text-[0.83rem] leading-[1.5]">
                  {t("notify.checkboxLabel")}
                </span>
              </label>
            </div>

            {/* E-mail de notificação (condicional) */}
            {notifyOnCompletion && (
              <div className="mb-4">
                <label
                  htmlFor="feedback-notify-email"
                  className="block mb-[0.4rem] text-white/70 text-xs font-semibold tracking-[0.12em] uppercase"
                >
                  {t("notify.emailLabel")}{" "}
                  <span className="text-white/30 font-normal normal-case tracking-normal">{t("notify.emailHint")}</span>
                </label>
                <input
                  id="feedback-notify-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("notify.emailPlaceholder")}
                  defaultValue={getValues("email") ?? ""}
                  disabled={isPending}
                  {...register("notify_email")}
                  className={cn(
                    "w-full px-[0.9rem] py-[0.65rem] text-[0.9rem] text-white bg-white/5 border rounded-[6px] outline-none box-border",
                    isPending && "opacity-60",
                    errors.notify_email ? "border-red-500/70" : "border-white/15"
                  )}
                />
                {errors.notify_email && (
                  <p className="mt-[0.4rem] m-0 text-red-500/90 text-xs">
                    {errors.notify_email.message}
                  </p>
                )}
              </div>
            )}

            {actionState.status === "error" && (
              <ModalErrorBanner message={actionState.message} />
            )}

            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full py-[0.7rem] text-[0.78rem] font-bold tracking-[0.14em] uppercase text-[#050a14] border-none rounded-[6px] flex items-center justify-center gap-2 transition-[background] duration-200",
                isPending ? "cursor-not-allowed" : "cursor-pointer"
              )}
              style={{ background: isPending ? `${productColor}80` : productColor }}
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? t("submitting") : t("submit")}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
