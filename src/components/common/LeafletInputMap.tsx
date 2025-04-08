"use client"

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import { useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type Location = {
    id: number
    name: string
    latitude: number
    longitude: number
}

type Props = {
    existingLocations: Location[]
    onSelect: (data: { locationId: number | null; name : string | null; lat: number; lng: number }) => void
}

// Fix for missing marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

export default function LeafletInputMap({ existingLocations, onSelect }: Props) {
    const [selectedMarker, setSelectedMarker] = useState<{ lat: number; lng: number } | null>(null)
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)

    const MapClickHandler = () => {
        useMapEvents({
        click(e) {
            const lat = e.latlng.lat
            const lng = e.latlng.lng
            setSelectedMarker({ lat, lng })
            setSelectedLocationId(null)
            onSelect({ locationId: null, name: null, lat, lng })
        },
        })
        return null
    }

    const handleExistingMarkerClick = (loc: Location) => {
        setSelectedLocationId(loc.id)
        setSelectedMarker(null)
        onSelect({ locationId: loc.id, name: loc.name, lat: loc.latitude, lng: loc.longitude })
    }

    return (
        <div className="h-[300px] w-full rounded overflow-hidden">
        <MapContainer
            center={[-6.2, 106.8]} // Jakarta default
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
        >
            <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler />

            {existingLocations.map((loc) => (
            <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
                eventHandlers={{
                click: () => handleExistingMarkerClick(loc),
                }}
            >
                <Popup>Lokasi ID: {loc.id}</Popup>
            </Marker>
            ))}

            {selectedMarker && selectedLocationId === null && (
            <Marker position={[selectedMarker.lat, selectedMarker.lng]}>
                <Popup>Lokasi Baru</Popup>
            </Marker>
            )}
        </MapContainer>
        </div>
    )
}
