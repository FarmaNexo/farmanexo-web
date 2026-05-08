import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import type { LegalDocumentTypesResponse } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await gatewayFetch<LegalDocumentTypesResponse>("/api/v1/auth/legal/types", {
      cache: "no-store",
    });
    return NextResponse.json(result.datos, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ message: "Error inesperado", code: "ERR_UNKNOWN" }, { status: 500 });
  }
}
