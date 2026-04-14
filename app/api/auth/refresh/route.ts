import { NextResponse } from "next/server";
import { tryRefreshSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint interno para forzar un refresh explícito.
 * No se expone al usuario directamente — lo usa el cliente cuando detecta 401.
 */
export async function POST() {
  const newToken = await tryRefreshSession();
  if (!newToken) {
    return NextResponse.json(
      { message: "Sesión expirada", code: "ERR_SESSION_EXPIRED" },
      { status: 401 }
    );
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
