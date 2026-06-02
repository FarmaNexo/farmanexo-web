import "server-only";
import { gatewayFetch } from "./gateway";
import type { CartResponse, Product } from "./types";

/**
 * Enriquece un CartResponse llamando a catalog-service para resolver
 * product_name por cada product_id único del carrito.
 *
 * WORKAROUND TEMPORAL — K17 (documentado en services/order-service/CLAUDE.md):
 * order-service hoy persiste cart_items.product_name="" porque su
 * add_cart_item_handler no llama a catalog. Mientras se resuelve el bug
 * en backend, el BFF web rellena el nombre al leer para que la UI no
 * muestre "Producto sin nombre".
 *
 * Cuando K17 esté resuelto:
 *   1. Eliminar esta función.
 *   2. Quitar la llamada de app/api/cart/route.ts.
 *   3. Revertir use-cart.ts: mutations vuelven a setQueryData en lugar
 *      de invalidateQueries (un fetch menos por mutación).
 *
 * Costo: 1 fetch a catalog por product_id único en el carrito. Paralelo
 * vía Promise.all. Fallos individuales se toleran (cae al string vacío).
 */
export async function enrichCartWithProductNames(
  cart: CartResponse
): Promise<CartResponse> {
  const uniqueIds = [...new Set(cart.items.map((i) => i.product_id))];
  if (uniqueIds.length === 0) return cart;

  const products = await Promise.all(
    uniqueIds.map((id) =>
      gatewayFetch<Product>(`/api/v1/products/${encodeURIComponent(id)}`, {
        cache: "no-store",
      })
        .then((r) => r.datos)
        .catch(() => null)
    )
  );

  const nameMap = new Map<string, string>();
  for (const p of products) {
    if (p) nameMap.set(p.id, p.name);
  }

  const fill = (currentName: string, productId: string) =>
    currentName || nameMap.get(productId) || "Producto";

  return {
    ...cart,
    items: cart.items.map((i) => ({
      ...i,
      product_name: fill(i.product_name, i.product_id),
    })),
    grouped_by_pharmacy: cart.grouped_by_pharmacy.map((g) => ({
      ...g,
      items: g.items.map((i) => ({
        ...i,
        product_name: fill(i.product_name, i.product_id),
      })),
    })),
  };
}
