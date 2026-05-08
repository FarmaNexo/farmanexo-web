import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import { clearSession, withAuth } from "@/lib/auth/session";
import type { ProfileResponseDTO, UpdateProfileRequest } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await withAuth((token) =>
      gatewayFetch<ProfileResponseDTO>("/api/v1/users/me", {
        accessToken: token,
        cache: "no-store",
      }).then((r) => r.datos)
    );

    return NextResponse.json(profile, { status: 200 });
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

export async function DELETE() {
  try {
    await withAuth((token) =>
      gatewayFetch<Record<string, never>>("/api/v1/auth/me", {
        method: "DELETE",
        accessToken: token,
        cache: "no-store",
      })
    );

    // Cuenta eliminada en el gateway → borrar cookies de sesión del cliente
    await clearSession();

    return NextResponse.json(
      { ok: true, message: "Cuenta eliminada" },
      { status: 200 }
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

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as UpdateProfileRequest;

    const profile = await withAuth((token) =>
      gatewayFetch<ProfileResponseDTO>("/api/v1/users/me", {
        method: "PUT",
        body,
        accessToken: token,
        cache: "no-store",
      }).then((r) => r.datos)
    );

    return NextResponse.json(profile, { status: 200 });
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
