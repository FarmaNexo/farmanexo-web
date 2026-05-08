import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import type { Product } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const result = await gatewayFetch<Product>(
      `/api/v1/products/slug/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    return NextResponse.json(result.datos, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ message: "Error inesperado", code: "ERR_UNKNOWN" }, { status: 500 });
  }
}
