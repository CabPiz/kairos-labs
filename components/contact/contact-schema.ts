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
