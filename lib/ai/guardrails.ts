const MAX_INPUT_LENGTH = 2000;
const LLM_TIMEOUT_MS = 30_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const requestLog = new Map<string, number[]>();

export class RateLimitError extends Error {
  constructor() {
    super("Rate limit excedido");
  }
}

export class ValidationError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class TimeoutError extends Error {
  constructor() {
    super("LLM timeout");
  }
}

const INJECTION_PATTERNS = [
  /ignore (all |previous |prior )?instructions/i,
  /you are now/i,
  /disregard (all |your |the )?/i,
  /act as (a |an |if )?/i,
  /jailbreak/i,
];

export function checkRateLimit(ip: string): void {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    throw new RateLimitError();
  }
  timestamps.push(now);
  requestLog.set(ip, timestamps);
}

export function sanitizeInput(input: string): string {
  if (input.length > MAX_INPUT_LENGTH) {
    throw new ValidationError(`Input excede ${MAX_INPUT_LENGTH} caracteres`);
  }
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      throw new ValidationError("Input inválido");
    }
  }
  return input.trim();
}

export async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new TimeoutError()), LLM_TIMEOUT_MS),
  );
  return Promise.race([promise, timeout]);
}
