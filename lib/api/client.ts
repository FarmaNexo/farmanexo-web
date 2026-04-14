/**
 * Cliente HTTP para llamar a los Route Handlers BFF de Next.js desde el browser.
 * NO llama al gateway directamente (eso es responsabilidad del servidor).
 */

export class BffError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string[] | undefined>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string[] | undefined>) {
    super(message);
    this.name = "BffError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

interface BffRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function bffFetch<T>(path: string, options: BffRequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;

  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    signal,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const payload = (data ?? {}) as {
      message?: string;
      code?: string;
      fields?: Record<string, string[] | undefined>;
    };
    throw new BffError(
      res.status,
      payload.code ?? "ERR_UNKNOWN",
      payload.message ?? `Error ${res.status}`,
      payload.fields
    );
  }

  return data as T;
}
