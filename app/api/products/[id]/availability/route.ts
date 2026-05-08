import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import type { ProductAvailabilityResponse } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    // HU-014: pasar lat/lng/radius_km al gateway si vienen en la URL.
    // Validamos solo presencia/forma básica; el backend valida rangos finales.
    const incoming = new URL(req.url).searchParams;
    const forwarded = new URLSearchParams();
    const lat = incoming.get("lat");
    const lng = incoming.get("lng");
    if (lat && lng) {
      forwarded.set("lat", lat);
      forwarded.set("lng", lng);
      const radius = incoming.get("radius_km");
      if (radius) forwarded.set("radius_km", radius);
    }
    const qs = forwarded.toString();
    const path = `/api/v1/products/${encodeURIComponent(id)}/availability${qs ? `?${qs}` : ""}`;

    const result = await gatewayFetch<ProductAvailabilityResponse>(path, {
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
