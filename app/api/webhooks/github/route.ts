import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient } from "@/lib/supabase-server";
import { Resend } from "resend";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * POST /api/webhooks/github — processa eventos `issues` do GitHub.
 * Ao receber `issues.closed`, verifica se há feedback com `notify_on_completion = true`
 * vinculado à issue e dispara e-mail via Resend.
 * Valida a assinatura HMAC-SHA256 com GITHUB_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256") ?? "";

  if (!verifySignature(secret, rawBody, signature)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  if (event !== "issues") {
    return NextResponse.json({ status: "ignored" });
  }

  const payload = JSON.parse(rawBody) as {
    action: string;
    issue?: { number: number; title: string; html_url: string };
  };

  if (payload.action !== "closed" || !payload.issue) {
    return NextResponse.json({ status: "ignored" });
  }

  const { number: issueNumber, title: issueTitle, html_url: issueUrl } = payload.issue;

  const supabase = createServerAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: notifications } = await (supabase as any)
    .from("feedback_notifications")
    .select("id, feedback_id")
    .eq("github_issue_number", issueNumber)
    .eq("status", "pending");

  if (!notifications || notifications.length === 0) {
    return NextResponse.json({ status: "no_notifications" });
  }

  // Verificar se o produto está lançado
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: settingsRow } = await (supabase as any)
    .from("settings")
    .select("value")
    .eq("key", "product_launched")
    .single();

  const isLaunched = (settingsRow?.value as { launched?: boolean } | null)?.launched === true;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Kairos Labs <noreply@kairoslabs.com.br>";

  for (const notif of notifications as { id: string; feedback_id: string }[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: feedbackRow } = await (supabase as any)
      .from("feedback")
      .select("notify_email, produto: product_id")
      .eq("id", notif.feedback_id)
      .single();

    const notifyEmail = feedbackRow?.notify_email as string | null;
    if (!notifyEmail) continue;

    const emailContent = isLaunched
      ? buildLaunchedEmail(issueTitle, issueUrl)
      : buildPendingEmail(issueTitle);

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: notifyEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("feedback_notifications").update({
      status: sendError ? "failed" : "sent",
      sent_at: sendError ? null : new Date().toISOString(),
      product_launched: isLaunched,
      error_message: sendError ? (sendError as { message?: string }).message ?? "Erro desconhecido" : null,
    }).eq("id", notif.id);
  }

  return NextResponse.json({ status: "processed" });
}

function verifySignature(secret: string, body: string, signature: string): boolean {
  const expected = `sha256=${createHmac("sha256", secret).update(body, "utf-8").digest("hex")}`;
  try {
    return timingSafeEqual(Buffer.from(signature, "utf-8"), Buffer.from(expected, "utf-8"));
  } catch {
    return false;
  }
}

function buildLaunchedEmail(title: string, url: string) {
  return {
    subject: "✅ Sua sugestão foi implementada — Kairos Labs",
    html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#d4a017;margin-bottom:8px">Sua sugestão está no ar!</h2>
  <p>Olá! A funcionalidade que você sugeriu (<strong>${title}</strong>) foi implementada e já está disponível.</p>
  <p><a href="${url}" style="color:#3b82f6">Ver no GitHub</a></p>
  <p>Obrigado pelo seu feedback — ele faz a diferença no que construímos.</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
  <p style="font-size:12px;color:#6b7280">Kairos Labs · <a href="https://kairoslabs.com.br/privacy" style="color:#6b7280">Política de Privacidade</a></p>
</div>`,
  };
}

function buildPendingEmail(title: string) {
  return {
    subject: "🛠️ Sua sugestão foi implementada — Kairos Labs",
    html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#d4a017;margin-bottom:8px">Sua sugestão foi implementada!</h2>
  <p>Olá! A funcionalidade que você sugeriu (<strong>${title}</strong>) foi concluída e será entregue quando o produto for lançado.</p>
  <p>Enviaremos uma nova notificação no lançamento — fique ligado!</p>
  <p>Obrigado pelo seu feedback — ele faz a diferença no que construímos.</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
  <p style="font-size:12px;color:#6b7280">Kairos Labs · <a href="https://kairoslabs.com.br/privacy" style="color:#6b7280">Política de Privacidade</a></p>
</div>`,
  };
}
