"use client";

import type React from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Loader2,
  Pill,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFarmaNexoStore } from "@/lib/farmanexo-store";
import { useSearchProducts } from "@/lib/api/hooks/use-products";
import type { SearchProductsRequest } from "@/lib/api/types";
import { ProductImage } from "@/components/product-image";

type PrescriptionFilter = "all" | "prescription" | "otc";

const PAGE_SIZE = 24;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function BuscarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [filterBy, setFilterBy] = useState<PrescriptionFilter>("all");
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const { favorites, toggleFavorite } = useFarmaNexoStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const debouncedQuery = useDebouncedValue(searchInput, DEBOUNCE_MS);
  const trimmedQuery = debouncedQuery.trim();
  const hasValidQuery = trimmedQuery.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    setPage(1);
  }, [trimmedQuery, filterBy]);

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (trimmedQuery === current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    router.replace(qs ? `/buscar?${qs}` : "/buscar", { scroll: false });
  }, [trimmedQuery, router, searchParams]);

  const searchBody = useMemo<SearchProductsRequest>(
    () => ({
      query: trimmedQuery,
      requires_prescription:
        filterBy === "prescription"
          ? true
          : filterBy === "otc"
            ? false
            : undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [trimmedQuery, filterBy, page]
  );

  const { data, isLoading, isFetching, error } = useSearchProducts(
    searchBody,
    hasValidQuery
  );

  const handleToggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(productId);
  };

  const products = data?.products ?? [];
  const totalPages = data?.total_pages ?? 0;

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
                Buscar medicamentos
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Encuentra medicamentos por nombre, ingrediente activo o
                laboratorio.
              </p>
            </div>

            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Ej: Paracetamol, ibuprofeno, amoxicilina..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10"
                      autoFocus
                      aria-label="Buscar medicamentos"
                    />
                    {isFetching && hasValidQuery && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  <Select
                    value={filterBy}
                    onValueChange={(v) => setFilterBy(v as PrescriptionFilter)}
                  >
                    <SelectTrigger className="sm:w-[180px]">
                      <SelectValue placeholder="Filtrar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="prescription">Con receta</SelectItem>
                      <SelectItem value="otc">Venta libre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {!hasValidQuery && (
              <Card className="p-8 sm:p-12">
                <div className="text-center">
                  <Search className="size-10 sm:size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Escribe para comenzar
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ingresa al menos {MIN_QUERY_LENGTH} caracteres para buscar
                    entre los medicamentos registrados.
                  </p>
                </div>
              </Card>
            )}

            {hasValidQuery && error && (
              <Card className="p-8 sm:p-12">
                <div className="text-center">
                  <AlertCircle className="size-10 sm:size-12 text-destructive mx-auto mb-4 opacity-70" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    No se pudo realizar la búsqueda
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Intenta nuevamente en unos segundos.
                  </p>
                </div>
              </Card>
            )}

            {hasValidQuery && isLoading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            )}

            {hasValidQuery && data && !error && !isLoading && (
              <>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {data.total > 0 ? (
                    <>
                      {data.total}{" "}
                      {data.total === 1 ? "resultado" : "resultados"} para{" "}
                      <span className="font-medium text-foreground">
                        “{trimmedQuery}”
                      </span>
                      {totalPages > 1 && (
                        <>
                          {" "}
                          · Página {page} de {totalPages}
                        </>
                      )}
                    </>
                  ) : null}
                </div>

                {products.length === 0 ? (
                  <Card className="p-8 sm:p-12">
                    <div className="text-center">
                      <Pill className="size-10 sm:size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-base sm:text-lg font-semibold mb-2">
                        Sin resultados
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        No encontramos medicamentos para{" "}
                        <span className="font-medium text-foreground">
                          “{trimmedQuery}”
                        </span>
                        . Prueba con otro término o revisa la ortografía.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((product) => {
                      const isFavorite =
                        mounted && favorites.includes(product.id);

                      return (
                        <Link
                          key={product.id}
                          href={`/medicamento/${product.slug}`}
                          className="block h-full"
                        >
                          <Card
                            className={cn(
                              "group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-transparent h-full flex flex-col overflow-hidden",
                              "hover:border-l-[#db1a85]"
                            )}
                          >
                            <ProductImage
                              product={product}
                              aspectRatio="banner"
                              className="rounded-none"
                            />
                            <CardHeader className="pb-3 shrink-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base sm:text-lg group-hover:text-[#db1a85] transition-colors line-clamp-2 leading-tight min-h-[2.75rem] sm:min-h-[3.25rem]">
                                    {product.name}
                                  </CardTitle>
                                  <CardDescription className="mt-1 text-xs sm:text-sm line-clamp-1 min-h-[1.25rem]">
                                    {product.active_ingredient ?? "—"}
                                    {product.concentration
                                      ? ` · ${product.concentration}`
                                      : ""}
                                  </CardDescription>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "shrink-0 size-8 sm:size-9",
                                    isFavorite
                                      ? "text-[#db1a85] hover:text-[#db1a85]/80"
                                      : "text-muted-foreground hover:text-[#db1a85]"
                                  )}
                                  onClick={(e) =>
                                    handleToggleFavorite(e, product.id)
                                  }
                                  aria-label={
                                    isFavorite
                                      ? "Quitar de favoritos"
                                      : "Agregar a favoritos"
                                  }
                                >
                                  <Heart
                                    className={cn(
                                      "size-4 sm:size-5",
                                      isFavorite && "fill-current"
                                    )}
                                  />
                                </Button>
                              </div>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col gap-3 pb-4">
                              <div className="flex flex-wrap gap-1 sm:gap-2 min-h-[1.5rem]">
                                {product.requires_prescription ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                  >
                                    <AlertCircle className="size-3 mr-1" />
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
                                  <Badge
                                    variant="secondary"
                                    className="text-xs font-normal"
                                  >
                                    {product.form}
                                  </Badge>
                                )}
                              </div>

                              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs sm:text-sm">
                                <dt className="text-muted-foreground">
                                  Presentación
                                </dt>
                                <dd className="font-medium text-right line-clamp-1">
                                  {product.presentation ?? "—"}
                                </dd>
                                <dt className="text-muted-foreground">
                                  Laboratorio
                                </dt>
                                <dd className="font-medium text-right line-clamp-1">
                                  {product.manufacturer ?? "—"}
                                </dd>
                                <dt className="text-muted-foreground">
                                  Registro
                                </dt>
                                <dd className="font-mono text-right line-clamp-1">
                                  {product.registry_number ?? "—"}
                                </dd>
                              </dl>
                            </CardContent>

                            <CardFooter className="pt-0 mt-auto">
                              <Button
                                className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white transition-colors text-xs sm:text-sm"
                                size="sm"
                              >
                                <Eye className="size-3 sm:size-4 mr-1 sm:mr-2" />
                                Ver disponibilidad
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="size-4" />
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                    >
                      Siguiente
                      <ChevronRight className="size-4" />
                    </Button>
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

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-brand-pink" />
        </div>
      }
    >
      <BuscarContent />
    </Suspense>
  );
}
