"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useIsAuthenticated } from "@/hooks/use-auth";

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useIsAuthenticated();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
}

export function AuthenticatedOnly({ children, fallback }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useIsAuthenticated();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
}

export function useRequireAuth() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useIsAuthenticated();

    const requireAuth = (callback: () => void) => {
        if (isLoading) return;
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        callback();
    };

    return { isAuthenticated, isLoading, requireAuth };
}
