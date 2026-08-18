const mockFetch = jest.fn();
global.fetch = mockFetch;

const ENV_VARS = {
  CALLMEBOT_PHONE: "+5511999999999",
  CALLMEBOT_API_KEY: "testkey123",
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

    it("chama a URL correta da API CallMeBot com phone e apikey", async () => {
      await notifyWhatsApp(validData);
      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toContain("https://api.callmebot.com/whatsapp.php");
      expect(url).toContain("phone=+5511999999999");
      expect(url).toContain("apikey=testkey123");
    });

    it("usa GET (sem segundo argumento ou sem método POST)", async () => {
      await notifyWhatsApp(validData);
      const callArgs = mockFetch.mock.calls[0] as unknown[];
      expect(callArgs.length).toBe(1);
    });

    it.each([
      ["nome", validData.name],
      ["e-mail", validData.email],
      ["tipo de projeto", validData.project_type],
      ["timestamp", validData.timestamp],
      ["descrição", validData.description],
    ] as const)(
      "inclui %s na URL codificada",
      async (_, expectedValue) => {
        await notifyWhatsApp(validData);
        const [url] = mockFetch.mock.calls[0] as [string];
        expect(url).toContain(encodeURIComponent(expectedValue));
      }
    );

    it("inclui telefone na URL quando fornecido", async () => {
      await notifyWhatsApp({ ...validData, phone: "11999999999" });
      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).toContain(encodeURIComponent("11999999999"));
    });

    it("omite linha de telefone quando ausente", async () => {
      await notifyWhatsApp(validData);
      const [url] = mockFetch.mock.calls[0] as [string];
      expect(url).not.toContain(encodeURIComponent("Telefone"));
    });

    it("propaga o erro do fetch para ser absorbed pelo after() do Next.js", async () => {
      mockFetch.mockRejectedValue(new Error("network error"));
      await expect(notifyWhatsApp(validData)).rejects.toThrow("network error");
    });
  });
});
