"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ModalResultPanel } from "@/components/ui/ModalResultPanel";
import { joinWaitlistAction, type WaitlistActionState } from "./waitlist-action";

// ─────────────────────────────────────────────────────────────
// Schema de validação client-side
// ─────────────────────────────────────────────────────────────
const formSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .email("Formato de e-mail inválido."),
});

type FormValues = z.infer<typeof formSchema>;

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productColor: string;
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────
export function WaitlistModal({
  open,
  onOpenChange,
  productId,
  productName,
  productColor,
}: WaitlistModalProps) {
  const [actionState, setActionState] = useState<WaitlistActionState>({
    status: "idle",
  });
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // Ao fechar o modal, resetar o estado para que na próxima abertura
  // o formulário apareça limpo (sem mensagem de sucesso anterior)
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setActionState({ status: "idle" });
    }
    onOpenChange(nextOpen);
  }

  function onSubmit(values: FormValues) {
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("product_id", productId);

    startTransition(async () => {
      const result = await joinWaitlistAction(formData);
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
        title="Você está na lista!"
        message={
          <>
            <span style={{ color: "#10b981", fontWeight: 600 }}>
              {actionState.email}
            </span>{" "}
            foi cadastrado na lista de espera de{" "}
            <span style={{ color: productColor, fontWeight: 600 }}>
              {productName}
            </span>
            {". "}
            Você será notificado no lançamento.
          </>
        }
        buttonColor="#10b981"
      />
    );
  }

  // ── Painel de e-mail duplicado ─────────────────────────────
  if (actionState.status === "duplicate") {
    return (
      <ModalResultPanel
        open={open}
        onOpenChange={handleOpenChange}
        icon={<AlertCircle size={30} color="#d4a017" />}
        iconColor="#d4a017"
        title="Já registrado"
        message={
          <>
            Este e-mail já está na lista de espera de{" "}
            <span style={{ color: productColor, fontWeight: 600 }}>
              {productName}
            </span>
            {". "}
            Você será notificado no lançamento.
          </>
        }
        buttonColor="#d4a017"
      />
    );
  }

  // ── Formulário principal (idle | error) ────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="border-0 p-0 overflow-hidden"
        style={{
          background: "#0b1221",
          border: "1px solid rgba(59,130,246,0.2)",
          maxWidth: "420px",
        }}
      >
        {/* Barra de destaque na cor do produto */}
        <div
          style={{
            height: "3px",
            background: `linear-gradient(to right, ${productColor}, transparent)`,
          }}
        />

        <div style={{ padding: "1.8rem 2rem 2rem" }}>
          <DialogHeader style={{ marginBottom: "1.5rem" }}>
            {/* Ícone de e-mail */}
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
              <Mail size={20} />
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
              Acesso Antecipado
            </DialogTitle>
            <DialogDescription
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.83rem",
                lineHeight: 1.6,
                marginTop: "0.4rem",
              }}
            >
              Entre na lista de espera de{" "}
              <span style={{ color: productColor, fontWeight: 600 }}>
                {productName}
              </span>{" "}
              e seja notificado no lançamento.
            </DialogDescription>
          </DialogHeader>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="waitlist-email"
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                E-mail
              </label>
              <input
                id="waitlist-email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                disabled={isPending}
                {...register("email")}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.9rem",
                  fontSize: "0.9rem",
                  color: "#fff",
                  background: "rgba(255,255,255,0.05)",
                  border: errors.email
                    ? "1px solid rgba(239,68,68,0.7)"
                    : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "6px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                  opacity: isPending ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.currentTarget.style.borderColor = productColor;
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.15)";
                  }
                }}
              />
              {errors.email && (
                <p
                  style={{
                    margin: "0.4rem 0 0",
                    color: "rgba(239,68,68,0.9)",
                    fontSize: "0.75rem",
                  }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Erro genérico da action */}
            {actionState.status === "error" && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.65rem 0.9rem",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "6px",
                  color: "rgba(239,68,68,0.9)",
                  fontSize: "0.78rem",
                  lineHeight: 1.5,
                }}
              >
                {actionState.message}
              </div>
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
                background: isPending ? "rgba(212,160,23,0.5)" : "#d4a017",
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
              {isPending ? "Cadastrando..." : "Garantir Acesso Antecipado"}
            </button>

            <p
              style={{
                marginTop: "0.9rem",
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.72rem",
                lineHeight: 1.5,
              }}
            >
              Sem spam. Apenas uma notificação quando o produto lançar.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}