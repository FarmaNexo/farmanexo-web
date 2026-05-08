"use client";

import { useQuery } from "@tanstack/react-query";
import { bffFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  LegalDocument,
  LegalDocumentTypesResponse,
  LegalDocumentVersionsResponse,
} from "@/lib/api/types";

export function useLegalTypes() {
  return useQuery({
    queryKey: queryKeys.legal.types,
    queryFn: () => bffFetch<LegalDocumentTypesResponse>("/api/legal/types"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrentLegalDocument(typeCode: string | undefined, locale?: string) {
  return useQuery({
    queryKey: queryKeys.legal.current(typeCode ?? "", locale),
    queryFn: () => {
      const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
      return bffFetch<LegalDocument>(`/api/legal/${encodeURIComponent(typeCode!)}${qs}`);
    },
    enabled: !!typeCode,
    staleTime: 60 * 1000,
  });
}

export function useLegalDocumentByVersion(
  typeCode: string | undefined,
  version: string | undefined,
  locale?: string
) {
  return useQuery({
    queryKey: queryKeys.legal.version(typeCode ?? "", version ?? "", locale),
    queryFn: () => {
      const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
      return bffFetch<LegalDocument>(
        `/api/legal/${encodeURIComponent(typeCode!)}/versions/${encodeURIComponent(version!)}${qs}`
      );
    },
    enabled: !!typeCode && !!version,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLegalDocumentVersions(typeCode: string | undefined, locale?: string) {
  return useQuery({
    queryKey: queryKeys.legal.versions(typeCode ?? "", locale),
    queryFn: () => {
      const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
      return bffFetch<LegalDocumentVersionsResponse>(
        `/api/legal/${encodeURIComponent(typeCode!)}/versions${qs}`
      );
    },
    enabled: !!typeCode,
    staleTime: 5 * 60 * 1000,
  });
}
