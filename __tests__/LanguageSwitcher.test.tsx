import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

const mockPush = jest.fn();
const mockPathname = "/pt";

jest.mock("next-intl", () => ({
  useLocale: () => "pt",
  useTranslations: () => (key: string) => {
    if (key === "label") return "Idioma";
    return key;
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renderiza o botão com o locale atual (PT)", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole("button", { name: /idioma/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /idioma/i })).toHaveTextContent("PT");
  });

  it("abre o dropdown ao clicar no botão", () => {
    render(<LanguageSwitcher />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /idioma/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it.each([
    ["Português", "/pt"],
    ["English", "/en"],
    ["Español", "/es"],
  ])("exibe a opção %s no dropdown", (label) => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /idioma/i }));
    expect(screen.getByRole("menuitem", { name: new RegExp(label, "i") })).toBeInTheDocument();
  });

  it("navega para /en ao selecionar English", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /idioma/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /english/i }));
    expect(mockPush).toHaveBeenCalledWith("/en");
  });

  it("navega para /es ao selecionar Español", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /idioma/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /español/i }));
    expect(mockPush).toHaveBeenCalledWith("/es");
  });

  it("fecha o dropdown ao selecionar um idioma", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /idioma/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /english/i }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
