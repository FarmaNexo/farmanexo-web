"use client";

import { useId, useState } from "react";
import { ChevronDown, Loader2, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface NearMeLocation {
  lat: number;
  lng: number;
  radiusKm: number;
}

/** Radios disponibles por defecto (en km). Cubre casos típicos urbanos a metropolitanos. */
export const DEFAULT_RADIUS_OPTIONS = [5, 10, 25, 50] as const;

export interface NearMeToggleProps {
  /** Ubicación activa (si hay), controlada por el padre. */
  value: NearMeLocation | null;
  /** Llamado con coords del navegador + radio inicial cuando se activa. */
  onActivate: (loc: NearMeLocation) => void;
  /** Llamado al cambiar el radio mientras el toggle está activo. */
  onRadiusChange: (radiusKm: number) => void;
  /** Llamado al limpiar — vuelve al orden por precio. */
  onClear: () => void;
  /** Radio inicial al activar el toggle. Default: 10 km. */
  initialRadiusKm?: number;
  /** Lista de radios seleccionables. Default: [5, 10, 25, 50]. */
  radiusOptions?: readonly number[];
  className?: string;
}

/**
 * HU-014 — Toggle "Cerca de mí" para el comparador de precios.
 *
 * Tres estados visuales:
 * 1. Inactivo: botón outline → solicita geolocalización del navegador.
 * 2. Cargando: el botón muestra spinner mientras espera permiso.
 * 3. Activo: pill clickable abre Popover con selector de radio + botón "X" para limpiar.
 *
 * El componente NO toca el store ni hace fetch — es completamente controlado.
 * El padre decide dónde persistir la location (ej. Zustand) y cómo inyectarla
 * a la query de availability. Esto permite reutilizarlo en otras surfaces
 * (búsqueda, /farmacias) sin duplicar lógica.
 */
export function NearMeToggle({
  value,
  onActivate,
  onRadiusChange,
  onClear,
  initialRadiusKm = 10,
  radiusOptions = DEFAULT_RADIUS_OPTIONS,
  className,
}: NearMeToggleProps) {
  const [requesting, setRequesting] = useState(false);
  const [open, setOpen] = useState(false);
  const radioGroupId = useId();

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Tu navegador no soporta geolocalización.");
      return;
    }
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRequesting(false);
        onActivate({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radiusKm: initialRadiusKm,
        });
      },
      (err) => {
        setRequesting(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Necesitamos tu ubicación para ordenar por distancia. Activa los permisos del navegador y reintenta."
            : "No pudimos obtener tu ubicación. Reintenta en un momento.";
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  };

  if (value) {
    return (
      <div
        className={cn("inline-flex items-center gap-1", className)}
        aria-live="polite"
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Cerca de mí · radio ${value.radiusKm} km. Click para cambiar el radio.`}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="inline-flex items-center gap-1.5 rounded-l-full bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/15 transition-colors px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <MapPin className="size-4" aria-hidden="true" />
              <span>Cerca de mí · {value.radiusKm} km</span>
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  open && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="end">
            <p
              className="text-xs font-medium text-foreground mb-2"
              id={`${radioGroupId}-label`}
            >
              Radio de búsqueda
            </p>
            <RadioGroup
              value={String(value.radiusKm)}
              onValueChange={(next) => {
                onRadiusChange(Number(next));
                setOpen(false);
              }}
              aria-labelledby={`${radioGroupId}-label`}
              className="gap-2"
            >
              {radiusOptions.map((km) => {
                const id = `${radioGroupId}-${km}`;
                return (
                  <div key={km} className="flex items-center gap-2">
                    <RadioGroupItem value={String(km)} id={id} />
                    <Label
                      htmlFor={id}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {km} km
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </PopoverContent>
        </Popover>
        <button
          type="button"
          onClick={onClear}
          className="rounded-r-full bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          aria-label="Quitar filtro de distancia"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={requestLocation}
      disabled={requesting}
      aria-pressed={false}
      className={cn("gap-2", className)}
    >
      {requesting ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <MapPin className="size-4" aria-hidden="true" />
      )}
      {requesting ? "Obteniendo ubicación..." : "Cerca de mí"}
    </Button>
  );
}
