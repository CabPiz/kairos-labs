import {
  defineTool,
  CONTACT_SYSTEM_PROMPT,
  contactAgentTools,
  executeContactTool,
  FEEDBACK_SYSTEM_PROMPT,
  feedbackAgentTools,
  executeFeedbackTool,
} from "@/lib/ai/tools";

describe("defineTool", () => {
  it("retorna definição de tool com os campos corretos", () => {
    const schema = { type: "object" as const, properties: {}, required: [] };
    const tool = defineTool("minha_tool", "Descrição da tool", schema);

    expect(tool.name).toBe("minha_tool");
    expect(tool.description).toBe("Descrição da tool");
    expect(tool.input_schema).toBe(schema);
  });
});

describe("CONTACT_SYSTEM_PROMPT", () => {
  it("é uma string não-vazia", () => {
    expect(typeof CONTACT_SYSTEM_PROMPT).toBe("string");
    expect(CONTACT_SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });
});

describe("contactAgentTools", () => {
  it("é um array", () => {
    expect(Array.isArray(contactAgentTools)).toBe(true);
  });
});

describe("executeContactTool", () => {
  it("lança erro para tool desconhecida", async () => {
    await expect(executeContactTool("tool_inexistente", {})).rejects.toThrow(
      "Tool desconhecida para agente de contato: tool_inexistente",
    );
  });
});

describe("FEEDBACK_SYSTEM_PROMPT", () => {
  it("é uma string não-vazia", () => {
    expect(typeof FEEDBACK_SYSTEM_PROMPT).toBe("string");
    expect(FEEDBACK_SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });
});

describe("feedbackAgentTools", () => {
  it("é um array", () => {
    expect(Array.isArray(feedbackAgentTools)).toBe(true);
  });
});

describe("executeFeedbackTool", () => {
  it("lança erro para tool desconhecida", async () => {
    await expect(executeFeedbackTool("tool_inexistente", {})).rejects.toThrow(
      "Tool desconhecida para agente de feedback: tool_inexistente",
    );
  });
});
