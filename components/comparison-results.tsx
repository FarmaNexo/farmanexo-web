"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Phone, Clock, TrendingDown, Navigation, AlertTriangle, Plus, Check, LogIn } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { DrugComparisonResult, Drug } from "@/lib/types"
import { calculateSavings } from "@/lib/search-service"
import { DrugDetailModal } from "@/components/drug-detail-modal"
import { useFarmaNexoStore } from "@/lib/farmanexo-store"
import { useIsAuthenticated } from "@/hooks/use-auth"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ComparisonResultsProps {
    results: DrugComparisonResult[]
    selectedDrug: Drug
    onViewMap: (branchId: string) => void
}

export function ComparisonResults({ results, selectedDrug, onViewMap }: ComparisonResultsProps) {
    const router = useRouter()
    const savings = calculateSavings(selectedDrug.id)
    const [sortBy, setSortBy] = useState<"price" | "distance">("price")
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [addedItems, setAddedItems] = useState<Set<string>>(new Set())

    const { addToShoppingList } = useFarmaNexoStore()
    const { isAuthenticated } = useIsAuthenticated()

    const sortedResults = [...results].sort((a, b) => {
        if (sortBy === "price") {
            return a.price.price - b.price.price
        } else {
            return (a.distance || 999) - (b.distance || 999)
        }
    })

    const getStockBadge = (status: string) => {
        switch (status) {
            case "IN_STOCK":
                return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs">En stock</Badge>
            case "LOW":
                return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">Stock bajo</Badge>
            case "OUT_OF_STOCK":
                return (
                    <Badge variant="destructive" className="text-xs">
                        Agotado
                    </Badge>
                )
            default:
                return null
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
        }).format(price)
    }

    const handleAddToList = (result: DrugComparisonResult) => {
        if (!isAuthenticated) {
            toast.error("Inicia sesión para agregar a tu lista", {
                action: {
                    label: "Iniciar sesión",
                    onClick: () => router.push("/login"),
                },
            })
            return
        }

        const itemKey = `${selectedDrug.id}-${result.branch.id}`

        if (addedItems.has(itemKey)) {
            toast.info("Este medicamento ya está en tu lista para esta farmacia")
            return
        }

        addToShoppingList(selectedDrug, result.branch, result.price, 1)
        setAddedItems((prev) => new Set(prev).add(itemKey))
        toast.success(`${selectedDrug.dci} agregado a tu lista`)
    }

    const openGoogleMaps = (result: DrugComparisonResult) => {
        const { lat, lng } = result.branch.coordinates
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        window.open(url, "_blank")
    }

    if (results.length === 0) {
        return (
            <Card className="p-8 text-center bg-card/50">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron resultados</h3>
                <p className="text-muted-foreground text-sm">
                    No hay farmacias con este medicamento en tu zona. Intenta ampliar el radio de búsqueda.
                </p>
            </Card>
        )
    }

    const lowestPrice = sortedResults[0]?.price.price || 0
    const highestPrice = sortedResults[sortedResults.length - 1]?.price.price || 0

    return (
        <div className="space-y-6">
            {/* Header con información del medicamento */}
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-[#db1a85]/10 to-[#0ec1ac]/10 border-[#db1a85]/20">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{selectedDrug.dci}</h2>
                            <Badge variant={selectedDrug.requiresPrescription ? "destructive" : "secondary"} className="text-xs">
                                {selectedDrug.requiresPrescription ? "Con receta" : "Venta libre"}
                            </Badge>
                        </div>
                        {selectedDrug.commercialNames && selectedDrug.commercialNames.length > 0 && (
                            <p className="text-sm text-muted-foreground mb-3">
                                También conocido como: {selectedDrug.commercialNames.slice(0, 3).join(", ")}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-sm">
                            <Badge variant="outline" className="font-normal">
                                {selectedDrug.concentration}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                                {selectedDrug.pharmaceuticalForm}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2">
                        {savings && savings.savingsPercentage !== null && savings.savingsPercentage > 0 && (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <TrendingDown className="h-5 w-5" />
                                <span className="font-semibold">Ahorra hasta {savings.savingsPercentage.toFixed(0)}%</span>
                            </div>
                        )}
                        <Button variant="link" className="p-0 h-auto text-[#db1a85]" onClick={() => setIsDetailModalOpen(true)}>
                            Ver detalles del medicamento
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Ordenamiento */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{results.length}</span> farmacias encontradas
                </p>
                <div className="flex gap-2">
                    <Button
                        variant={sortBy === "price" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy("price")}
                        className={sortBy === "price" ? "bg-[#db1a85] hover:bg-[#b8146f] text-white" : "bg-transparent"}
                    >
                        Ordenar por precio
                    </Button>
                    <Button
                        variant={sortBy === "distance" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy("distance")}
                        className={sortBy === "distance" ? "bg-[#db1a85] hover:bg-[#b8146f] text-white" : "bg-transparent"}
                    >
                        Ordenar por distancia
                    </Button>
                </div>
            </div>

            {/* Lista de resultados */}
            <div className="grid gap-4">
                {sortedResults.map((result, index) => {
                    const isLowest = result.price.price === lowestPrice
                    const isHighest = result.price.price === highestPrice && lowestPrice !== highestPrice
                    const itemKey = `${selectedDrug.id}-${result.branch.id}`
                    const isAdded = addedItems.has(itemKey)

                    return (
                        <Card
                            key={result.branch.id}
                            className={cn(
                                "p-4 sm:p-6 transition-all hover:shadow-md",
                                isLowest && "ring-2 ring-green-500/50 bg-green-50/50 dark:bg-green-950/20",
                                isHighest && "opacity-75",
                            )}
                        >
                            {isLowest && <Badge className="mb-3 bg-green-500 hover:bg-green-600 text-white">Mejor precio</Badge>}

                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                {/* Info de farmacia */}
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-lg">{result.branch.pharmacyName}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{result.branch.address}</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                        {result.distance && (
                                            <span className="flex items-center gap-1">
                                                <Navigation className="h-3 w-3" />
                                                {result.distance.toFixed(1)} km
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {result.branch.hours}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {result.branch.phone}
                                        </span>
                                    </div>

                                    {getStockBadge(result.price.stockStatus)}
                                </div>

                                <Separator className="lg:hidden" />

                                {/* Precio y acciones */}
                                <div className="flex flex-col items-start lg:items-end gap-3">
                                    <div className="text-right">
                                        <p className="text-2xl sm:text-3xl font-bold text-[#db1a85]">{formatPrice(result.price.price)}</p>
                                        {result.drug.isGeneric && (
                                            <Badge variant="secondary" className="mt-1 text-xs">
                                                Genérico
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openGoogleMaps(result)}
                                            className="flex-1 lg:flex-none bg-transparent"
                                        >
                                            <Navigation className="h-4 w-4 mr-1" />
                                            Cómo llegar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAddToList(result)}
                                            disabled={result.price.stockStatus === "OUT_OF_STOCK"}
                                            className={cn(
                                                "flex-1 lg:flex-none text-white",
                                                isAdded
                                                    ? "bg-green-500 hover:bg-green-600"
                                                    : "bg-brand-coral hover:bg-brand-coral/90",
                                            )}
                                        >
                                            {!isAuthenticated ? (
                                                <>
                                                    <LogIn className="h-4 w-4 mr-1" />
                                                    Iniciar sesión
                                                </>
                                            ) : isAdded ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Agregado
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Agregar al carrito
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Modal de detalle */}
            <DrugDetailModal drug={selectedDrug} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
        </div>
    )
}

