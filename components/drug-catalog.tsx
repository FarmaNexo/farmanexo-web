"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pill, Search, Heart, AlertCircle, CheckCircle2, TrendingDown } from "lucide-react"
import type { Drug, DrugPrice } from "@/lib/types"
import { mockDrugs, mockPrices } from "@/lib/farmanexo-data"
import { cn } from "@/lib/utils"
import { DrugDetailModal } from "@/components/drug-detail-modal"
import { useFarmaNexoStore } from "@/lib/farmanexo-store"

interface DrugCatalogProps {
    onDrugSelect: (drug: Drug) => void
}

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc"
type FilterOption = "all" | "generic" | "branded" | "prescription" | "otc"

interface DrugWithPrices extends Drug {
    avgPrice: number
    minPrice: number
    maxPrice: number
    priceCount: number
}

export function DrugCatalog({ onDrugSelect }: DrugCatalogProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState<SortOption>("name-asc")
    const [filterBy, setFilterBy] = useState<FilterOption>("all")
    const [selectedDrugForDetail, setSelectedDrugForDetail] = useState<Drug | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    const { favorites, toggleFavorite } = useFarmaNexoStore()

    useEffect(() => {
        setMounted(true)
    }, [])

    const drugsWithPrices = useMemo((): DrugWithPrices[] => {
        return mockDrugs.map((drug: Drug) => {
            const prices = mockPrices.filter((p: DrugPrice) => p.drugId === drug.id)
            const avgPrice =
                prices.length > 0 ? prices.reduce((sum: number, p: DrugPrice) => sum + p.price, 0) / prices.length : 0
            const minPrice = prices.length > 0 ? Math.min(...prices.map((p: DrugPrice) => p.price)) : 0
            const maxPrice = prices.length > 0 ? Math.max(...prices.map((p: DrugPrice) => p.price)) : 0
            return { ...drug, avgPrice, minPrice, maxPrice, priceCount: prices.length }
        })
    }, [])

    const filteredDrugs = useMemo((): DrugWithPrices[] => {
        let filtered = drugsWithPrices

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (drug: DrugWithPrices) =>
                    drug.dci.toLowerCase().includes(term) ||
                    drug.commercialNames?.some((name: string) => name.toLowerCase().includes(term)) ||
                    drug.laboratory.toLowerCase().includes(term),
            )
        }

        if (filterBy === "generic") {
            filtered = filtered.filter((drug: DrugWithPrices) => drug.isGeneric)
        } else if (filterBy === "branded") {
            filtered = filtered.filter((drug: DrugWithPrices) => !drug.isGeneric)
        } else if (filterBy === "prescription") {
            filtered = filtered.filter((drug: DrugWithPrices) => drug.requiresPrescription)
        } else if (filterBy === "otc") {
            filtered = filtered.filter((drug: DrugWithPrices) => !drug.requiresPrescription)
        }

        filtered.sort((a: DrugWithPrices, b: DrugWithPrices) => {
            switch (sortBy) {
                case "name-asc":
                    return a.dci.localeCompare(b.dci)
                case "name-desc":
                    return b.dci.localeCompare(a.dci)
                case "price-asc":
                    return a.minPrice - b.minPrice
                case "price-desc":
                    return b.maxPrice - a.maxPrice
                default:
                    return 0
            }
        })

        return filtered
    }, [drugsWithPrices, searchTerm, sortBy, filterBy])

    const handleDrugClick = (drug: Drug) => {
        setSelectedDrugForDetail(drug)
        setIsDetailModalOpen(true)
    }

    const handleComparePrices = () => {
        if (selectedDrugForDetail) {
            onDrugSelect(selectedDrugForDetail)
            setIsDetailModalOpen(false)
        }
    }

    const handleToggleFavorite = (e: React.MouseEvent, drugId: string) => {
        e.stopPropagation()
        toggleFavorite(drugId)
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold">Catálogo de Medicamentos</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Explora nuestra base de datos con {mockDrugs.length} medicamentos disponibles
                </p>
            </div>

            <Card>
                <CardContent className="pt-4 sm:pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="relative sm:col-span-2 lg:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar medicamento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="generic">Genéricos</SelectItem>
                                <SelectItem value="branded">De marca</SelectItem>
                                <SelectItem value="prescription">Con receta</SelectItem>
                                <SelectItem value="otc">Venta libre</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Ordenar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                                <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                                <SelectItem value="price-asc">Menor precio</SelectItem>
                                <SelectItem value="price-desc">Mayor precio</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="text-xs sm:text-sm text-muted-foreground">
                Mostrando {filteredDrugs.length} de {mockDrugs.length} medicamentos
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredDrugs.map((drug: DrugWithPrices) => {
                    const isFavorite = mounted && favorites.includes(drug.id)

                    return (
                        <Card
                            key={drug.id}
                            className={cn(
                                "group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-transparent",
                                "hover:border-l-[#db1a85]",
                            )}
                            onClick={() => handleDrugClick(drug)}
                        >
                            <CardHeader className="pb-2 sm:pb-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base sm:text-lg group-hover:text-[#db1a85] transition-colors truncate">
                                            {drug.commercialNames?.[0] || drug.dci}
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-xs sm:text-sm truncate">
                                            {drug.dci} - {drug.concentration}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "shrink-0 size-8 sm:size-9",
                                            isFavorite
                                                ? "text-[#db1a85] hover:text-[#db1a85]/80"
                                                : "text-muted-foreground hover:text-[#db1a85]",
                                        )}
                                        onClick={(e) => handleToggleFavorite(e, drug.id)}
                                    >
                                        <Heart className={cn("size-4 sm:size-5", isFavorite && "fill-current")} />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-2 sm:space-y-3 pb-2 sm:pb-4">
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {drug.isGeneric && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                        >
                                            <CheckCircle2 className="size-3 mr-1" />
                                            Genérico
                                        </Badge>
                                    )}
                                    {drug.requiresPrescription && (
                                        <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                            <AlertCircle className="size-3 mr-1" />
                                            Receta
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-1 text-xs sm:text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Forma:</span>
                                        <span className="font-medium truncate ml-2">{drug.pharmaceuticalForm}</span>
                                    </div>
                                </div>

                                {drug.priceCount > 0 && (
                                    <div className="pt-2 sm:pt-3 border-t">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-xs sm:text-sm text-muted-foreground">Desde</span>
                                            <div className="text-right">
                                                <span className="text-xl sm:text-2xl font-bold text-[#db1a85]">
                                                    S/ {drug.minPrice.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            en {drug.priceCount} farmacia{drug.priceCount !== 1 ? "s" : ""}
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="pt-0">
                                <Button
                                    className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white transition-colors text-xs sm:text-sm"
                                    size="sm"
                                >
                                    <TrendingDown className="size-3 sm:size-4 mr-1 sm:mr-2" />
                                    Agregar al carrito
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {filteredDrugs.length === 0 && (
                <Card className="p-8 sm:p-12">
                    <div className="text-center">
                        <Pill className="size-10 sm:size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">No se encontraron medicamentos</h3>
                        <p className="text-sm text-muted-foreground">Intenta ajustar los filtros o el término de búsqueda.</p>
                    </div>
                </Card>
            )}

            <DrugDetailModal
                drug={selectedDrugForDetail}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onComparePrices={handleComparePrices}
            />
        </div>
    )
}

