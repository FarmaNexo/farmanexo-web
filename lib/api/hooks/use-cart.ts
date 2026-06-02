"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bffFetch, BffError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useIsAuthenticated } from "@/hooks/use-auth";
import type {
  AddCartItemRequest,
  CartResponse,
  UpdateCartItemRequest,
} from "@/lib/api/types";

/**
 * Query del carrito actual. Auto-disabled si no hay sesión — evita un 401
 * en cada page load del usuario anónimo.
 */
export function useCart() {
  const { isAuthenticated } = useIsAuthenticated();

  return useQuery<CartResponse, BffError>({
    queryKey: queryKeys.cart.current,
    queryFn: ({ signal }) => bffFetch<CartResponse>("/api/cart", { signal }),
    enabled: isAuthenticated,
    retry: false,
  });
}

/**
 * Mutation para agregar un item al carrito. El backend hace UPSERT por
 * (user_id, product_id, pharmacy_id) — si ya existe incrementa quantity.
 * Devuelve el CartResponse completo, lo seteamos en cache sin re-fetch.
 */
export function useAddToCart() {
  const qc = useQueryClient();

  return useMutation<CartResponse, BffError, AddCartItemRequest>({
    mutationFn: (input) =>
      bffFetch<CartResponse>("/api/cart/items", {
        method: "POST",
        body: input,
      }),
    onSuccess: (cart) => {
      qc.setQueryData(queryKeys.cart.current, cart);
    },
  });
}

export function useUpdateCartItem(itemId: string) {
  const qc = useQueryClient();

  return useMutation<CartResponse, BffError, UpdateCartItemRequest>({
    mutationFn: (input) =>
      bffFetch<CartResponse>(`/api/cart/items/${encodeURIComponent(itemId)}`, {
        method: "PUT",
        body: input,
      }),
    onSuccess: (cart) => {
      qc.setQueryData(queryKeys.cart.current, cart);
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();

  return useMutation<CartResponse, BffError, { itemId: string }>({
    mutationFn: ({ itemId }) =>
      bffFetch<CartResponse>(`/api/cart/items/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      }),
    onSuccess: (cart) => {
      qc.setQueryData(queryKeys.cart.current, cart);
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();

  return useMutation<{ ok: true }, BffError, void>({
    mutationFn: () =>
      bffFetch<{ ok: true }>("/api/cart", { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart.current });
    },
  });
}
