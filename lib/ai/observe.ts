/**
 * Stub de observabilidade para chamadas ao LLM.
 * Implementação completa (gravação em `agent_runs`) será adicionada na issue #132.
 */
export async function tracedLLMCall<T>(
  _label: string,
  fn: () => Promise<T>,
): Promise<T> {
  return fn();
}
