import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import type { ProductAlternativesResponse } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * BFF route — alternativas terapéuticas para un producto (HU-015).
 *
 * Proxyea a `/api/v1/prices/products/{id}/alternatives` del api-gateway.
 * El endpoint downstream computa en tiempo real consultando catalog (DCI) y pharmacy (avg price)
 * y cachea por 30 minutos.
 *
 * Disclaimer regulatorio: la sugerencia de alternativas con la misma DCI es informativa.
 * El usuario debe consultar con su Q.F. antes de cambiar marca o presentación.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const limit = req.nextUrl.searchParams.get("limit");
    const qs = limit ? `?limit=${encodeURIComponent(limit)}` : "";
    const path = `/api/v1/prices/products/${encodeURIComponent(id)}/alternatives${qs}`;
    const result = await gatewayFetch<ProductAlternativesResponse>(path, { cache: "no-store" });
    return NextResponse.json(result.datos, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ message: "Error inesperado", code: "ERR_UNKNOWN" }, { status: 500 });
  }
}
