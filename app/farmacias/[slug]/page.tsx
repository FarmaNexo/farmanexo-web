"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Package,
  Phone,
  UserSquare2,
} from "lucide-react";
import {
  usePharmacyBySlug,
  usePharmacyInventory,
} from "@/lib/api/hooks/use-pharmacies";

const PharmacyLeafletMap = dynamic(
  () =>
    import("@/components/pharmacy-leaflet-map").then(
      (m) => m.PharmacyLeafletMap
    ),
  { ssr: false }
);

function formatPrice(v: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(v);
}

export default function FarmaciaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const {
    data: pharmacy,
    isLoading,
    error,
  } = usePharmacyBySlug(slug);
  const { data: inv } = usePharmacyInventory(pharmacy?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-pink" />
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Farmacia no encontrada</h1>
          <p className="text-muted-foreground mb-6">
            La farmacia que buscas no existe o no está disponible.
          </p>
          <Button onClick={() => router.push("/farmacias")}>
            Ver todas las farmacias
          </Button>
        </div>
      </div>
    );
  }

  const hasCoords = pharmacy.latitude !== 0 || pharmacy.longitude !== 0;
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${pharmacy.latitude},${pharmacy.longitude}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
                <div className="rounded-full bg-gradient-to-r from-brand-pink to-brand-teal p-3 sm:p-4 shrink-0">
                  <Building2 className="size-6 sm:size-8 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold">
                      {pharmacy.name}
                    </h1>
                    {pharmacy.is_verified && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="size-3 mr-1" />
                        Verificada
                      </Badge>
                    )}
                    {pharmacy.is_24h && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400"
                      >
                        <Clock className="size-3 mr-1" />
                        24 horas
                      </Badge>
                    )}
                  </div>
                  {pharmacy.chain_name && (
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Cadena {pharmacy.chain_name}
                    </p>
                  )}
                  {pharmacy.street && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-start gap-1">
                      <MapPin className="size-3 shrink-0 mt-0.5" />
                      <span>
                        {pharmacy.street}
                        {pharmacy.city ? `, ${pharmacy.city}` : ""}
                        {pharmacy.state ? `, ${pharmacy.state}` : ""}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                {googleMapsUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="gap-1.5"
                  >
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="size-4" />
                      Cómo llegar
                    </a>
                  </Button>
                )}
                {pharmacy.phone && (
                  <Button
                    size="sm"
                    className="bg-brand-teal hover:bg-brand-teal/90 gap-1.5"
                    asChild
                  >
                    <a href={`tel:${pharmacy.phone}`}>
                      <Phone className="size-4" />
                      Llamar
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="informacion" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger
                value="informacion"
                className="text-xs sm:text-sm py-2"
              >
                <Info className="size-3 sm:size-4 mr-1 sm:mr-2" />
                Información
              </TabsTrigger>
              <TabsTrigger
                value="ubicacion"
                className="text-xs sm:text-sm py-2"
              >
                <MapPin className="size-3 sm:size-4 mr-1 sm:mr-2" />
                Ubicación
              </TabsTrigger>
              <TabsTrigger
                value="inventario"
                className="text-xs sm:text-sm py-2"
              >
                <Package className="size-3 sm:size-4 mr-1 sm:mr-2" />
                Inventario
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="informacion"
              className="mt-4 sm:mt-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Phone className="size-4 text-brand-teal" />
                    Contacto
                  </h3>
                  <div className="space-y-3 text-sm">
                    {pharmacy.phone ? (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Teléfono
                        </p>
                        <a
                          href={`tel:${pharmacy.phone}`}
                          className="font-medium hover:text-brand-pink"
                        >
                          {pharmacy.phone}
                        </a>
                      </div>
                    ) : null}
                    {pharmacy.email ? (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Correo electrónico
                        </p>
                        <a
                          href={`mailto:${pharmacy.email}`}
                          className="font-medium hover:text-brand-pink break-all flex items-center gap-1"
                        >
                          <Mail className="size-3.5" />
                          {pharmacy.email}
                        </a>
                      </div>
                    ) : null}
                    {pharmacy.website ? (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Sitio web
                        </p>
                        <a
                          href={pharmacy.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:text-brand-pink break-all"
                        >
                          {pharmacy.website}
                        </a>
                      </div>
                    ) : null}
                    {!pharmacy.phone &&
                      !pharmacy.email &&
                      !pharmacy.website && (
                        <p className="text-muted-foreground">
                          Sin datos de contacto disponibles
                        </p>
                      )}
                  </div>
                </Card>

                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <UserSquare2 className="size-4 text-brand-teal" />
                    Información regulatoria
                  </h3>
                  <div className="space-y-3 text-sm">
                    {pharmacy.ruc && (
                      <div>
                        <p className="text-muted-foreground text-xs">RUC</p>
                        <p className="font-mono font-medium">{pharmacy.ruc}</p>
                      </div>
                    )}
                    {pharmacy.technical_director && (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Director técnico
                        </p>
                        <p className="font-medium">
                          {pharmacy.technical_director}
                        </p>
                      </div>
                    )}
                    {pharmacy.source_pharmacy_code && (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Código DIGEMID
                        </p>
                        <p className="font-mono">
                          {pharmacy.source_pharmacy_code}
                        </p>
                      </div>
                    )}
                    {!pharmacy.ruc &&
                      !pharmacy.technical_director &&
                      !pharmacy.source_pharmacy_code && (
                        <p className="text-muted-foreground">
                          Sin datos regulatorios registrados
                        </p>
                      )}
                  </div>
                </Card>
              </div>

              {pharmacy.hours_raw && (
                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="size-4 text-brand-teal" />
                    Horarios de atención
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                    {pharmacy.hours_raw}
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="ubicacion" className="mt-4 sm:mt-6 space-y-4">
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="size-4 text-brand-teal" />
                  Dirección
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {pharmacy.street
                    ? `${pharmacy.street}${pharmacy.city ? `, ${pharmacy.city}` : ""}${
                        pharmacy.state ? `, ${pharmacy.state}` : ""
                      }`
                    : "Dirección no disponible"}
                </p>
                {hasCoords ? (
                  <PharmacyLeafletMap
                    pharmacies={[pharmacy]}
                    center={[pharmacy.latitude, pharmacy.longitude]}
                    zoom={16}
                    height="360px"
                  />
                ) : (
                  <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                    Esta farmacia aún no ha sido geocodificada. Estamos
                    trabajando en agregar sus coordenadas al mapa.
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent
              value="inventario"
              className="mt-4 sm:mt-6 space-y-4"
            >
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="size-4 text-brand-teal" />
                  Productos disponibles
                </h3>

                {!inv || !inv.items || inv.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Esta farmacia aún no ha registrado inventario en la
                    plataforma.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      {inv.items.length} productos en stock
                    </p>
                    <div className="space-y-2">
                      {inv.items.slice(0, 20).map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                index < 3
                                  ? "bg-brand-teal/10 text-brand-teal"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-mono text-xs text-muted-foreground truncate">
                                ID {item.product_id.slice(0, 8)}…
                              </p>
                              {item.stock > 0 && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                  Stock {item.stock}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="font-bold text-brand-teal text-base sm:text-lg">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      ))}
                      {inv.items.length > 20 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          Y {inv.items.length - 20} productos más…
                        </p>
                      )}
                    </div>
                  </>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-6 p-4 bg-muted/50 border-muted">
            <p className="text-xs text-muted-foreground text-center">
              La información mostrada proviene del registro DIGEMID/MINSA. Los
              precios son referenciales y pueden variar. Verifica
              disponibilidad llamando directamente a la farmacia.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
