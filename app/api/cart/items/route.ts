import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import { withAuth } from "@/lib/auth/session";
import type { AddCartItemRequest, CartResponse } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: AddCartItemRequest;
  try {
    body = (await req.json()) as AddCartItemRequest;
  } catch {
    return NextResponse.json(
      { message: "Cuerpo de solicitud inválido", code: "ERR_BAD_JSON" },
      { status: 400 }
    );
  }

  if (
    !body.product_id ||
    !body.pharmacy_id ||
    typeof body.quantity !== "number" ||
    !Number.isInteger(body.quantity) ||
    body.quantity < 1
  ) {
    return NextResponse.json(
      {
        message:
          "product_id y pharmacy_id son requeridos; quantity debe ser un entero ≥ 1",
        code: "ERR_VALIDATION",
      },
      { status: 400 }
    );
  }

  try {
    const cart = await withAuth((token) =>
      gatewayFetch<CartResponse>("/api/v1/cart/items", {
        method: "POST",
        body,
        accessToken: token,
        cache: "no-store",
      }).then((r) => r.datos)
    );
    return NextResponse.json(cart, { status: 200 });
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
