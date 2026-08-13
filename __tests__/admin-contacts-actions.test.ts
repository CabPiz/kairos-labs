const mockCreateSignedUrl = jest.fn();
const mockStorageFrom = jest.fn(() => ({ createSignedUrl: mockCreateSignedUrl }));

const mockUpdateChain = {
  eq: jest.fn(() => ({ eq: jest.fn() })),
};

const mockAdminClient = {
  from: jest.fn(() => ({ update: jest.fn(() => mockUpdateChain) })),
  storage: { from: mockStorageFrom },
};

jest.mock("@/lib/supabase-server", () => ({
  createServerAdminClient: jest.fn(() => mockAdminClient),
}));

import { markContactViewed, getAttachmentSignedUrl } from "@/app/admin/contacts/actions";

describe("markContactViewed", () => {
  beforeEach(() => jest.clearAllMocks());

  it("chama update com status visualizado e filtra pelo id e status novo", async () => {
    const mockEq2 = jest.fn();
    const mockEq1 = jest.fn(() => ({ eq: mockEq2 }));
    const mockUpdateFn = jest.fn(() => ({ eq: mockEq1 }));
    mockAdminClient.from = jest.fn(() => ({ update: mockUpdateFn }));

    await markContactViewed("uuid-abc");

    expect(mockAdminClient.from).toHaveBeenCalledWith("contact_requests");
    expect(mockUpdateFn).toHaveBeenCalledWith({ status: "visualizado" });
    expect(mockEq1).toHaveBeenCalledWith("id", "uuid-abc");
    expect(mockEq2).toHaveBeenCalledWith("status", "novo");
  });
});

describe("getAttachmentSignedUrl", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna signed URL quando Supabase responde com sucesso", async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://example.com/signed" },
      error: null,
    });

    const url = await getAttachmentSignedUrl("uuid/arquivo.pdf");
    expect(url).toBe("https://example.com/signed");
    expect(mockStorageFrom).toHaveBeenCalledWith("contact-attachments");
    expect(mockCreateSignedUrl).toHaveBeenCalledWith("uuid/arquivo.pdf", 60);
  });

  it("retorna null quando Supabase retorna erro", async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: null,
      error: { message: "not found" },
    });

    const url = await getAttachmentSignedUrl("uuid/inexistente.pdf");
    expect(url).toBeNull();
  });
});
