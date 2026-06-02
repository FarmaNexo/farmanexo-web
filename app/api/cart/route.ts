import { NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import { withAuth } from "@/lib/auth/session";
import { enrichCartWithProductNames } from "@/lib/api/cart-enrichment";
import type { CartResponse } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cart = await withAuth((token) =>
      gatewayFetch<CartResponse>("/api/v1/cart", {
        accessToken: token,
        cache: "no-store",
      }).then((r) => r.datos)
    );
    const enriched = await enrichCartWithProductNames(cart);
    return NextResponse.json(enriched, { status: 200 });
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
      gatewayFetch<Record<string, never>>("/api/v1/cart", {
        method: "DELETE",
        accessToken: token,
        cache: "no-store",
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
