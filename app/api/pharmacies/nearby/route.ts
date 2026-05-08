import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import type { NearbyPharmaciesResponse } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await gatewayFetch<NearbyPharmaciesResponse>(
      `/api/v1/pharmacies/nearby`,
      { method: "POST", body, cache: "no-store" }
    );
    return NextResponse.json(result.datos, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ message: "Error inesperado", code: "ERR_UNKNOWN" }, { status: 500 });
  }
}
