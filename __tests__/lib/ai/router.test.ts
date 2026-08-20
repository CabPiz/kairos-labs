import { routeModel, MODELS } from "@/lib/ai/router";

jest.mock("@anthropic-ai/sdk", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@ai-sdk/google", () => ({
  google: jest.fn().mockReturnValue({}),
}));

describe("routeModel", () => {
  it.each([
    ["classification", "fast"],
    ["analysis", "balanced"],
  ] as const)("taskType '%s' retorna o tier '%s'", (taskType, tier) => {
    expect(routeModel(taskType)).toBe(MODELS[tier]);
  });
});
