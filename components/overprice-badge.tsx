"use client";

import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface OverpriceBadgeProps {
  /** Porcentaje sobre el promedio del distrito (ej. 0.45 = 45% más caro). */
  overpricePct: number;
  /** Promedio en el distrito (referencia para el tooltip educativo). */
  districtAvgPrice?: number;
  /** Distrito de la farmacia (para personalizar el tooltip). */
  district?: string;
  className?: string;
}

const formatPEN = (v: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(v);

/**
 * HU-016 — Badge de "precio elevado" + tooltip educativo.
 *
 * Se renderiza solo cuando el backend marca `is_overpriced=true`. El
 * badge en sí indica el porcentaje exacto sobre el promedio del distrito;
 * el tooltip explica al usuario por qué se considera caro y le invita
 * a comparar antes de comprar (sin ser punitivo con la farmacia).
 *
 * Accesibilidad:
 *  - El badge tiene `role="status"` con un `aria-label` que comunica el
 *    contexto completo en un solo string para lectores de pantalla.
 *  - El tooltip está conectado al trigger via Radix; al focusear el
 *    badge, su contenido se anuncia automáticamente.
 *  - Color rojo/destructive con texto en blanco para AA contrast.
 */
export function OverpriceBadge({
  overpricePct,
  districtAvgPrice,
  district,
  className,
}: OverpriceBadgeProps) {
  const pctRounded = Math.round(overpricePct * 100);
  const districtLabel = district
    ? `el promedio del distrito ${district.toLowerCase()}`
    : "el promedio del distrito";

  const ariaLabel = districtAvgPrice
    ? `Precio elevado: ${pctRounded}% por encima de ${districtLabel} (${formatPEN(districtAvgPrice)}).`
    : `Precio elevado: ${pctRounded}% por encima de ${districtLabel}.`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="destructive"
          role="status"
          aria-label={ariaLabel}
          className={cn(
            "gap-1 cursor-help",
            "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20",
            "dark:bg-destructive/20 dark:text-destructive-foreground",
            className
          )}
        >
          <AlertTriangle className="size-3" aria-hidden="true" />
          <span className="font-semibold">+{pctRounded}%</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs whitespace-normal text-left leading-snug bg-foreground text-background p-3"
      >
        <p className="font-semibold mb-1">Precio elevado</p>
        <p className="text-xs">
          Esta farmacia cobra <strong>{pctRounded}%</strong> más que{" "}
          {districtLabel}
          {districtAvgPrice ? (
            <>
              {" "}
              (<strong>{formatPEN(districtAvgPrice)}</strong> en promedio)
            </>
          ) : null}
          . Considera comparar con otras opciones antes de comprar.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
