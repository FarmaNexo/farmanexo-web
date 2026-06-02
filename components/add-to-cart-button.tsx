"use client";

import { useRouter, usePathname } from "next/navigation";
import { Loader2, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAddToCart } from "@/lib/api/hooks/use-cart";
import { BffError } from "@/lib/api/client";

interface AddToCartButtonProps {
  productId: string;
  pharmacyId: string;
  stock: number;
  /**
   * Cuando true: variante chica para insertar dentro de una card del
   * ranking en /medicamento/[slug]. Default false para usos generales.
   */
  compact?: boolean;
}

/**
 * CTA "Agregar al carrito" siempre visible. La auth se chequea en el click
 * — si no hay sesión activa, mostramos toast con CTA a /login.
 *
 * Cantidad fija = 1 desde este botón. Ajustes de cantidad ocurren en
 * /carrito con stepper. Re-agregar el mismo (product, pharmacy) hace
 * UPSERT en backend e incrementa quantity.
 */
export function AddToCartButton({
  productId,
  pharmacyId,
  stock,
  compact = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate, isPending } = useAddToCart();

  const outOfStock = stock <= 0;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // El botón es hijo de un <Link> en el ranking — sin esto, el click
    // navegaría a /farmacias/{slug} antes de disparar la mutación.
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock || isPending) return;

    mutate(
      { product_id: productId, pharmacy_id: pharmacyId, quantity: 1 },
      {
        onSuccess: (data) => {
          const isIncrement = data.items.some(
            (i) =>
              i.product_id === productId &&
              i.pharmacy_id === pharmacyId &&
              i.quantity > 1
          );
          toast.success(
            isIncrement ? "Cantidad actualizada en el carrito" : "Agregado al carrito",
            {
              action: {
                label: "Ver carrito",
                onClick: () => router.push("/carrito"),
              },
            }
          );
        },
        onError: (err: BffError) => {
          if (err.status === 401) {
            toast.error("Inicia sesión para comprar", {
              action: {
                label: "Iniciar sesión",
                onClick: () =>
                  router.push(`/login?redirect=${encodeURIComponent(pathname)}`),
              },
            });
            return;
          }
          if (err.status === 502 || err.status === 504) {
            toast.error("Sin conexión. Reintenta en un momento.");
            return;
          }
          toast.error(err.message || "No se pudo agregar al carrito");
        },
      }
    );
  };

  if (outOfStock) {
    return (
      <Button
        size={compact ? "sm" : "default"}
        variant="outline"
        disabled
        aria-label="Sin stock disponible"
      >
        Sin stock
      </Button>
    );
  }

  return (
    <Button
      size={compact ? "sm" : "default"}
      onClick={handleClick}
      disabled={isPending}
      aria-label="Agregar al carrito"
      className="bg-brand-pink hover:bg-brand-pink-dark text-white shadow-sm transition-all active:scale-[0.97]"
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 mr-1.5 animate-spin" aria-hidden="true" />
          Agregando…
        </>
      ) : (
        <>
          {compact ? (
            <Plus className="size-4 mr-1" aria-hidden="true" />
          ) : (
            <ShoppingCart className="size-4 mr-1.5" aria-hidden="true" />
          )}
          Agregar
        </>
      )}
    </Button>
  );
}
