"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Navigation, Phone, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { PharmacyBranch, LocationData } from "@/lib/types"

declare global {
    interface Window {
        google?: any
        __googleMapsScriptLoading?: Promise<any>
    }
}

interface PharmacyMapProps {
    branches: PharmacyBranch[]
    userLocation?: LocationData
    selectedBranchId?: string
    onBranchSelect?: (branchId: string) => void
}

export function PharmacyMap({ branches, userLocation, selectedBranchId, onBranchSelect }: PharmacyMapProps) {
    const [selectedBranch, setSelectedBranch] = useState<PharmacyBranch | null>(null)
    const [mapError, setMapError] = useState<string | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])
    const userMarkerRef = useRef<any>(null)

    useEffect(() => {
        if (selectedBranchId) {
            const branch = branches.find((b) => b.id === selectedBranchId)
            if (branch) {
                setSelectedBranch(branch)
            }
        }
    }, [selectedBranchId, branches])

    const handleBranchClick = (branch: PharmacyBranch) => {
        setSelectedBranch(branch)
        onBranchSelect?.(branch.id)
    }

    const handleOpenInMaps = (branch: PharmacyBranch) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${branch.coordinates.lat},${branch.coordinates.lng}`
        window.open(url, "_blank")
    }

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

    const loadGoogleMaps = (apiKey: string) => {
        if (typeof window === "undefined") {
            return Promise.reject(new Error("Google Maps solo está disponible en el navegador"))
        }
        if (window.google?.maps) {
            return Promise.resolve(window.google.maps)
        }
        if (window.__googleMapsScriptLoading) {
            return window.__googleMapsScriptLoading
        }
        window.__googleMapsScriptLoading = new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`
            script.async = true
            script.defer = true
            script.onload = () => resolve(window.google.maps)
            script.onerror = () => reject(new Error("No se pudo cargar Google Maps"))
            document.head.appendChild(script)
        })
        return window.__googleMapsScriptLoading
    }

    const clearMarkers = () => {
        markersRef.current.forEach((marker) => marker.setMap(null))
        markersRef.current = []
        if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null)
            userMarkerRef.current = null
        }
    }

    const getMapCenter = () => {
        if (userLocation) return userLocation
        if (branches.length > 0) return branches[0].coordinates
        return { lat: -12.0464, lng: -77.0306 }
    }

    useEffect(() => {
        if (!mapContainerRef.current) return
        if (!googleMapsApiKey) {
            setMapError("Falta configurar la API Key de Google Maps para mostrar el mapa.")
            return
        }

        let cancelled = false

        loadGoogleMaps(googleMapsApiKey)
            .then((googleMaps) => {
                if (cancelled || !mapContainerRef.current) return

                if (!mapInstanceRef.current) {
                    mapInstanceRef.current = new googleMaps.Map(mapContainerRef.current, {
                        center: getMapCenter(),
                        zoom: 13,
                        fullscreenControl: false,
                        mapTypeControl: false,
                        streetViewControl: false,
                    })
                }

                const map = mapInstanceRef.current
                const bounds = new googleMaps.LatLngBounds()

                clearMarkers()

                if (userLocation) {
                    const userPosition = new googleMaps.LatLng(userLocation.lat, userLocation.lng)
                    userMarkerRef.current = new googleMaps.Marker({
                        position: userPosition,
                        map,
                        title: "Tu ubicación",
                        icon: {
                            path: googleMaps.SymbolPath.CIRCLE,
                            scale: 7,
                            fillColor: "#0ec1ac",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        },
                    })
                    bounds.extend(userPosition)
                }

                branches.forEach((branch) => {
                    const position = new googleMaps.LatLng(branch.coordinates.lat, branch.coordinates.lng)
                    const isSelected = selectedBranchId === branch.id
                    const marker = new googleMaps.Marker({
                        position,
                        map,
                        title: branch.pharmacyName,
                        icon: {
                            path: googleMaps.SymbolPath.CIRCLE,
                            scale: isSelected ? 9 : 7,
                            fillColor: isSelected ? "#db1a85" : "#0ec1ac",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        },
                    })
                    marker.addListener("click", () => handleBranchClick(branch))
                    markersRef.current.push(marker)
                    bounds.extend(position)
                })

                if (!bounds.isEmpty()) {
                    map.fitBounds(bounds, 60)
                } else {
                    map.setCenter(getMapCenter())
                    map.setZoom(13)
                }
                setMapError(null)
            })
            .catch((error) => {
                console.error("[v0] Error cargando Google Maps:", error)
                setMapError("No se pudo cargar el mapa. Verifica tu conexión o API Key.")
            })

        return () => {
            cancelled = true
        }
    }, [googleMapsApiKey, branches, userLocation, selectedBranchId])

    return (
        <div className="space-y-4">
            <Card className="relative overflow-hidden bg-muted" style={{ height: "500px" }}>
                {mapError ? (
                    <div className="h-full w-full flex items-center justify-center p-6">
                        <div className="max-w-md text-center space-y-3">
                            <AlertCircle className="size-10 text-destructive mx-auto" />
                            <h3 className="font-semibold text-lg">Mapa no disponible</h3>
                            <p className="text-sm text-muted-foreground">{mapError}</p>
                            <p className="text-xs text-muted-foreground">
                                Configura `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para habilitar el mapa.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div ref={mapContainerRef} className="h-full w-full" />
                        {branches.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg text-center max-w-md">
                                    <MapPin className="size-12 text-brand-teal mx-auto mb-2" />
                                    <h3 className="font-semibold text-lg">Mapa de farmacias</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Busca un medicamento y selecciona tu ubicación para ver farmacias cercanas.
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {selectedBranch && (
                <Dialog open={!!selectedBranch} onOpenChange={() => setSelectedBranch(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedBranch.pharmacyName}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <MapPin className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Dirección</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedBranch.address}, {selectedBranch.district}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Clock className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Horario</p>
                                        <p className="text-sm text-muted-foreground">{selectedBranch.hours}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Phone className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Teléfono</p>
                                        <p className="text-sm text-muted-foreground">{selectedBranch.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 gap-2 bg-brand-teal hover:bg-brand-teal/90"
                                    onClick={() => handleOpenInMaps(selectedBranch)}
                                >
                                    <Navigation className="size-4" />
                                    Abrir en Google Maps
                                </Button>
                                <Button className="flex-1 gap-2 bg-transparent" variant="outline" asChild>
                                    <a href={`tel:${selectedBranch.phone}`}>
                                        <Phone className="size-4" />
                                        Llamar
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

