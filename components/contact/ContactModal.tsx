"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2, Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ModalResultPanel } from "@/components/ui/ModalResultPanel";
import { ModalErrorBanner } from "@/components/ui/ModalErrorBanner";
import { sendContactAction, type ContactActionState, type ContactFormData } from "./contact-action";
import { PROJECT_TYPE_KEYS, isValidEmail, isValidPhone } from "./contact-schema";

interface ContactModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const t = useTranslations("contactModal");
  const [actionState, setActionState] = useState<ContactActionState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const formSchema = z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    email: z.string().min(1, t("validation.emailRequired")).refine(isValidEmail, {
      message: t("validation.emailInvalid"),
    }),
    project_type: z.enum(PROJECT_TYPE_KEYS, { message: t("validation.projectTypeRequired") }),
    description: z
      .string()
      .min(1, t("validation.descriptionRequired"))
      .max(500, t("validation.descriptionMax")),
    phone: z.string().optional().refine((val) => isValidPhone(val ?? ""), {
      message: t("validation.phoneInvalid"),
    }),
    whatsapp_preferred: z.boolean().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { project_type: "web" as const },
  });

  const description = useWatch({ control, name: "description" });
  const descriptionLength = description?.length ?? 0;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setActionState({ status: "idle" });
    }
    onOpenChange(nextOpen);
  }

  function onSubmit(values: FormValues) {
    const data: ContactFormData = {
      name: values.name,
      email: values.email,
      project_type: values.project_type,
      description: values.description,
      phone: values.phone || undefined,
      whatsapp_preferred: values.whatsapp_preferred ?? false,
    };

    startTransition(async () => {
      const result = await sendContactAction(data);
      setActionState(result);
    });
  }

  if (actionState.status === "success") {
    return (
      <ModalResultPanel
        open={open}
        onOpenChange={handleOpenChange}
        icon={<CheckCircle size={30} color="#10b981" />}
        iconColor="#10b981"
        title={t("success.title")}
        message={<>{t("success.message")}</>}
        buttonColor="#10b981"
        buttonLabel={t("success.close")}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="border-0 p-0 overflow-hidden"
        style={{
          background: "#0b1221",
          border: "1px solid rgba(59,130,246,0.2)",
          maxWidth: "480px",
        }}
      >
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-500/10 border border-blue-500/30">
                <Briefcase size={16} className="text-blue-400" />
              </div>
              <DialogTitle className="text-white text-base font-bold tracking-wide uppercase font-[var(--font-orbitron)]">
                {t("title")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/50 text-sm leading-relaxed">
              {t("description")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {actionState.status === "error" && (
              <ModalErrorBanner message={actionState.message} />
            )}

            {/* Nome */}
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-name" className="text-white/70 text-xs font-semibold tracking-wider uppercase">
                {t("fields.name.label")}
              </label>
              <input
                id="contact-name"
                type="text"
                autoComplete="name"
                placeholder={t("fields.name.placeholder")}
                {...register("name")}
                className={cn(
                  "bg-white/5 border rounded px-3 py-2 text-white text-sm placeholder:text-white/25 outline-none focus:border-blue-500/60 transition-colors",
                  errors.name ? "border-red-500/50" : "border-white/10"
                )}
              />
              {errors.name && (
                <span className="text-red-400 text-xs">{errors.name.message}</span>
              )}
            </div>

            {/* E-mail */}
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-email" className="text-white/70 text-xs font-semibold tracking-wider uppercase">
                {t("fields.email.label")}
              </label>
              <input
                id="contact-email"
                type="email"
                autoComplete="email"
                placeholder={t("fields.email.placeholder")}
                {...register("email")}
                className={cn(
                  "bg-white/5 border rounded px-3 py-2 text-white text-sm placeholder:text-white/25 outline-none focus:border-blue-500/60 transition-colors",
                  errors.email ? "border-red-500/50" : "border-white/10"
                )}
              />
              {errors.email && (
                <span className="text-red-400 text-xs">{errors.email.message}</span>
              )}
            </div>

            {/* Tipo de projeto */}
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-project-type" className="text-white/70 text-xs font-semibold tracking-wider uppercase">
                {t("fields.projectType.label")}
              </label>
              <select
                id="contact-project-type"
                {...register("project_type")}
                className={cn(
                  "bg-white/5 border rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500/60 transition-colors",
                  errors.project_type ? "border-red-500/50" : "border-white/10"
                )}
              >
                {PROJECT_TYPE_KEYS.map((key) => (
                  <option key={key} value={key} className="bg-[#0b1221]">
                    {t(`projectTypes.${key}`)}
                  </option>
                ))}
              </select>
              {errors.project_type && (
                <span className="text-red-400 text-xs">{errors.project_type.message}</span>
              )}
            </div>

            {/* Descrição */}
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-description" className="text-white/70 text-xs font-semibold tracking-wider uppercase">
                {t("fields.projectDescription.label")}
              </label>
              <textarea
                id="contact-description"
                rows={4}
                maxLength={500}
                placeholder={t("fields.projectDescription.placeholder")}
                {...register("description")}
                className={cn(
                  "bg-white/5 border rounded px-3 py-2 text-white text-sm placeholder:text-white/25 outline-none focus:border-blue-500/60 transition-colors resize-none",
                  errors.description ? "border-red-500/50" : "border-white/10"
                )}
              />
              <div className="flex justify-between items-center">
                {errors.description ? (
                  <span className="text-red-400 text-xs">{errors.description.message}</span>
                ) : (
                  <span />
                )}
                <span className="text-white/30 text-xs">{descriptionLength}/500</span>
              </div>
            </div>

            {/* Telefone / WhatsApp */}
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-phone" className="text-white/70 text-xs font-semibold tracking-wider uppercase">
                {t("fields.phone.label")}{" "}
                <span className="text-white/30 normal-case font-normal">
                  {t("fields.phone.optional")}
                </span>
              </label>
              <input
                id="contact-phone"
                type="tel"
                autoComplete="tel"
                placeholder={t("fields.phone.placeholder")}
                {...register("phone")}
                className={cn(
                  "bg-white/5 border rounded px-3 py-2 text-white text-sm placeholder:text-white/25 outline-none focus:border-blue-500/60 transition-colors",
                  errors.phone ? "border-red-500/50" : "border-white/10"
                )}
              />
              {errors.phone && (
                <span className="text-red-400 text-xs">{errors.phone.message}</span>
              )}
            </div>

            {/* Preferência WhatsApp */}
            <label htmlFor="contact-whatsapp" className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="contact-whatsapp"
                type="checkbox"
                {...register("whatsapp_preferred")}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
              <span className="text-white/60 text-sm">{t("fields.whatsapp.label")}</span>
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold tracking-widest uppercase rounded px-6 py-3 transition-colors"
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
