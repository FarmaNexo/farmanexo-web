"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  FileText,
  Heart,
  Info,
  Loader2,
  MapPin,
  Pill,
  Thermometer,
  TrendingDown,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { useFarmaNexoStore } from "@/lib/farmanexo-store";
import {
  useProductAvailability,
  useProductBySlug,
} from "@/lib/api/hooks/use-products";
import { ProductImage } from "@/components/product-image";
import { TherapeuticAlternativesBanner } from "@/components/therapeutic-alternatives-banner";
import {
  DEFAULT_RADIUS_OPTIONS,
  NearMeToggle,
  type NearMeLocation,
} from "@/components/near-me-toggle";
import { OverpriceBadge } from "@/components/overprice-badge";
import { AddToCartButton } from "@/components/add-to-cart-button";

function formatPrice(v: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(v);
}

export default function MedicamentoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { favorites, toggleFavorite, setUserLocation, searchRadius, setSearchRadius } =
    useFarmaNexoStore();

  // HU-014 — la activación del filtro "Cerca de mí" vive en estado local de
  // la página: el store guarda la preferencia de radio (compartida cross-page)
  // y la ubicación cruda, pero la decisión de aplicar el filtro al comparador
  // es por-página (opt-in por surface).
  const [nearMe, setNearMe] = useState<NearMeLocation | null>(null);

  const {
    data: product,
    isLoading,
    error,
  } = useProductBySlug(slug);
  const { data: availability } = useProductAvailability(
    product?.id,
    nearMe ? { lat: nearMe.lat, lng: nearMe.lng, radiusKm: nearMe.radiusKm } : undefined
  );

  // Fallback fetch: si "Cerca de mí" está activo, levantamos también la
  // versión sin geo (cached por TanStack si el user la consultó antes).
  // Sirve para distinguir "no hay farmacias en tu radio" vs "no hay
  // disponibilidad real" y ofrecer el CTA correcto.
  const { data: fallbackAvailability } = useProductAvailability(
    nearMe ? product?.id : undefined
  );

  const isFavorite = mounted && product ? favorites.includes(product.id) : false;

  const priceInfo = useMemo(() => {
    const items = availability?.pharmacies ?? [];
    const available = items.filter((x) => x.is_available);
    if (available.length === 0) return null;
    const prices = available.map((x) => x.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    // Si el toggle "Cerca de mí" está activo y todas las farmacias traen
    // distance_km, ordenamos por cercanía (lo que ya hizo el backend).
    // Sin geo, mantenemos el orden histórico por precio asc.
    const sortedByDistance =
      nearMe && available.every((x) => typeof x.distance_km === "number");
    const sorted = [...available].sort((a, b) =>
      sortedByDistance
        ? (a.distance_km ?? 0) - (b.distance_km ?? 0)
        : a.price - b.price
    );
    return { min, max, count: available.length, sorted, sortedByDistance };
  }, [availability, nearMe]);

  // Cantidad de farmacias con stock global (sin filtro geo). Útil para el
  // empty state inteligente: si > 0 y priceInfo es null con nearMe activo,
  // significa que hay farmacias pero todas están fuera del radio.
  const fallbackAvailableCount = useMemo(
    () => (fallbackAvailability?.pharmacies ?? []).filter((x) => x.is_available).length,
    [fallbackAvailability]
  );

  // Próximo radio mayor para la CTA "Ampliar a X km" del empty state.
  const nextRadiusUp = nearMe
    ? DEFAULT_RADIUS_OPTIONS.find((r) => r > nearMe.radiusKm) ?? null
    : null;

  const handleActivateNearMe = (loc: NearMeLocation) => {
    setNearMe(loc);
    setSearchRadius(loc.radiusKm);
    // Persistimos también en el store global por si /farmacias lo reusa.
    setUserLocation({ lat: loc.lat, lng: loc.lng });
  };

  const handleRadiusChange = (radiusKm: number) => {
    setSearchRadius(radiusKm);
    setNearMe((prev) => (prev ? { ...prev, radiusKm } : prev));
  };

  const handleClearNearMe = () => setNearMe(null);

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite(product.id);
    toast.success(isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-pink" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Medicamento no encontrado</h1>
          <p className="text-muted-foreground mb-6">
            El medicamento que buscas no existe o no está disponible.
          </p>
          <Button onClick={() => router.push("/catalogo")}>
            Ver catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster position="top-right" richColors />

      <section className="py-6 sm:py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="size-4 mr-2" />
            Volver
          </Button>

          <div className="bg-gradient-to-r from-brand-pink/10 to-brand-teal/10 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                  <ProductImage
                    product={product}
                    aspectRatio="square"
                    className="h-full w-full"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold">
                      {product.name}
                    </h1>
                    {product.requires_prescription ? (
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-500 text-amber-600"
                      >
                        <FileText className="size-3 mr-1" />
                        Receta
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      >
                        Venta libre
                      </Badge>
                    )}
                    {product.form && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {product.form}
                      </Badge>
                    )}
                  </div>
                  {product.active_ingredient && (
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {product.active_ingredient}
                      {product.concentration
                        ? ` · ${product.concentration}`
                        : ""}
                    </p>
                  )}
                  {product.manufacturer && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {product.manufacturer}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={
                    isFavorite ? "text-brand-pink border-brand-pink" : ""
                  }
                >
                  <Heart
                    className={`size-4 mr-1 ${isFavorite ? "fill-current" : ""}`}
                  />
                  {isFavorite ? "Favorito" : "Agregar"}
                </Button>

                {priceInfo && (
                  <Card className="p-3 text-center bg-white dark:bg-card min-w-[140px]">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                      <TrendingDown className="size-3" />
                      Desde
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-brand-teal">
                      {formatPrice(priceInfo.min)}
                    </p>
                    {priceInfo.max > priceInfo.min && (
                      <p className="text-xs text-muted-foreground">
                        hasta {formatPrice(priceInfo.max)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      en {priceInfo.count}{" "}
                      {priceInfo.count === 1 ? "farmacia" : "farmacias"}
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="general" className="text-xs sm:text-sm py-2">
                <Info className="size-3 sm:size-4 mr-1 sm:mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="uso" className="text-xs sm:text-sm py-2">
                <Clock className="size-3 sm:size-4 mr-1 sm:mr-2" />
                Uso
              </TabsTrigger>
              <TabsTrigger
                value="advertencias"
                className="text-xs sm:text-sm py-2"
              >
                <AlertTriangle className="size-3 sm:size-4 mr-1 sm:mr-2" />
                Advertencias
              </TabsTrigger>
              <TabsTrigger
                value="conservacion"
                className="text-xs sm:text-sm py-2"
              >
                <Thermometer className="size-3 sm:size-4 mr-1 sm:mr-2" />
                Conservación
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 sm:mt-6 space-y-4">
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="size-4 text-brand-teal" />
                  Información General
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {product.active_ingredient && (
                    <div>
                      <p className="text-muted-foreground">
                        Principio Activo (DCI)
                      </p>
                      <p className="font-medium">{product.active_ingredient}</p>
                    </div>
                  )}
                  {product.concentration && (
                    <div>
                      <p className="text-muted-foreground">Concentración</p>
                      <p className="font-medium">{product.concentration}</p>
                    </div>
                  )}
                  {product.form && (
                    <div>
                      <p className="text-muted-foreground">
                        Forma Farmacéutica
                      </p>
                      <p className="font-medium">{product.form}</p>
                    </div>
                  )}
                  {product.manufacturer && (
                    <div>
                      <p className="text-muted-foreground">Laboratorio</p>
                      <p className="font-medium">{product.manufacturer}</p>
                    </div>
                  )}
                  {product.presentation && (
                    <div>
                      <p className="text-muted-foreground">Presentación</p>
                      <p className="font-medium">{product.presentation}</p>
                    </div>
                  )}
                  {product.registry_number && (
                    <div>
                      <p className="text-muted-foreground">
                        Registro Sanitario DIGEMID
                      </p>
                      <p className="font-mono font-medium">
                        {product.registry_number}
                      </p>
                    </div>
                  )}
                  {product.sku && (
                    <div>
                      <p className="text-muted-foreground">SKU</p>
                      <p className="font-mono text-xs">{product.sku}</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="uso" className="mt-4 sm:mt-6 space-y-4">
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="size-4 text-brand-teal" />
                  Información de Uso
                </h3>
                <p className="text-sm text-muted-foreground">
                  Consulte a su médico o farmacéutico para información sobre la
                  dosificación adecuada. Esta información no está disponible de
                  forma centralizada en la base de datos DIGEMID.
                </p>
              </Card>

              <Card className="p-4 sm:p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                  <strong>Importante:</strong> Siempre siga las indicaciones de
                  su médico. No se automedique.
                </p>
              </Card>
            </TabsContent>

            <TabsContent
              value="advertencias"
              className="mt-4 sm:mt-6 space-y-4"
            >
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  Advertencias y Precauciones
                </h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Mantener fuera del alcance de los niños.</li>
                  <li>No exceder la dosis recomendada.</li>
                  <li>Si los síntomas persisten, consultar a su médico.</li>
                  <li>No usar después de la fecha de vencimiento.</li>
                </ul>
              </Card>

              {product.requires_prescription && (
                <Card className="p-4 sm:p-6 bg-amber-500/5 border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div className="space-y-2">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        Este medicamento requiere receta médica
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                        Para adquirir este medicamento, deberá presentar una
                        receta médica válida en la farmacia. No se automedique
                        y consulte siempre con un profesional de la salud.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="conservacion" className="mt-4 sm:mt-6">
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Thermometer className="size-4 text-brand-teal" />
                  Condiciones de Conservación
                </h3>
                <p className="text-sm text-muted-foreground">
                  Conservar en lugar fresco y seco, protegido de la luz.
                  Temperatura no mayor a 30°C. Mantener fuera del alcance de
                  los niños. No refrigerar a menos que se indique.
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          {(priceInfo || nearMe) && (
            <Card className="mt-6 p-4 sm:p-6" aria-labelledby="comparador-titulo">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h3
                    id="comparador-titulo"
                    className="font-semibold flex items-center gap-2"
                  >
                    <TrendingDown className="size-4 text-brand-teal shrink-0" />
                    Comparador de precios
                  </h3>
                  {/* HU-013 — datos mínimos del Excel: nombre comercial + DCI + concentración
                       visibles como contexto del ranking que sigue. */}
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium text-foreground">
                      {product.name}
                    </span>
                    {product.active_ingredient && (
                      <span className="inline-flex items-center gap-1">
                        <Pill className="size-3 text-brand-pink" aria-hidden="true" />
                        <span className="font-mono">{product.active_ingredient}</span>
                      </span>
                    )}
                    {product.concentration && (
                      <span className="text-foreground/80">
                        · {product.concentration}
                      </span>
                    )}
                  </p>
                </div>
                <NearMeToggle
                  value={nearMe}
                  onActivate={handleActivateNearMe}
                  onRadiusChange={handleRadiusChange}
                  onClear={handleClearNearMe}
                  initialRadiusKm={searchRadius || 10}
                  className="self-start sm:self-auto shrink-0"
                />
              </div>

              {!priceInfo && nearMe && (
                <div
                  className="rounded-lg border border-dashed border-brand-teal/30 bg-brand-teal/5 p-4 sm:p-5 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <MapPin className="size-6 mx-auto mb-2 text-brand-teal" aria-hidden="true" />
                  {fallbackAvailableCount > 0 ? (
                    <>
                      <p className="font-medium text-sm">
                        No hay farmacias con este producto dentro de{" "}
                        {nearMe.radiusKm} km de tu ubicación.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Encontramos{" "}
                        <span className="font-semibold text-foreground">
                          {fallbackAvailableCount}
                        </span>{" "}
                        {fallbackAvailableCount === 1 ? "farmacia" : "farmacias"} fuera de
                        ese radio.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {nextRadiusUp && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleRadiusChange(nextRadiusUp)}
                            className="bg-brand-teal hover:bg-brand-teal/90"
                          >
                            Ampliar a {nextRadiusUp} km
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleClearNearMe}
                        >
                          Quitar filtro
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay farmacias con disponibilidad registrada para este producto.
                    </p>
                  )}
                </div>
              )}

              {priceInfo && (
                <>
                  <p
                    className="text-xs sm:text-sm text-muted-foreground mb-4"
                    aria-live="polite"
                  >
                    {priceInfo.count} farmacia
                    {priceInfo.count === 1 ? "" : "s"}
                    {nearMe ? <> en un radio de {nearMe.radiusKm} km</> : null}
                    {" · desde "}
                    <span className="font-semibold text-brand-teal">
                      {formatPrice(priceInfo.min)}
                    </span>
                    {priceInfo.max > priceInfo.min && (
                      <>
                        {" "}hasta{" "}
                        <span className="font-semibold">
                          {formatPrice(priceInfo.max)}
                        </span>
                      </>
                    )}
                  </p>

                  <ol
                    className="space-y-3"
                    aria-label={
                      priceInfo.sortedByDistance
                        ? "Ranking de farmacias por cercanía"
                        : "Ranking de farmacias por precio"
                    }
                  >
                {priceInfo.sorted.slice(0, 10).map((item, index) => {
                  const href = item.pharmacy_slug
                    ? `/farmacias/${item.pharmacy_slug}`
                    : `/farmacias/${item.pharmacy_id}`;
                  return (
                    <li key={item.pharmacy_id}>
                      <Link
                        href={href}
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded-lg"
                        aria-label={
                          priceInfo.sortedByDistance && typeof item.distance_km === "number"
                            ? `Posición ${index + 1}: ${item.pharmacy_name}, ${item.distance_km.toFixed(2)} km, ${formatPrice(item.price)}`
                            : `Posición ${index + 1}: ${item.pharmacy_name}, ${formatPrice(item.price)}`
                        }
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-card border border-transparent hover:border-brand-pink/30 hover:bg-muted/40 hover:shadow-sm transition-all gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span
                              className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                index === 0
                                  ? "bg-brand-teal text-white"
                                  : index === 1
                                    ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                              }`}
                              aria-hidden="true"
                            >
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {item.pharmacy_name}
                              </p>
                              {/* HU-013 — distrito visible en cada card del ranking */}
                              {item.pharmacy_district && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                  <MapPin className="size-3 shrink-0" aria-hidden="true" />
                                  <span className="capitalize truncate">
                                    {item.pharmacy_district.toLowerCase()}
                                  </span>
                                  {typeof item.distance_km === "number" && (
                                    <span className="ml-1 shrink-0">
                                      · {item.distance_km.toFixed(2)} km
                                    </span>
                                  )}
                                </p>
                              )}
                              {!item.pharmacy_district && typeof item.distance_km === "number" && (
                                <p className="text-xs text-muted-foreground">
                                  {item.distance_km.toFixed(2)} km
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Meta badges row: en mobile arriba del precio/CTA, en desktop inline */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 ml-9 sm:ml-0">
                            <div className="flex items-center gap-2 sm:gap-2">
                              {/* HU-016 — alerta de sobreprecio: visible en todos los
                                  breakpoints porque es información de seguridad económica. */}
                              {item.is_overpriced &&
                                typeof item.overprice_pct === "number" && (
                                  <OverpriceBadge
                                    overpricePct={item.overprice_pct}
                                    districtAvgPrice={item.district_avg_price}
                                    district={item.pharmacy_district}
                                  />
                                )}
                              {index === 0 && !item.is_overpriced && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] sm:text-xs bg-brand-teal/10 text-brand-teal border-0 hidden sm:inline-flex"
                                >
                                  {priceInfo.sortedByDistance ? "Más cerca" : "Precio más bajo"}
                                </Badge>
                              )}
                              {/* T2.4 — pill "Quedan N" solo cuando stock es bajo (urgencia) */}
                              {item.stock > 0 && item.stock <= 3 && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0"
                                >
                                  {item.stock === 1 ? "Última unidad" : `Quedan ${item.stock}`}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                              <p className="font-bold text-brand-teal text-lg sm:text-xl tabular-nums">
                                {formatPrice(item.price)}
                              </p>
                              <AddToCartButton
                                productId={product.id}
                                pharmacyId={item.pharmacy_id}
                                stock={item.stock}
                                compact
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
                  </ol>
                </>
              )}
            </Card>
          )}

          {/* HU-015 — Alternativas terapéuticas con la misma DCI */}
          <TherapeuticAlternativesBanner productId={product.id} />

          {!priceInfo && !nearMe && (
            <Card className="mt-6 p-4 sm:p-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <AlertCircle className="size-5 shrink-0" />
                <p className="text-sm">
                  No hay farmacias con disponibilidad registrada para este
                  producto en este momento.
                </p>
              </div>
            </Card>
          )}

          <Card className="mt-6 p-4 bg-muted/50 border-muted">
            <p className="text-xs text-muted-foreground text-center">
              La información mostrada es de carácter orientativo. Consulte
              siempre con un profesional de la salud antes de tomar cualquier
              medicamento. Los precios son referenciales y pueden variar.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
