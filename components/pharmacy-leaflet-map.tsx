"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Pharmacy } from "@/lib/api/types";

const DEFAULT_ICON = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const USER_ICON = new L.DivIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 2px rgba(37,99,235,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type UserLocation = { lat: number; lng: number };

interface PharmacyLeafletMapProps {
  pharmacies: Pharmacy[];
  center?: [number, number];
  zoom?: number;
  userLocation?: UserLocation;
  height?: string;
  selectedId?: string;
  onMarkerClick?: (pharmacy: Pharmacy) => void;
}

function FitBoundsOnData({
  points,
}: {
  points: Array<[number, number]>;
}) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], Math.max(map.getZoom(), 15));
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

export function PharmacyLeafletMap({
  pharmacies,
  center,
  zoom = 14,
  userLocation,
  height = "400px",
  selectedId,
  onMarkerClick,
}: PharmacyLeafletMapProps) {
  const geocoded = useMemo(
    () =>
      pharmacies.filter(
        (p) =>
          Number.isFinite(p.latitude) &&
          Number.isFinite(p.longitude) &&
          (p.latitude !== 0 || p.longitude !== 0)
      ),
    [pharmacies]
  );

  const points = useMemo<Array<[number, number]>>(() => {
    const arr: Array<[number, number]> = geocoded.map((p) => [
      p.latitude,
      p.longitude,
    ]);
    if (userLocation) arr.push([userLocation.lat, userLocation.lng]);
    return arr;
  }, [geocoded, userLocation]);

  const fallbackCenter: [number, number] =
    center ??
    (points.length > 0
      ? points[0]
      : userLocation
        ? [userLocation.lat, userLocation.lng]
        : [-12.1215, -77.0298]);

  if (geocoded.length === 0 && !userLocation) {
    return (
      <div
        className="rounded-lg border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        Sin coordenadas disponibles para mostrar en el mapa.
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border" style={{ height }}>
      <MapContainer
        center={fallbackCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBoundsOnData points={points} />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={USER_ICON}
          >
            <Popup>Tu ubicación</Popup>
          </Marker>
        )}

        {geocoded.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={DEFAULT_ICON}
            eventHandlers={
              onMarkerClick ? { click: () => onMarkerClick(p) } : undefined
            }
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold text-sm">{p.name}</p>
                {p.street && (
                  <p className="text-xs text-gray-600">
                    {p.street}
                    {p.city ? `, ${p.city}` : ""}
                  </p>
                )}
                {typeof p.distance_km === "number" && (
                  <p className="text-xs text-gray-500">
                    {p.distance_km.toFixed(2)} km
                  </p>
                )}
                <a
                  href={`/farmacias/${p.slug}`}
                  className="text-xs text-brand-pink hover:underline"
                >
                  Ver detalle →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedId ? null : null}
      </MapContainer>
    </div>
  );
}
