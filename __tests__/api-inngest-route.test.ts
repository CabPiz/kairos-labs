const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockServe = jest.fn(() => ({ GET: mockGet, POST: mockPost, PUT: mockPut }));

jest.mock("inngest/next", () => ({
  serve: (...args: unknown[]) => mockServe(...args),
}));

jest.mock("@/inngest/client", () => ({
  inngest: { createFunction: jest.fn((_config: unknown, handler: unknown) => handler) },
}));

jest.mock("@/inngest/functions/analyze-contact", () => ({
  analyzeContact: jest.fn(),
}));

jest.mock("@/inngest/functions/analyze-feedback", () => ({
  analyzeFeedback: jest.fn(),
}));

import { GET, POST, PUT } from "@/app/api/inngest/route";
import { analyzeContact } from "@/inngest/functions/analyze-contact";
import { analyzeFeedback } from "@/inngest/functions/analyze-feedback";

describe("GET /api/inngest", () => {
  it("exporta os handlers GET, POST e PUT", () => {
    expect(GET).toBe(mockGet);
    expect(POST).toBe(mockPost);
    expect(PUT).toBe(mockPut);
  });

  it("chama serve com o client e as funções registradas", () => {
    expect(mockServe).toHaveBeenCalledWith(
      expect.objectContaining({
        functions: expect.arrayContaining([analyzeContact, analyzeFeedback]),
      }),
    );
  });
});
