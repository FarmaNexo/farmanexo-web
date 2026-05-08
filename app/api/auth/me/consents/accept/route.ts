import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import { withAuth } from "@/lib/auth/session";
import type { AcceptConsentsRequest } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: AcceptConsentsRequest;
  try {
    body = (await req.json()) as AcceptConsentsRequest;
  } catch {
    return NextResponse.json(
      { message: "Cuerpo inválido", code: "ERR_BAD_JSON" },
      { status: 400 }
    );
  }

  // Propagar evidencia legal (IP + UA reales del browser)
  const clientIP =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  const clientUA = req.headers.get("user-agent") ?? "";

  try {
    await withAuth((token) =>
      gatewayFetch<Record<string, never>>("/api/v1/auth/me/consents/accept", {
        method: "POST",
        body,
        accessToken: token,
        cache: "no-store",
        headers: {
          ...(clientIP && { "X-Forwarded-For": clientIP }),
          ...(clientUA && { "User-Agent": clientUA }),
        },
      })
    );

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
