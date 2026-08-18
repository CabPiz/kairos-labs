export interface WhatsAppContactNotification {
  name: string;
  email: string;
  project_type: string;
  description: string;
  timestamp: string;
  phone?: string;
}

function buildMessage(data: WhatsAppContactNotification): string {
  const lines = [
    "📬 Nova solicitação de contato",
    "",
    `👤 Nome: ${data.name}`,
    `📧 E-mail: ${data.email}`,
  ];

  if (data.phone) lines.push(`📱 Telefone: ${data.phone}`);

  lines.push(
    `🗂️ Projeto: ${data.project_type}`,
    `🕒 Enviado em: ${data.timestamp}`,
    "",
    "💬 Mensagem:",
    data.description
  );

  return lines.join("\n");
}

/**
 * Envia notificação WhatsApp via CallMeBot quando uma solicitação de contato é recebida.
 *
 * Fire-and-forget: erros são absorvidos pelo chamador (`after()` do Next.js).
 * Retorna sem chamar a API quando qualquer variável de ambiente estiver ausente,
 * permitindo execução local e CI sem credenciais configuradas.
 *
 * @param data - Dados da solicitação: nome, e-mail, tipo de projeto, descrição e timestamp
 */
export async function notifyWhatsApp(
  data: WhatsAppContactNotification
): Promise<void> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY;

  if (!phone || !apiKey) return;

  await fetch(
    `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(buildMessage(data))}&apikey=${apiKey}`
  );
}
