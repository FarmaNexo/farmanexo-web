"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { bffFetch, BffError } from "@/lib/api/client";
import type { ProfileResponseDTO } from "@/lib/api/types";
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

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<void, BffError, LoginInput>({
    mutationFn: (input) =>
      bffFetch<void>("/api/auth/login", { method: "POST", body: input }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      router.push("/");
    },
  });
}

export function useRegister() {
  return useMutation<{ email: string; message: string }, BffError, RegisterInput>({
    mutationFn: (input) =>
      bffFetch("/api/auth/register", { method: "POST", body: input }),
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
