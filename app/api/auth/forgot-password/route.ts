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

  const email = (body as { email?: unknown })?.email;
  if (typeof email !== "string" || email.trim() === "") {
    return NextResponse.json(
      { message: "Email requerido", code: "ERR_VALIDATION" },
      { status: 400 }
    );
  }

  try {
    // El backend responde siempre de forma genérica (no revela si el correo existe).
    await gatewayFetch<unknown>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: { email: email.trim().toLowerCase() },
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
