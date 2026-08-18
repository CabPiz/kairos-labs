const mockInngestConstructor = jest.fn().mockImplementation(({ id }) => ({ id }));

jest.mock("inngest", () => ({
  Inngest: function (...args: unknown[]) {
    return mockInngestConstructor(...args);
  },
}));

import { inngest } from "@/inngest/client";

describe("inngest client", () => {
  it("cria o cliente inngest com id kairos-labs", () => {
    expect(mockInngestConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ id: "kairos-labs" }),
    );
  });

  it("exporta o cliente inngest", () => {
    expect(inngest).toBeDefined();
  });
});
