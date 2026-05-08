import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import { registerSchema } from "@/lib/auth/schemas";
import type { RegisterResponseDTO } from "@/lib/api/types";

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

  const parsed = registerSchema.safeParse(body);
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

  const payload = {
    email: parsed.data.email,
    password: parsed.data.password,
    full_name: parsed.data.full_name,
    phone: parsed.data.phone === "" ? undefined : parsed.data.phone,
    accepted_terms: parsed.data.accepted_terms,
    accepted_privacy: parsed.data.accepted_privacy,
    marketing_opt_in: parsed.data.marketing_opt_in,
  };

  // Propagar evidencia legal al gateway para registrar el consent con la IP/UA real del browser
  // (sin esto, el gateway vería la IP del BFF Next.js y el UA de Node).
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";
  const clientUA = request.headers.get("user-agent") ?? "";

  try {
    const response = await gatewayFetch<RegisterResponseDTO>("/api/v1/auth/register", {
      method: "POST",
      body: payload,
      headers: {
        ...(clientIP && { "X-Forwarded-For": clientIP }),
        ...(clientUA && { "User-Agent": clientUA }),
      },
    });

    return NextResponse.json(
      { ok: true, email: response.datos.email, message: response.datos.message },
      { status: 201 }
    );
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
