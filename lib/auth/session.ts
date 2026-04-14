import "server-only";
import { cookies } from "next/headers";
import { gatewayFetch } from "@/lib/api/gateway";
import type { LoginResponseDTO } from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "./cookies";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Lee el access token de la cookie (si existe). */
export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value ?? null;
}

/** Lee el refresh token. Solo disponible en route handlers bajo /api/auth por Path restrictivo. */
export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

/** Escribe ambos tokens en cookies httpOnly. */
export async function writeSession(tokens: SessionTokens): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.accessToken, accessCookieOptions(tokens.expiresIn));
  store.set(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions);
}

/** Borra las cookies de sesión. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.set(REFRESH_COOKIE, "", { ...refreshCookieOptions, maxAge: 0 });
}

/**
 * Intenta refrescar la sesión usando la cookie de refresh.
 * Si éxito, escribe las nuevas cookies y devuelve el nuevo access token.
 * Si falla, borra la sesión y devuelve null.
 */
export async function tryRefreshSession(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await gatewayFetch<LoginResponseDTO>("/api/v1/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });

    await writeSession({
      accessToken: response.datos.access_token,
      refreshToken: response.datos.refresh_token,
      expiresIn: response.datos.expires_in,
    });

    return response.datos.access_token;
  } catch {
    await clearSession();
    return null;
  }
}

/**
 * Ejecuta `fn` con el access token actual.
 * Si falla con 401, intenta refrescar y reintenta una vez.
 * Si el refresh falla, lanza ApiError 401.
 */
export async function withAuth<T>(
  fn: (accessToken: string) => Promise<T>
): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    const refreshed = await tryRefreshSession();
    if (!refreshed) {
      throw new ApiError(401, [
        { codigo: "ERR_UNAUTHENTICATED", mensaje: "No autenticado", tipo: "error" },
      ]);
    }
    return fn(refreshed);
  }

  try {
    return await fn(token);
  } catch (err) {
    if (err instanceof ApiError && err.isUnauthorized) {
      const refreshed = await tryRefreshSession();
      if (!refreshed) {
        throw new ApiError(401, [
          { codigo: "ERR_UNAUTHENTICATED", mensaje: "Sesión expirada", tipo: "error" },
        ]);
      }
      return fn(refreshed);
    }
    throw err;
  }
}
