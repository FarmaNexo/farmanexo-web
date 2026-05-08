"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  AlertCircle,
  Eye,
  Heart,
  Pill,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFarmaNexoStore } from "@/lib/farmanexo-store";
import { useProducts } from "@/lib/api/hooks/use-products";
import type { Product } from "@/lib/api/types";
import { ProductImage } from "@/components/product-image";

type SortOption = "name-asc" | "name-desc";
type FilterOption = "all" | "prescription" | "otc";

const PAGE_SIZE = 24;

export default function CatalogoPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [mounted, setMounted] = useState(false);

  const { favorites, toggleFavorite } = useFarmaNexoStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error } = useProducts(page, PAGE_SIZE);

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [] as Product[];
    let list = [...data.products];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.active_ingredient?.toLowerCase().includes(term) ||
          p.manufacturer?.toLowerCase().includes(term)
      );
    }

    if (filterBy === "prescription") {
      list = list.filter((p) => p.requires_prescription);
    } else if (filterBy === "otc") {
      list = list.filter((p) => !p.requires_prescription);
    }

    list.sort((a, b) =>
      sortBy === "name-asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

    return list;
  }, [data, searchTerm, sortBy, filterBy]);

  const handleToggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(productId);
  };

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
                Catálogo de Medicamentos
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {data
                  ? `Explora ${data.total} medicamentos registrados en DIGEMID/MINSA`
                  : "Cargando medicamentos..."}
              </p>
            </div>

            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar medicamento, ingrediente, laboratorio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={filterBy}
                    onValueChange={(v) => setFilterBy(v as FilterOption)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="prescription">Con receta</SelectItem>
                      <SelectItem value="otc">Venta libre</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as SortOption)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="p-8 sm:p-12">
                <div className="text-center">
                  <AlertCircle className="size-10 sm:size-12 text-destructive mx-auto mb-4 opacity-70" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    No se pudo cargar el catálogo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Intenta nuevamente en unos segundos.
                  </p>
                </div>
              </Card>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            )}

            {data && !isLoading && !error && (
              <>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Mostrando {filteredProducts.length} de {data.total}{" "}
                  medicamentos · Página {page} de {data.total_pages}
                </div>

                {filteredProducts.length === 0 ? (
                  <Card className="p-8 sm:p-12">
                    <div className="text-center">
                      <Pill className="size-10 sm:size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-base sm:text-lg font-semibold mb-2">
                        No se encontraron medicamentos
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Intenta ajustar los filtros o el término de búsqueda.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredProducts.map((product) => {
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

                {data.total_pages > 1 && (
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
                      Página {page} de {data.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(data.total_pages, p + 1))
                      }
                      disabled={page >= data.total_pages}
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
