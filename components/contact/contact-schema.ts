export const PROJECT_TYPES = [
  "Desenvolvimento Web",
  "IA & Automação",
  "Consultoria Técnica",
  "Outro",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

/**
 * Valida o formato de e-mail sem regex.
 * Usa `indexOf` intencionalmente: regex com `[^\s@]+` gera risco de
 * backtracking superlinear (Sonar S8786). A lógica checa apenas que
 * existe um `@` não no início e um `.` após o `@`.
 *
 * @param val - String a validar
 * @returns `true` se o formato for válido
 */
export function isValidEmail(val: string): boolean {
  const at = val.indexOf("@");
  return at > 0 && val.indexOf(".", at) > at + 1;
}

/**
 * Valida número de telefone/WhatsApp: apenas dígitos, mínimo 10, máximo 15.
 * Aceita string vazia (campo opcional).
 *
 * @param val - String a validar
 * @returns `true` se válido ou vazio
 */
export function isValidPhone(val: string): boolean {
  if (!val || val.trim() === "") return true;
  const digits = val.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
