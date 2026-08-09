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

  it("navega ao pressionar Enter no menuitem", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /idioma/i }));
    fireEvent.keyDown(screen.getByRole("menuitem", { name: /english/i }), { key: "Enter" });
    expect(mockPush).toHaveBeenCalledWith("/en");
  });

  it("navega ao pressionar Space no menuitem", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /idioma/i }));
    fireEvent.keyDown(screen.getByRole("menuitem", { name: /español/i }), { key: " " });
    expect(mockPush).toHaveBeenCalledWith("/es");
  });

  it("fecha o dropdown ao clicar fora (mousedown fora do container)", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /idioma/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("aplica hover style no botão (onMouseOver / onMouseOut)", () => {
    render(<LanguageSwitcher />);
    const btn = screen.getByRole("button", { name: /idioma/i });
    fireEvent.mouseOver(btn);
    fireEvent.mouseOut(btn);
    // Apenas verifica que não lança erro
    expect(btn).toBeInTheDocument();
  });

  it("aplica focus style no botão (onFocus / onBlur)", () => {
    render(<LanguageSwitcher />);
    const btn = screen.getByRole("button", { name: /idioma/i });
    fireEvent.focus(btn);
    fireEvent.blur(btn);
    expect(btn).toBeInTheDocument();
  });});
