"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Pill,
  Search,
  Shield,
  TrendingUp,
} from "lucide-react";
import { usePharmacyNearby } from "@/lib/api/hooks/use-pharmacies";

const NEARBY_RADIUS_KM = 5;
const NEARBY_LIMIT = 3;

type Coords = { lat: number; lng: number };

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const nearbyQuery = usePharmacyNearby(
    coords
      ? {
          latitude: coords.lat,
          longitude: coords.lng,
          radius_km: NEARBY_RADIUS_KM,
          limit: NEARBY_LIMIT,
        }
      : null
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Tu navegador no soporta geolocalización. Explora el listado completo."
      );
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado. Puedes ver todas las farmacias manualmente."
            : "No pudimos obtener tu ubicación. Intenta de nuevo."
        );
      },
      { timeout: 10_000 }
    );
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const nearbyPharmacies = nearbyQuery.data?.pharmacies ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster position="top-right" richColors />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#db1a85] via-[#e14298] to-[#f062ad] py-16 sm:py-24 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
                Acceso seguro a boticas autorizadas.
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-xl mb-8 text-balance">
                Compara precios, encuentra farmacias cerca de ti y accede a
                información verificada de medicamentos registrados en DIGEMID.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-brand-coral hover:bg-brand-coral/90 text-white font-semibold px-8"
                  onClick={() => router.push("/catalogo")}
                >
                  Ver catálogo
                  <ArrowRight className="ml-2 size-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 bg-transparent"
                  onClick={() => scrollToSection("features")}
                >
                  <Shield className="mr-2 size-5" />
                  Cómo cuidamos tu seguridad
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -bottom-8 -left-8 right-8 bg-[#b8146f] rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-coral/20 rounded-xl">
                      <Pill className="size-8 text-brand-coral" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">
                        DIGEMID
                      </div>
                      <div className="text-white/80">
                        Información oficial del MINSA
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mt-4">
                    Todos los medicamentos y farmacias provienen del registro
                    oficial del Ministerio de Salud del Perú.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden mt-8 bg-[#b8146f] rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-coral/20 rounded-xl">
                <Pill className="size-8 text-brand-coral" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">DIGEMID</div>
                <div className="text-white/80">Información oficial del MINSA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4 bg-brand-lavender dark:bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#db1a85] mb-2">
              Busca un medicamento
            </h2>
            <p className="text-muted-foreground">
              Encuentra precios y disponibilidad en farmacias cercanas.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: Paracetamol, ibuprofeno, amoxicilina..."
                  className="pl-10 h-12 text-base bg-card"
                  aria-label="Buscar medicamento"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!query.trim()}
                className="bg-brand-pink hover:bg-brand-pink/90 h-12"
              >
                Buscar
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Populares:
              </span>
              {["Paracetamol", "Ibuprofeno", "Amoxicilina", "Omeprazol"].map(
                (term) => (
                  <Link
                    key={term}
                    href={`/buscar?q=${encodeURIComponent(term)}`}
                  >
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 text-xs sm:text-sm"
                    >
                      {term}
                    </Badge>
                  </Link>
                )
              )}
            </div>
          </form>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              asChild
              className="bg-card hover:bg-accent border-[#db1a85]/30"
            >
              <Link href="/catalogo">
                <Pill className="size-4 mr-2 text-[#db1a85]" />
                Ver catálogo completo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#db1a85] mb-2">
                Farmacias cerca de ti
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Activa tu ubicación para ver las boticas más cercanas.
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/farmacias" className="gap-1">
                Ver todas
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {!coords && !locating && (
            <Card className="p-6 sm:p-8 text-center">
              <Navigation className="size-10 text-[#db1a85] mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-semibold mb-1">
                Encuentra farmacias cerca
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Compartir tu ubicación nos permite mostrarte las boticas más
                próximas. No guardamos tus coordenadas.
              </p>
              <Button
                onClick={requestLocation}
                className="bg-brand-teal hover:bg-brand-teal/90"
              >
                <MapPin className="size-4 mr-2" />
                Permitir ubicación
              </Button>
              {locationError && (
                <p className="text-sm text-destructive mt-3">{locationError}</p>
              )}
              <div className="sm:hidden mt-4">
                <Button variant="ghost" asChild>
                  <Link href="/farmacias" className="gap-1">
                    Ver todas
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {locating && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: NEARBY_LIMIT }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          )}

          {coords && !locating && (
            <>
              {nearbyQuery.isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: NEARBY_LIMIT }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                  ))}
                </div>
              )}

              {nearbyQuery.error && (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No pudimos cargar las farmacias. Intenta nuevamente.
                  </p>
                </Card>
              )}

              {!nearbyQuery.isLoading &&
                !nearbyQuery.error &&
                nearbyPharmacies.length === 0 && (
                  <Card className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      No encontramos farmacias dentro de {NEARBY_RADIUS_KM} km
                      de tu ubicación.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/farmacias">Ver todas las farmacias</Link>
                    </Button>
                  </Card>
                )}

              {nearbyPharmacies.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {nearbyPharmacies.slice(0, NEARBY_LIMIT).map((pharmacy) => (
                    <Link
                      key={pharmacy.id}
                      href={`/farmacias/${pharmacy.slug}`}
                      className="block h-full"
                    >
                      <Card className="group h-full flex flex-col hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-[#db1a85] p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-base group-hover:text-[#db1a85] transition-colors line-clamp-2">
                            {pharmacy.name}
                          </h3>
                          {pharmacy.is_24h && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 shrink-0"
                            >
                              <Clock className="size-3 mr-1" />
                              24h
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 space-y-2 text-sm">
                          {pharmacy.street && (
                            <p className="text-muted-foreground line-clamp-2 flex items-start gap-1">
                              <MapPin className="size-3.5 shrink-0 mt-0.5" />
                              <span>
                                {pharmacy.street}
                                {pharmacy.city ? `, ${pharmacy.city}` : ""}
                              </span>
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs">
                            {typeof pharmacy.distance_km === "number" && (
                              <span className="font-medium text-brand-teal">
                                a {pharmacy.distance_km.toFixed(1)} km
                              </span>
                            )}
                            {pharmacy.is_verified && (
                              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="size-3" />
                                Verificada
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1 text-[#db1a85] text-sm font-medium mt-3">
                          Ver detalle
                          <ArrowRight className="size-4" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section
        id="features"
        className="py-12 sm:py-16 px-4 bg-card border-y"
      >
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#db1a85]">
              ¿Por qué elegir FarmaNexo?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto px-4">
              Tres pilares que nos hacen diferentes: Ahorro, Seguridad y
              Conveniencia.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-[#db1a85]/20">
              <div className="rounded-full bg-[#db1a85]/10 p-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="size-6 sm:size-8 text-[#db1a85]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                Ahorro real
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Compara precios entre farmacias en segundos y elige la opción
                más conveniente sin salir de casa.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-[#db1a85]/20">
              <div className="rounded-full bg-brand-coral/10 p-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="size-6 sm:size-8 text-brand-coral" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                Conveniencia
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Encuentra farmacias cercanas con búsqueda geoespacial. Ver
                ubicación, horarios y llamar con un clic.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1 border-[#db1a85]/20">
              <div className="rounded-full bg-brand-success/10 p-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="size-6 sm:size-8 text-brand-success" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                Información confiable
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Datos actualizados del registro DIGEMID/MINSA. Cada producto
                incluye laboratorio, registro sanitario y presentación
                verificada.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-[#db1a85]/10 dark:bg-[#db1a85]/5 py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-3 text-center">
            <Heart className="size-5 text-[#db1a85] shrink-0" />
            <p className="text-sm sm:text-base">
              <span className="font-semibold text-[#db1a85]">
                Comparar precios también es cuidar tu salud.
              </span>
              <span className="text-muted-foreground ml-2">
                La información tiene un enfoque preventivo y educativo. No
                reemplazamos la consulta médica.
              </span>
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-[#b8146f] text-white py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Pill className="size-5 text-white" />
                </div>
                <span className="font-bold text-xl">FarmaNexo</span>
              </div>
              <p className="text-white/70 text-sm">
                Acceso transparente a medicamentos y farmacias registradas en
                DIGEMID/MINSA.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Enlaces rápidos</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/catalogo"
                    className="hover:text-white transition-colors"
                  >
                    Catálogo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/farmacias"
                    className="hover:text-white transition-colors"
                  >
                    Farmacias
                  </Link>
                </li>
                <li>
                  <Link
                    href="/buscar"
                    className="hover:text-white transition-colors"
                  >
                    Buscar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/registro"
                    className="hover:text-white transition-colors"
                  >
                    Regístrate
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors"
                  >
                    Mi cuenta
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="hover:text-white transition-colors cursor-pointer">
                  Términos y condiciones
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Política de privacidad
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Protección de datos de salud
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <Mail className="size-4" />
                  contacto@farmanexo.pe
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4" />
                  +51 903 095 017
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="size-4" />
                  Lima, Perú
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 p-4 rounded-xl bg-[#db1a85]/30 border border-white/10">
            <div className="flex items-start gap-3">
              <Pill className="size-5 text-brand-coral shrink-0 mt-0.5" />
              <p className="text-sm text-white/80">
                <span className="font-semibold text-white">
                  Nota de seguridad:
                </span>{" "}
                La información en FarmaNexo es preventiva y educativa. No
                realizamos diagnósticos médicos ni reemplazamos la atención
                profesional.
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
            <p>© 2026 FarmaNexo. Todos los derechos reservados.</p>
            <p className="mt-2 text-xs">
              Construyendo un sistema farmacéutico más justo, transparente y
              centrado en las personas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
