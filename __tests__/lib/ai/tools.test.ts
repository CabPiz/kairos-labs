import { defineTool } from "@/lib/ai/tools";

describe("defineTool", () => {
  it("retorna definição de tool com os campos corretos", () => {
    const schema = { type: "object" as const, properties: {}, required: [] };
    const tool = defineTool("minha_tool", "Descrição da tool", schema);

    expect(tool.name).toBe("minha_tool");
    expect(tool.description).toBe("Descrição da tool");
    expect(tool.input_schema).toBe(schema);
  });
});
