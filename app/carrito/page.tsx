"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/query/keys";
import {
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useIsAuthenticated } from "@/hooks/use-auth";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/lib/api/hooks/use-cart";
import { BffError } from "@/lib/api/client";
import type {
  CartItemResponse,
  PharmacyGroupResponse,
} from "@/lib/api/types";
import { formatPEN as formatPrice } from "@/lib/utils";

export default function CarritoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const { data: cart, isLoading, isError, error } = useCart();
  const clearMutation = useClearCart();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent("/carrito")}`
      );
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
          <CartSkeleton />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isError) {
    const message = (error as BffError | null)?.message ?? "Error desconocido";
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Empty className="border bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingBag className="size-6" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No pudimos cargar tu carrito</EmptyTitle>
              <EmptyDescription>{message}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                onClick={() =>
                  qc.refetchQueries({ queryKey: queryKeys.cart.current })
                }
              >
                Reintentar
              </Button>
            </EmptyContent>
          </Empty>
        </main>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <EmptyCart />
        </main>
      </div>
    );
  }

  const totalUnits = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const pharmacyCount = cart.grouped_by_pharmacy.length;

  const handleClearCart = () => {
    if (
      !window.confirm(
        "¿Vaciar tu carrito? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    clearMutation.mutate(undefined, {
      onSuccess: () => toast.success("Carrito vaciado"),
      onError: (err) =>
        toast.error(err.message || "No se pudo vaciar el carrito"),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <Header />
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="flex items-start justify-between gap-3 mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 min-w-0">
              <ShoppingCart
                className="size-6 sm:size-7 text-brand-pink shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">Mi carrito</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"}
              {" · "}
              {pharmacyCount}{" "}
              {pharmacyCount === 1 ? "farmacia" : "farmacias"}
              {" · Total "}
              <span className="font-semibold text-foreground tabular-nums">
                {formatPrice(cart.total_amount)}
              </span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            disabled={clearMutation.isPending}
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <Trash2 className="size-4 mr-1.5" aria-hidden="true" />
            <span className="hidden sm:inline">Vaciar</span>
          </Button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {cart.grouped_by_pharmacy.map((group) => (
            <PharmacyGroup key={group.pharmacy_id} group={group} />
          ))}
        </div>

        <CheckoutSummary
          totalAmount={cart.total_amount}
          onCheckout={() => router.push("/checkout")}
        />
      </main>
    </div>
  );
}

function PharmacyGroup({ group }: { group: PharmacyGroupResponse }) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-brand-pink transition-shadow hover:shadow-md">
      <div className="p-4 sm:p-5 flex items-center gap-3 bg-gradient-to-r from-brand-lavender/40 via-card to-card">
        <div
          className="flex items-center justify-center size-9 rounded-full bg-brand-pink/10 text-brand-pink shrink-0"
          aria-hidden="true"
        >
          <Store className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold truncate leading-tight">
            {group.pharmacy_name}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {group.items.length}{" "}
            {group.items.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">Subtotal</p>
          <p className="font-semibold tabular-nums">
            {formatPrice(group.subtotal)}
          </p>
        </div>
      </div>
      <Separator />
      <ul className="divide-y">
        {group.items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </ul>
    </Card>
  );
}

function CartItemRow({ item }: { item: CartItemResponse }) {
  const updateMutation = useUpdateCartItem(item.id);
  const removeMutation = useRemoveCartItem();

  const handleIncrement = () => {
    updateMutation.mutate(
      { quantity: item.quantity + 1 },
      {
        onError: (err) =>
          toast.error(err.message || "No se pudo actualizar la cantidad"),
      }
    );
  };

  const handleDecrement = () => {
    if (item.quantity <= 1) return;
    updateMutation.mutate(
      { quantity: item.quantity - 1 },
      {
        onError: (err) =>
          toast.error(err.message || "No se pudo actualizar la cantidad"),
      }
    );
  };

  const handleRemove = () => {
    removeMutation.mutate(
      { itemId: item.id },
      {
        onSuccess: () => toast.success("Producto eliminado del carrito"),
        onError: (err) =>
          toast.error(err.message || "No se pudo eliminar el producto"),
      }
    );
  };

  const isPending = updateMutation.isPending || removeMutation.isPending;

  return (
    <li className="p-4 sm:p-5">
      {/* Mobile: 2-row layout. Desktop (>=sm): 1 row. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <p className="font-medium leading-snug line-clamp-2">
              {item.product_name || "Producto"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 tabular-nums">
              {formatPrice(item.unit_price)} c/u
            </p>
          </div>
          {/* Trash visible top-right on mobile for fast removal */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden size-8 text-muted-foreground hover:text-destructive shrink-0 -mr-1"
            onClick={handleRemove}
            disabled={isPending}
            aria-label="Eliminar producto"
          >
            {removeMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 sm:gap-4 sm:shrink-0">
          <div
            className="flex items-center rounded-md border bg-muted/30"
            role="group"
            aria-label="Cantidad"
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-r-none hover:bg-muted"
              onClick={handleDecrement}
              disabled={item.quantity <= 1 || isPending}
              aria-label="Disminuir cantidad"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </Button>
            <span
              className="min-w-8 text-center text-sm font-semibold tabular-nums px-1"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-l-none hover:bg-muted"
              onClick={handleIncrement}
              disabled={isPending}
              aria-label="Aumentar cantidad"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </Button>
          </div>

          <div className="min-w-20 text-right">
            <p className="font-semibold tabular-nums">
              {formatPrice(item.subtotal)}
            </p>
          </div>

          {/* Trash hidden on mobile (already shown top-right above) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex size-8 text-muted-foreground hover:text-destructive shrink-0"
            onClick={handleRemove}
            disabled={isPending}
            aria-label="Eliminar producto"
          >
            {removeMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </li>
  );
}

function CheckoutSummary({
  totalAmount,
  onCheckout,
}: {
  totalAmount: number;
  onCheckout: () => void;
}) {
  return (
    <>
      {/* Desktop: card normal flow */}
      <Card className="hidden md:block mt-8 p-6 shadow-lg border-brand-teal/20 bg-gradient-to-br from-card via-card to-brand-teal/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total a pagar</p>
            <p className="text-3xl font-bold text-foreground tabular-nums mt-0.5">
              {formatPrice(totalAmount)}
            </p>
          </div>
          <Button
            size="lg"
            onClick={onCheckout}
            className="bg-brand-pink hover:bg-brand-pink-dark text-white shadow-md"
          >
            Proceder al checkout
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Cada farmacia procesa tu pedido por separado.
        </p>
      </Card>

      {/* Mobile: sticky bottom action bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/75">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 max-w-4xl">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground leading-none">
              Total
            </p>
            <p className="text-lg font-bold tabular-nums leading-tight">
              {formatPrice(totalAmount)}
            </p>
          </div>
          <Button
            size="lg"
            onClick={onCheckout}
            className="bg-brand-pink hover:bg-brand-pink-dark text-white shrink-0"
          >
            Checkout
          </Button>
        </div>
      </div>
    </>
  );
}

function EmptyCart() {
  return (
    <Empty className="border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-brand-pink/10 text-brand-pink">
          <ShoppingCart className="size-6" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Tu carrito está vacío</EmptyTitle>
        <EmptyDescription>
          Explora el catálogo y agrega medicamentos de tu farmacia preferida.
          Compara precios entre farmacias antes de comprar.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild className="bg-brand-pink hover:bg-brand-pink-dark text-white">
          <Link href="/catalogo">Ver catálogo</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function CartSkeleton() {
  return (
    <>
      {/* Heading area */}
      <div className="mb-6 sm:mb-8 space-y-2">
        <Skeleton className="h-8 sm:h-9 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Two pharmacy groups */}
      <div className="space-y-4 sm:space-y-6">
        {[0, 1].map((i) => (
          <Card key={i} className="overflow-hidden border-l-4 border-l-brand-pink/30">
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="space-y-1.5 text-right">
                <Skeleton className="h-3 w-12 ml-auto" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            </div>
            <Separator />
            <div className="divide-y">
              {[0, 1].map((j) => (
                <div key={j} className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-24 hidden sm:block" />
                  <Skeleton className="h-5 w-16 hidden sm:block" />
                  <Skeleton className="size-8 rounded-md hidden sm:block" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Total card */}
      <Skeleton className="mt-8 h-28 w-full rounded-xl hidden md:block" />
    </>
  );
}
