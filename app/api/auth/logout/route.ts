import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import { clearSession, getAccessToken, getRefreshToken } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  // Intentamos revocar en el backend, pero incluso si falla limpiamos cookies localmente.
  if (accessToken && refreshToken) {
    try {
      await gatewayFetch<Record<string, never>>("/api/v1/auth/logout", {
        method: "POST",
        accessToken,
        body: { refresh_token: refreshToken },
      });
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      // logout fallido no debería impedir limpiar la sesión local
    }
  }

  await clearSession();
  return NextResponse.json({ ok: true }, { status: 200 });
}
