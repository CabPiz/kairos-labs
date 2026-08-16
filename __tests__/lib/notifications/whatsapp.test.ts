const mockFetch = jest.fn();
global.fetch = mockFetch;

const ENV_VARS = {
  TWILIO_ACCOUNT_SID: "ACtest123",
  TWILIO_AUTH_TOKEN: "authtoken456",
  TWILIO_WHATSAPP_FROM: "+14155238886",
  WHATSAPP_NOTIFY_TO: "+5511999999999",
};

import { notifyWhatsApp } from "@/lib/notifications/whatsapp";

const validData = {
  name: "César Pizarro",
  email: "cesar@exemplo.com",
  project_type: "web",
  description: "Preciso de um sistema de gestão.",
  timestamp: "15/08/2026 às 14:32",
};

describe("notifyWhatsApp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    for (const key of Object.keys(ENV_VARS)) {
      delete process.env[key];
    }
  });

  describe("sem env vars configuradas", () => {
    it.each(Object.keys(ENV_VARS))(
      "retorna sem chamar fetch quando %s está ausente",
      async (missingKey) => {
        for (const [key, value] of Object.entries(ENV_VARS)) {
          if (key !== missingKey) process.env[key] = value;
        }
        await notifyWhatsApp(validData);
        expect(mockFetch).not.toHaveBeenCalled();
      }
    );

    it("retorna sem chamar fetch quando nenhuma env var está configurada", async () => {
      await notifyWhatsApp(validData);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("com env vars configuradas", () => {
    beforeEach(() => {
      for (const [key, value] of Object.entries(ENV_VARS)) {
        process.env[key] = value;
      }
    });

    it("chama a URL correta da API Twilio", async () => {
      await notifyWhatsApp(validData);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.twilio.com/2010-04-01/Accounts/ACtest123/Messages.json",
        expect.any(Object)
      );
    });

    it("envia Authorization Basic com credenciais codificadas em base64", async () => {
      await notifyWhatsApp(validData);
      const expectedBase64 = Buffer.from("ACtest123:authtoken456").toString("base64");
      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect((options.headers as Record<string, string>)["Authorization"]).toBe(
        `Basic ${expectedBase64}`
      );
    });

    it("envia método POST com Content-Type correto", async () => {
      await notifyWhatsApp(validData);
      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.method).toBe("POST");
      expect((options.headers as Record<string, string>)["Content-Type"]).toBe(
        "application/x-www-form-urlencoded"
      );
    });

    it("envia From e To com prefixo whatsapp:", async () => {
      await notifyWhatsApp(validData);
      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      const body = new URLSearchParams(options.body as string);
      expect(body.get("From")).toBe("whatsapp:+14155238886");
      expect(body.get("To")).toBe("whatsapp:+5511999999999");
    });

    it.each([
      ["nome", validData.name],
      ["e-mail", validData.email],
      ["tipo de projeto", validData.project_type],
      ["timestamp", validData.timestamp],
      ["descrição", validData.description],
    ] as const)(
      "inclui %s na mensagem enviada",
      async (_, expectedValue) => {
        await notifyWhatsApp(validData);
        const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
        const body = new URLSearchParams(options.body as string);
        expect(body.get("Body")).toContain(expectedValue);
      }
    );

    it("propaga o erro do fetch para ser absorbed pelo after() do Next.js", async () => {
      mockFetch.mockRejectedValue(new Error("network error"));
      await expect(notifyWhatsApp(validData)).rejects.toThrow("network error");
    });
  });
});
