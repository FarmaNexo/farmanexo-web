"use client";

import { useMemo, useState } from "react";
import {
  Droplet,
  FlaskConical,
  Pill,
  Syringe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/api/types";

type AspectRatio = "square" | "banner" | "portrait";

interface ProductImageProps {
  product: Pick<Product, "name" | "form" | "manufacturer" | "images">;
  aspectRatio?: AspectRatio;
  className?: string;
  iconClassName?: string;
}

const PALETTES = [
  {
    bg: "from-pink-100 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/20",
    icon: "text-pink-500 dark:text-pink-400",
  },
  {
    bg: "from-teal-100 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/20",
    icon: "text-teal-500 dark:text-teal-400",
  },
  {
    bg: "from-amber-100 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/20",
    icon: "text-amber-500 dark:text-amber-400",
  },
  {
    bg: "from-emerald-100 to-green-50 dark:from-emerald-950/40 dark:to-green-950/20",
    icon: "text-emerald-500 dark:text-emerald-400",
  },
  {
    bg: "from-violet-100 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/20",
    icon: "text-violet-500 dark:text-violet-400",
  },
  {
    bg: "from-sky-100 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/20",
    icon: "text-sky-500 dark:text-sky-400",
  },
] as const;

const ASPECT_CLASS: Record<AspectRatio, string> = {
  square: "aspect-square",
  banner: "aspect-[16/9]",
  portrait: "aspect-[3/4]",
};

function iconForForm(form: string | undefined): LucideIcon {
  const f = (form ?? "").toUpperCase();
  if (/AMPOLLA|INYECTABLE|VIAL/.test(f)) return Syringe;
  if (/JARABE|SUSPENSION|SUSPENSIÓN|SOLUCION|SOLUCIÓN|GOTAS|EMULSION/.test(f))
    return Droplet;
  if (/CREMA|POMADA|UNGUENTO|UNGÜENTO|GEL|LOCION|POLVO|GRANULADO/.test(f))
    return FlaskConical;
  return Pill;
}

function paletteIndex(seed: string): number {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return sum % PALETTES.length;
}

export function ProductImage({
  product,
  aspectRatio = "banner",
  className,
  iconClassName,
}: ProductImageProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const primary = useMemo(() => {
    const imgs = product.images ?? [];
    if (imgs.length === 0) return null;
    return imgs.find((i) => i.is_primary) ?? imgs[0];
  }, [product.images]);

  const palette =
    PALETTES[paletteIndex(product.manufacturer ?? product.name ?? "")];
  const Icon = iconForForm(product.form);

  const wrapperClasses = cn(
    "relative w-full overflow-hidden rounded-lg bg-gradient-to-br",
    ASPECT_CLASS[aspectRatio],
    palette.bg,
    className
  );

  if (primary && !imageFailed) {
    return (
      <div className={wrapperClasses}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primary.image_url}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon
          className={cn("size-12 sm:size-16 opacity-70", palette.icon, iconClassName)}
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      {product.manufacturer && (
        <span className="absolute bottom-2 left-2 right-2 truncate text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
          {product.manufacturer}
        </span>
      )}
    </div>
  );
}
