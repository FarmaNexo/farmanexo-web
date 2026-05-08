"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  usePharmacies,
  usePharmacyNearby,
} from "@/lib/api/hooks/use-pharmacies";

const PharmacyLeafletMap = dynamic(
  () =>
    import("@/components/pharmacy-leaflet-map").then(
      (m) => m.PharmacyLeafletMap
    ),
  { ssr: false }
);

type Location = { lat: number; lng: number };

export default function FarmaciasPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"all" | "nearby">("all");
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [radius, setRadius] = useState(5);

  const allQuery = usePharmacies(1, 50);
  const nearbyQuery = usePharmacyNearby(
    mode === "nearby" && location
      ? {
          latitude: location.lat,
          longitude: location.lng,
          radius_km: radius,
          limit: 30,
        }
      : null
  );

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Tu navegador no soporta geolocalización. Usa el listado general."
      );
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setMode("nearby");
        setLocating(false);
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Permiso denegado. Activa la geolocalización y vuelve a intentar."
            : "No se pudo obtener tu ubicación."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const activeLoading =
    (mode === "all" && allQuery.isLoading) ||
    (mode === "nearby" && nearbyQuery.isLoading);
  const activeError =
    (mode === "all" && allQuery.error) ||
    (mode === "nearby" && nearbyQuery.error);
  const pharmacies =
    mode === "nearby"
      ? (nearbyQuery.data?.pharmacies ?? [])
      : (allQuery.data?.pharmacies ?? []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-6 sm:py-8 px-4">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="size-4 mr-2" />
            Volver al inicio
          </Button>

          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Farmacias registradas
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {allQuery.data
                  ? `${allQuery.data.total} farmacias verificadas en la plataforma`
                  : "Cargando farmacias..."}
              </p>
            </div>

            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={mode === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("all")}
                    className={
                      mode === "all"
                        ? "bg-brand-teal hover:bg-brand-teal/90"
                        : ""
                    }
                  >
                    <Building2 className="size-4 mr-2" />
                    Ver todas
                  </Button>
                  <Button
                    variant={mode === "nearby" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (location) {
                        setMode("nearby");
                      } else {
                        requestLocation();
                      }
                    }}
                    disabled={locating}
                    className={
                      mode === "nearby"
                        ? "bg-brand-teal hover:bg-brand-teal/90"
                        : ""
                    }
                  >
                    {locating ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Navigation className="size-4 mr-2" />
                    )}
                    Cerca de mí
                  </Button>
                  {mode === "nearby" && location && (
                    <div className="flex items-center gap-2 text-sm ml-auto">
                      <span className="text-muted-foreground">Radio:</span>
                      <select
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="rounded-md border bg-background px-2 py-1 text-sm"
                      >
                        <option value={1}>1 km</option>
                        <option value={3}>3 km</option>
                        <option value={5}>5 km</option>
                        <option value={10}>10 km</option>
                      </select>
                    </div>
                  )}
                </div>

                {locationError && (
                  <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{locationError}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {mode === "nearby" && location && !activeLoading && (
              <PharmacyLeafletMap
                pharmacies={pharmacies}
                userLocation={location}
                height="380px"
              />
            )}

            {activeError && (
              <Card className="p-8 sm:p-12">
                <div className="text-center">
                  <AlertCircle className="size-10 sm:size-12 text-destructive mx-auto mb-4 opacity-70" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    No se pudieron cargar las farmacias
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Intenta nuevamente en unos segundos.
                  </p>
                </div>
              </Card>
            )}

            {activeLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-xl" />
                ))}
              </div>
            )}

            {!activeLoading && !activeError && (
              <>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {mode === "nearby"
                    ? `${pharmacies.length} farmacias en un radio de ${radius} km`
                    : `Mostrando ${pharmacies.length} farmacias`}
                </div>

                {pharmacies.length === 0 ? (
                  <Card className="p-8 sm:p-12">
                    <div className="text-center">
                      <Building2 className="size-10 sm:size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-base sm:text-lg font-semibold mb-2">
                        {mode === "nearby"
                          ? "No hay farmacias cerca"
                          : "No hay farmacias registradas"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {mode === "nearby"
                          ? "Prueba ampliando el radio de búsqueda."
                          : "Vuelve a intentar más tarde."}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {pharmacies.map((p) => (
                      <Link
                        key={p.id}
                        href={`/farmacias/${p.slug}`}
                        className="block h-full"
                      >
                        <Card
                          className={cn(
                            "group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-transparent h-full flex flex-col",
                            "hover:border-l-[#db1a85]"
                          )}
                        >
                          <CardHeader className="pb-3 shrink-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base sm:text-lg group-hover:text-[#db1a85] transition-colors line-clamp-2 leading-tight min-h-[2.75rem] sm:min-h-[3.25rem]">
                                  {p.name}
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs sm:text-sm line-clamp-1 min-h-[1.25rem]">
                                  {p.chain_name
                                    ? `Cadena ${p.chain_name}`
                                    : "Farmacia independiente"}
                                </CardDescription>
                              </div>
                              {p.is_verified && (
                                <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-1" />
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="flex-1 flex flex-col gap-3 pb-4">
                            <div className="flex flex-wrap gap-1 sm:gap-2 min-h-[1.5rem]">
                              {p.is_verified && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                >
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Verificada
                                </Badge>
                              )}
                              {p.is_24h && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                >
                                  <Clock className="size-3 mr-1" />
                                  24 horas
                                </Badge>
                              )}
                              {typeof p.distance_km === "number" && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-brand-pink/10 text-brand-pink"
                                >
                                  <Navigation className="size-3 mr-1" />
                                  {p.distance_km.toFixed(2)} km
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground min-h-[2.5rem]">
                              <MapPin className="size-4 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                {p.street
                                  ? `${p.street}${p.city ? `, ${p.city}` : ""}`
                                  : "Dirección no disponible"}
                              </span>
                            </div>

                            <div className="text-xs text-muted-foreground mt-auto">
                              RUC{" "}
                              <span className="font-mono">{p.ruc ?? "—"}</span>
                            </div>
                          </CardContent>

                          <CardFooter className="pt-0 mt-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full group-hover:border-brand-pink group-hover:text-brand-pink transition-colors"
                            >
                              Ver farmacia
                              <ChevronRight className="size-3 sm:size-4 ml-1" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
