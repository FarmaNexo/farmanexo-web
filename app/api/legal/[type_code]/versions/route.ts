import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import type { LegalDocumentVersionsResponse } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type_code: string }> }
) {
  try {
    const { type_code } = await params;
    const locale = req.nextUrl.searchParams.get("locale");
    const path = `/api/v1/auth/legal/${encodeURIComponent(type_code)}/versions${locale ? `?locale=${encodeURIComponent(locale)}` : ""}`;
    const result = await gatewayFetch<LegalDocumentVersionsResponse>(path, { cache: "no-store" });
    return NextResponse.json(result.datos, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ message: "Error inesperado", code: "ERR_UNKNOWN" }, { status: 500 });
  }
}
