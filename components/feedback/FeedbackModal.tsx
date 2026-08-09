"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { CheckCircle, Loader2, MessageSquare } from "lucide-react";
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
import { sendFeedbackAction, type FeedbackActionState } from "./feedback-action";

interface FeedbackModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly productId: string;
  readonly productName: string;
  readonly productColor: string;
}

export function FeedbackModal({
  open,
  onOpenChange,
  productId,
  productName,
  productColor,
}: FeedbackModalProps) {
  const t = useTranslations("feedbackModal");

  const formSchema = z.object({
    nome: z.string().optional(),
    email: z.union([
      z.literal(""),
      z.string().refine(isValidEmail, { message: t("validation.emailInvalid") }),
    ]),
    mensagem: z.string().min(10, t("validation.messageMin")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const [actionState, setActionState] = useState<FeedbackActionState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setActionState({ status: "idle" });
    }
    onOpenChange(nextOpen);
  }

  function onSubmit(values: FormValues) {
    const formData = new FormData();
    formData.set("product_id", productId);
    formData.set("nome", values.nome ?? "");
    formData.set("email", values.email ?? "");
    formData.set("mensagem", values.mensagem);

    startTransition(async () => {
      const result = await sendFeedbackAction(formData);
      setActionState(result);
    });
  }

  // ── Painel de sucesso ──────────────────────────────────────
  if (actionState.status === "success") {
    return (
      <ModalResultPanel
        open={open}
        onOpenChange={handleOpenChange}
        icon={<CheckCircle size={30} color="#10b981" />}
        iconColor="#10b981"
        title={t("successTitle")}
        message={
          <>
            {t("successMessage", { productName })}
          </>
        }
        buttonColor="#10b981"
      />
    );
  }

  // ── Formulário principal ───────────────────────────────────
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
