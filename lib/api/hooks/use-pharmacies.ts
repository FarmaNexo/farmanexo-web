"use client";

import { useQuery } from "@tanstack/react-query";
import { bffFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  NearbyPharmaciesResponse,
  NearbyRequest,
  PaginatedPharmacies,
  Pharmacy,
  PharmacyInventoryResponse,
} from "@/lib/api/types";

export function usePharmacies(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.pharmacies.list(page, limit),
    queryFn: () => bffFetch<PaginatedPharmacies>(`/api/pharmacies?page=${page}&limit=${limit}`),
  });
}

export function usePharmacy(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pharmacies.detail(id ?? ""),
    queryFn: () => bffFetch<Pharmacy>(`/api/pharmacies/${encodeURIComponent(id!)}`),
    enabled: !!id,
  });
}

export function usePharmacyBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pharmacies.detailBySlug(slug ?? ""),
    queryFn: () => bffFetch<Pharmacy>(`/api/pharmacies/slug/${encodeURIComponent(slug!)}`),
    enabled: !!slug,
  });
}

export function usePharmacyInventory(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pharmacies.inventory(id ?? ""),
    queryFn: () =>
      bffFetch<PharmacyInventoryResponse>(
        `/api/pharmacies/${encodeURIComponent(id!)}/inventory`
      ),
    enabled: !!id,
  });
}

export function usePharmacyNearby(body: NearbyRequest | null) {
  return useQuery({
    queryKey: queryKeys.pharmacies.nearby(
      body?.latitude ?? 0,
      body?.longitude ?? 0,
      body?.radius_km ?? 0
    ),
    queryFn: () =>
      bffFetch<NearbyPharmaciesResponse>(`/api/pharmacies/nearby`, {
        method: "POST",
        body,
      }),
    enabled: !!body,
    staleTime: 30 * 1000,
  });
}
