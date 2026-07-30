import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Cuerpo de solicitud inválido", code: "ERR_BAD_JSON" },
      { status: 400 }
    );
  }

  const b = body as { token?: unknown; new_password?: unknown };
  if (typeof b.token !== "string" || b.token.trim() === "") {
    return NextResponse.json(
      { message: "Token requerido", code: "ERR_VALIDATION" },
      { status: 400 }
    );
  }
  if (typeof b.new_password !== "string" || b.new_password.length < 8) {
    return NextResponse.json(
      { message: "La contraseña debe tener al menos 8 caracteres", code: "ERR_VALIDATION" },
      { status: 400 }
    );
  }

  try {
    await gatewayFetch<unknown>("/api/v1/auth/reset-password", {
      method: "POST",
      body: { token: b.token, new_password: b.new_password },
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { message: err.message, code: err.code },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { message: "Error inesperado", code: "ERR_UNKNOWN" },
      { status: 500 }
    );
  }
}
