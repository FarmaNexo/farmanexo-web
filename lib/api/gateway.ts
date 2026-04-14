import "server-only";
import { serverEnv } from "@/lib/env";
import { ApiError } from "./errors";
import type { ApiResponse } from "./types";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface GatewayRequestOptions {
  method?: Method;
  body?: unknown;
  accessToken?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
}

/**
 * Llama al api-gateway desde código server-side (Route Handlers, Server Components, Server Actions).
 * Parsea la envoltura ApiResponse<T> y tira ApiError con estado HTTP real.
 *
 * Nunca debe llamarse desde componentes cliente — usar los endpoints BFF en /api/*.
 */
export async function gatewayFetch<T>(
  path: string,
  options: GatewayRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, accessToken, headers = {}, timeoutMs = 10_000, cache, next } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (accessToken) finalHeaders["Authorization"] = `Bearer ${accessToken}`;

  try {
    const res = await fetch(`${serverEnv.API_GATEWAY_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache,
      next,
    });

    const text = await res.text();
    let parsed: ApiResponse<T> | null = null;
    try {
      parsed = text ? (JSON.parse(text) as ApiResponse<T>) : null;
    } catch {
      throw new ApiError(res.status, [], `Respuesta no-JSON del gateway (${res.status})`);
    }

    if (!res.ok || !parsed?.meta?.resultado) {
      throw new ApiError(res.status, parsed?.meta?.mensajes ?? []);
    }

    return parsed;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new ApiError(504, [{ codigo: "ERR_TIMEOUT", mensaje: "Tiempo de espera agotado", tipo: "error" }]);
    }
    throw new ApiError(502, [
      { codigo: "ERR_GATEWAY", mensaje: "No se pudo contactar al servidor", tipo: "error" },
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}
