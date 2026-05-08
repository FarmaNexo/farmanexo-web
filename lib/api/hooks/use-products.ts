"use client";

import { useQuery } from "@tanstack/react-query";
import { bffFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  PaginatedProducts,
  Product,
  ProductAlternativesResponse,
  ProductAvailabilityResponse,
  SearchProductsRequest,
} from "@/lib/api/types";

export function useProducts(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.products.list(page, limit),
    queryFn: () => bffFetch<PaginatedProducts>(`/api/products?page=${page}&limit=${limit}`),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ""),
    queryFn: () => bffFetch<Product>(`/api/products/${encodeURIComponent(id!)}`),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detailBySlug(slug ?? ""),
    queryFn: () => bffFetch<Product>(`/api/products/slug/${encodeURIComponent(slug!)}`),
    enabled: !!slug,
  });
}

/**
 * HU-014 — Comparador con distancia opcional.
 * Sin geo: orden por precio (comportamiento HU-013, retrocompatible).
 * Con geo: el backend devuelve distance_km y ordena por cercanía,
 * filtrando opcionalmente por radio (1–100 km).
 */
export function useProductAvailability(
  id: string | undefined,
  geo?: { lat: number; lng: number; radiusKm?: number }
) {
  const url = (() => {
    const base = `/api/products/${encodeURIComponent(id!)}/availability`;
    if (!geo) return base;
    const params = new URLSearchParams({
      lat: geo.lat.toString(),
      lng: geo.lng.toString(),
    });
    if (geo.radiusKm) params.set("radius_km", geo.radiusKm.toString());
    return `${base}?${params.toString()}`;
  })();

  return useQuery({
    queryKey: queryKeys.products.availability(id ?? "", geo),
    queryFn: () => bffFetch<ProductAvailabilityResponse>(url),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useSearchProducts(body: SearchProductsRequest, enabled = true) {
  return useQuery({
    queryKey: queryKeys.products.search(body),
    queryFn: () =>
      bffFetch<PaginatedProducts>(`/api/products/search`, { method: "POST", body }),
    enabled,
  });
}

/**
 * HU-015 — Alternativas terapéuticas (mismo principio activo / DCI).
 * El backend computa precio promedio en tiempo real y devuelve ordenado por mayor ahorro.
 * Aviso regulatorio: la sustitución debe ser consultada con un Q.F. — UI debe mostrarlo.
 */
export function useProductAlternatives(id: string | undefined, limit = 6) {
  return useQuery({
    queryKey: queryKeys.prices.alternatives(id ?? "", limit),
    queryFn: () =>
      bffFetch<ProductAlternativesResponse>(
        `/api/products/${encodeURIComponent(id!)}/alternatives?limit=${limit}`
      ),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
