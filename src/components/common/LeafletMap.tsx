// components/LeafletMap.tsx
"use client"

import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Data } from "@/app/types"

const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = defaultIcon

interface LeafletMapProps {
    locations: Data[]
    onMarkerClick: (locationId: string) => void
}

export default function LeafletMap({ locations, onMarkerClick }: LeafletMapProps) {
    return (
        <MapContainer center={[-6.2, 106.8]} zoom={10} className="w-full h-full z-0">
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
        />
        {locations.map((entry) => (
            <Marker
            key={entry.location.id}
            position={[entry.location.latitude, entry.location.longitude]}
            eventHandlers={{
                click: () => onMarkerClick(String(entry.location.id)),
            }}
            />
        ))}
        </MapContainer>
    )
}
