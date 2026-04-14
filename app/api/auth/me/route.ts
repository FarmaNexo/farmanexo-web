import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import { withAuth } from "@/lib/auth/session";
import type { ProfileResponseDTO } from "@/lib/api/types";

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
