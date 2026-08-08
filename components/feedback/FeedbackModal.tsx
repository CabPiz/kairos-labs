"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2, MessageSquare } from "lucide-react";

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

// ─────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────
const formSchema = z.object({
  nome: z.string().optional(),
  email: z.union([z.literal(""), z.string().email("Formato de e-mail inválido.")]),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface FeedbackModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly productId: string;
  readonly productName: string;
  readonly productColor: string;
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────
export function FeedbackModal({
  open,
  onOpenChange,
  productId,
  productName,
  productColor,
}: FeedbackModalProps) {
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

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.4rem",
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem 0.9rem",
    fontSize: "0.9rem",
    color: "#fff",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
  };

  // ── Painel de sucesso ──────────────────────────────────────
  if (actionState.status === "success") {
    return (
      <ModalResultPanel
        open={open}
        onOpenChange={handleOpenChange}
        icon={<CheckCircle size={30} color="#10b981" />}
        iconColor="#10b981"
        title="Sugestão enviada!"
        message={
          <>
            Obrigado pelo feedback sobre{" "}
            <span style={{ color: productColor, fontWeight: 600 }}>
              {productName}
            </span>
            {". "}
            Sua sugestão foi recebida e será analisada pelo fundador.
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
        className="border-0 p-0"
        style={{
          background: "#0b1221",
          border: "1px solid rgba(59,130,246,0.2)",
          maxWidth: "440px",
        }}
      >
        <div
          style={{
            height: "3px",
            borderRadius: "8px 8px 0 0",
            background: `linear-gradient(to right, ${productColor}, transparent)`,
          }}
        />

        <div style={{ padding: "1.8rem 2rem 2rem" }}>
          <DialogHeader style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "8px",
                background: `${productColor}18`,
                border: `1px solid ${productColor}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                color: productColor,
              }}
            >
              <MessageSquare size={20} />
            </div>

            <DialogTitle
              style={{
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 700,
                fontFamily: "var(--font-orbitron), sans-serif",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Enviar Sugestão
            </DialogTitle>
            <DialogDescription
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.83rem",
                lineHeight: 1.6,
                marginTop: "0.4rem",
              }}
            >
              Compartilhe sua ideia para{" "}
              <span style={{ color: productColor, fontWeight: 600 }}>
                {productName}
              </span>{". "}
              Nome e e-mail são opcionais.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Nome */}
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="feedback-nome" style={labelStyle}>
                Nome{" "}
                <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
                  (opcional)
                </span>
              </label>
              <input
                id="feedback-nome"
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                disabled={isPending}
                {...register("nome")}
                style={{ ...inputStyle, opacity: isPending ? 0.6 : 1 }}
              />
            </div>

            {/* E-mail */}
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="feedback-email" style={labelStyle}>
                E-mail{" "}
                <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
                  (opcional)
                </span>
              </label>
              <input
                id="feedback-email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                disabled={isPending}
                {...register("email")}
                style={{
                  ...inputStyle,
                  opacity: isPending ? 0.6 : 1,
                  borderColor: errors.email ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.15)",
                }}
              />
              {errors.email && (
                <p style={{ margin: "0.4rem 0 0", color: "rgba(239,68,68,0.9)", fontSize: "0.75rem" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Mensagem */}
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="feedback-mensagem" style={labelStyle}>
                Mensagem
              </label>
              <textarea
                id="feedback-mensagem"
                rows={4}
                placeholder="Descreva sua sugestão..."
                disabled={isPending}
                {...register("mensagem")}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  opacity: isPending ? 0.6 : 1,
                  borderColor: errors.mensagem ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.15)",
                  fontFamily: "inherit",
                }}
              />
              {errors.mensagem && (
                <p style={{ margin: "0.4rem 0 0", color: "rgba(239,68,68,0.9)", fontSize: "0.75rem" }}>
                  {errors.mensagem.message}
                </p>
              )}
            </div>

            {/* Erro genérico */}
            {actionState.status === "error" && (
              <ModalErrorBanner message={actionState.message} />
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                width: "100%",
                padding: "0.7rem",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#050a14",
                background: isPending ? `${productColor}80` : productColor,
                border: "none",
                borderRadius: "6px",
                cursor: isPending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "background 0.2s",
              }}
            >
              {isPending && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
              {isPending ? "Enviando..." : "Enviar Sugestão"}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
