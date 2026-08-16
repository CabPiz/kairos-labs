export interface WhatsAppContactNotification {
  name: string;
  email: string;
  project_type: string;
  description: string;
  timestamp: string;
}

function buildMessage(data: WhatsAppContactNotification): string {
  return [
    "📬 *Nova solicitação de contato*",
    "",
    `👤 *Nome:* ${data.name}`,
    `📧 *E-mail:* ${data.email}`,
    `🗂️ *Projeto:* ${data.project_type}`,
    `🕒 *Enviado em:* ${data.timestamp}`,
    "",
    "💬 *Mensagem:*",
    data.description,
  ].join("\n");
}

/**
 * Envia notificação WhatsApp via Twilio quando uma solicitação de contato é recebida.
 *
 * Fire-and-forget: erros são absorvidos pelo chamador (`after()` do Next.js).
 * Retorna sem chamar a API quando qualquer variável de ambiente estiver ausente,
 * permitindo execução local e CI sem credenciais Twilio.
 *
 * @param data - Dados da solicitação: nome, e-mail, tipo de projeto, descrição e timestamp
 */
export async function notifyWhatsApp(
  data: WhatsAppContactNotification
): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.WHATSAPP_NOTIFY_TO;

  if (!accountSid || !authToken || !from || !to) return;

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: `whatsapp:${from}`,
        To: `whatsapp:${to}`,
        Body: buildMessage(data),
      }),
    }
  );
}
