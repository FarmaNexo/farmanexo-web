"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Beaker, Info, Sparkles } from "lucide-react";
import { useProductAlternatives } from "@/lib/api/hooks/use-products";
import { formatPEN as formatPrice } from "@/lib/utils";

interface Props {
  /** ID del producto base (UUID). Si está undefined, no carga nada. */
  productId: string | undefined;
  /** Cuántas alternativas mostrar como máximo (default 6). */
  limit?: number;
}

/**
 * HU-015 — Banner de alternativas terapéuticas (mismo principio activo / DCI).
 *
 * Cumple criterios de aceptación:
 *  - Banner visible solo si existen alternativas con precio.
 *  - Muestra DCI, fabricante (laboratorio), % de ahorro vs producto base.
 *  - Disclaimer claro que la sustitución debe consultarse con un Q.F.
 *  - No induce a la automedicación: no hay botón de "comprar", solo "ver detalle".
 *
 * UX:
 *  - Estado loading con skeletons.
 *  - Si no hay alternativas, no se renderiza (cero footprint visual).
 *  - Las alternativas más económicas resaltan con verde; las más caras quedan neutras.
 *  - Badge "Genérico" para productos genéricos (educación al usuario).
 */
export function TherapeuticAlternativesBanner({ productId, limit = 6 }: Props) {
  const { data, isLoading, error } = useProductAlternatives(productId, limit);

  if (isLoading) {
    return (
      <Card className="mt-6 p-4 sm:p-6 border-l-4 border-l-brand-pink">
        <div className="flex items-center gap-2 mb-4">
          <Beaker className="size-5 text-brand-pink" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  // Errores silenciosos (sección secundaria — no romper la página).
  if (error || !data) return null;

  // No hay alternativas → ocultar la sección.
  if (data.total === 0 || data.alternatives.length === 0) return null;

  const cheaperAlternatives = data.alternatives.filter(
    (a) => a.savings_percentage > 0,
  );
  const headlineSavings = cheaperAlternatives[0]?.savings_percentage ?? 0;

  return (
    <Card className="mt-6 p-4 sm:p-6 border-l-4 border-l-brand-pink">
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2 text-base sm:text-lg">
            <Beaker className="size-5 text-brand-pink shrink-0" />
            Alternativas con el mismo principio activo
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Productos con la misma DCI{" "}
            <strong className="text-foreground font-mono">
              {data.active_ingredient}
            </strong>
            {data.base_avg_price > 0 && (
              <>
                {" "}· precio promedio del actual:{" "}
                <span className="font-semibold">
                  {formatPrice(data.base_avg_price)}
                </span>
              </>
            )}
          </p>
        </div>

        {headlineSavings > 0 && (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 self-start"
          >
            <Sparkles className="size-3 mr-1" />
            Hasta {Math.round(headlineSavings)}% de ahorro
          </Badge>
        )}
      </header>

      {/* Disclaimer regulatorio (LPDP + buenas prácticas farmacéuticas) */}
      <div
        className="flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/40 px-3 py-2 mb-4"
        role="note"
        aria-label="Aviso profesional"
      >
        <Info className="size-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong>Información orientativa.</strong> La equivalencia se basa en la
          coincidencia de DCI registrada en DIGEMID. Consulta con tu Químico
          Farmacéutico antes de cambiar de marca o presentación.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {data.alternatives.map((alt) => {
          const cheaper = alt.savings_percentage > 0;
          const moreExpensive = alt.savings_percentage < 0;
          const href = alt.product_slug
            ? `/medicamento/${alt.product_slug}`
            : null;

          const card = (
            <div className="group flex flex-col h-full rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate group-hover:text-brand-pink transition-colors">
                    {alt.product_name}
                  </p>
                  {alt.manufacturer && (
                    <p className="text-xs text-muted-foreground truncate">
                      {alt.manufacturer}
                    </p>
                  )}
                </div>
                {alt.is_generic && (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wide shrink-0"
                  >
                    Genérico
                  </Badge>
                )}
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Precio promedio
                  </p>
                  <p className="font-bold text-brand-teal text-base sm:text-lg">
                    {formatPrice(alt.avg_price)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {alt.pharmacies_count} farmacia
                    {alt.pharmacies_count === 1 ? "" : "s"}
                  </p>
                </div>

                {cheaper && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  >
                    -{Math.round(alt.savings_percentage)}%
                  </Badge>
                )}
                {moreExpensive && (
                  <Badge
                    variant="outline"
                    className="text-muted-foreground"
                  >
                    +{Math.round(Math.abs(alt.savings_percentage))}%
                  </Badge>
                )}
              </div>

              {href && (
                <span className="mt-3 text-xs text-brand-pink flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver detalle <ArrowRight className="size-3" />
                </span>
              )}
            </div>
          );

          return (
            <li key={alt.product_id}>
              {href ? (
                <Link
                  href={href}
                  aria-label={`Ver alternativa ${alt.product_name}`}
                  className="block h-full"
                >
                  {card}
                </Link>
              ) : (
                card
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
