import "server-only";
import { isProd } from "@/lib/env";

export const ACCESS_COOKIE = "fn_access";
export const REFRESH_COOKIE = "fn_refresh";

const baseOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
} as const;

/**
 * Opciones para la cookie de access token.
 * Duración: usamos `expires_in` del backend; aquí solo ponemos límite superior defensivo (15 min).
 */
export const accessCookieOptions = (maxAgeSeconds: number) => ({
  ...baseOptions,
  maxAge: Math.min(maxAgeSeconds, 60 * 15),
});

/**
 * Opciones para la cookie de refresh token.
 * Path restringido a /api/auth — el resto de la app nunca la recibe (principio de mínimo privilegio).
 */
export const refreshCookieOptions = {
  ...baseOptions,
  path: "/api/auth",
  maxAge: 60 * 60 * 24 * 7,
} as const;
