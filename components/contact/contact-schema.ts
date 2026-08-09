export const PROJECT_TYPES = [
  "Desenvolvimento Web",
  "IA & Automação",
  "Consultoria Técnica",
  "Outro",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export function isValidEmail(val: string): boolean {
  const at = val.indexOf("@");
  return at > 0 && val.indexOf(".", at) > at + 1;
}
