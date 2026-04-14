import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import { writeSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/schemas";
import type { LoginResponseDTO } from "@/lib/api/types";

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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Datos inválidos",
        code: "ERR_VALIDATION",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const response = await gatewayFetch<LoginResponseDTO>("/api/v1/auth/login", {
      method: "POST",
      body: parsed.data,
    });

    await writeSession({
      accessToken: response.datos.access_token,
      refreshToken: response.datos.refresh_token,
      expiresIn: response.datos.expires_in,
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
