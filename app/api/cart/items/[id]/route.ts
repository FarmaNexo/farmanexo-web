import { NextRequest, NextResponse } from "next/server";
import { gatewayFetch } from "@/lib/api/gateway";
import { ApiError } from "@/lib/api/errors";
import { withAuth } from "@/lib/auth/session";
import type { CartResponse, UpdateCartItemRequest } from "@/lib/api/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: UpdateCartItemRequest;
  try {
    body = (await req.json()) as UpdateCartItemRequest;
  } catch {
    return NextResponse.json(
      { message: "Cuerpo de solicitud inválido", code: "ERR_BAD_JSON" },
      { status: 400 }
    );
  }

  if (!body.quantity || body.quantity < 1) {
    return NextResponse.json(
      { message: "quantity debe ser mayor a 0", code: "ERR_VALIDATION" },
      { status: 400 }
    );
  }

  try {
    const cart = await withAuth((token) =>
      gatewayFetch<CartResponse>(`/api/v1/cart/items/${encodeURIComponent(id)}`, {
        method: "PUT",
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cart = await withAuth((token) =>
      gatewayFetch<CartResponse>(`/api/v1/cart/items/${encodeURIComponent(id)}`, {
        method: "DELETE",
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
