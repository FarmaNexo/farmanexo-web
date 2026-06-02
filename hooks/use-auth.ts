"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { bffFetch, BffError } from "@/lib/api/client";
import type {
  AcceptConsentsRequest,
  ConsentsListResponse,
  ConsentsStatusResponse,
  ProfileResponseDTO,
  UpdateProfileRequest,
} from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import type { LoginInput, RegisterInput } from "@/lib/auth/schemas";

export function useMe() {
  return useQuery<ProfileResponseDTO, BffError>({
    queryKey: queryKeys.auth.me,
    queryFn: ({ signal }) => bffFetch<ProfileResponseDTO>("/api/auth/me", { signal }),
    retry: false,
  });
}

export function useIsAuthenticated() {
  const { data, isLoading, isError } = useMe();
  return {
    isAuthenticated: !!data && !isError,
    isLoading,
    user: data ?? null,
  };
}

/**
 * Devuelve el destino seguro tras login: lee `?redirect=` del URL actual.
 * Solo permite rutas internas (que empiecen con "/" y no con "//" para evitar
 * redirect open). Cae a "/" si no hay redirect o es inválido.
 */
function getSafeRedirect(): string {
  if (typeof window === "undefined") return "/";
  const param = new URLSearchParams(window.location.search).get("redirect");
  if (!param) return "/";
  if (!param.startsWith("/") || param.startsWith("//")) return "/";
  return param;
}

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<void, BffError, LoginInput>({
    mutationFn: (input) =>
      bffFetch<void>("/api/auth/login", { method: "POST", body: input }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      router.push(getSafeRedirect());
    },
  });
}

export function useRegister() {
  return useMutation<{ email: string; message: string }, BffError, RegisterInput>({
    mutationFn: (input) =>
      bffFetch("/api/auth/register", { method: "POST", body: input }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<ProfileResponseDTO, BffError, UpdateProfileRequest>({
    mutationFn: (input) =>
      bffFetch<ProfileResponseDTO>("/api/auth/me", { method: "PUT", body: input }),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.auth.me, data);
    },
  });
}

export function useMyConsents() {
  return useQuery<ConsentsListResponse, BffError>({
    queryKey: queryKeys.auth.consents,
    queryFn: () => bffFetch<ConsentsListResponse>("/api/auth/me/consents"),
    staleTime: 60 * 1000,
  });
}

export function useConsentsStatus(enabled: boolean) {
  return useQuery<ConsentsStatusResponse, BffError>({
    queryKey: queryKeys.auth.consentsStatus,
    queryFn: () => bffFetch<ConsentsStatusResponse>("/api/auth/me/consents/status"),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useAcceptPendingConsents() {
  const qc = useQueryClient();
  return useMutation<void, BffError, AcceptConsentsRequest>({
    mutationFn: (input) =>
      bffFetch<void>("/api/auth/me/consents/accept", {
        method: "POST",
        body: input,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.auth.consentsStatus });
      await qc.invalidateQueries({ queryKey: queryKeys.auth.consents });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<void, BffError, void>({
    mutationFn: () => bffFetch<void>("/api/auth/me", { method: "DELETE" }),
    onSuccess: () => {
      qc.setQueryData(queryKeys.auth.me, null);
      qc.clear();
      router.push("/?account_deleted=1");
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<void, BffError, void>({
    mutationFn: () => bffFetch<void>("/api/auth/logout", { method: "POST" }),
    onSettled: async () => {
      qc.setQueryData(queryKeys.auth.me, null);
      await qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      router.push("/login");
    },
  });
}
