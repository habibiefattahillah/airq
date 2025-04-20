"use client"

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import { useEffect, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useMap } from "react-leaflet"

type Location = {
    id: number
    name: string
    latitude: number
    longitude: number
}

type Props = {
    existingLocations: Location[]
    onSelect: (data: { locationId: number | null; name: string | null; lat: number; lng: number }) => void
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

function SetViewOnMarker({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap()
    useEffect(() => {
        map.setView([lat, lng], map.getZoom(), { animate: true })
    }, [lat, lng, map])
    return null
}

export default function LeafletInputMap({ existingLocations, onSelect }: Props) {
    const defaultCenter: [number, number] = [-6.2, 106.8] // Jakarta
    const [selectedMarker, setSelectedMarker] = useState<{ lat: number; lng: number }>({
        lat: defaultCenter[0],
        lng: defaultCenter[1],
    })
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
    const [initialCenter, setInitialCenter] = useState<[number, number]>(defaultCenter)

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("Geolocation succeeded:", position)
                    const lat = position.coords.latitude
                    const lng = position.coords.longitude
                    console.log("Latitude:", lat, "Longitude:", lng)
                    setInitialCenter([lat, lng])
                    setSelectedMarker({ lat, lng })
                    onSelect({ locationId: null, name: null, lat, lng })
                },
                (error) => {
                    console.warn("Geolocation failed, falling back to Jakarta:", error)
                    const [lat, lng] = defaultCenter
                    setInitialCenter([lat, lng])
                    setSelectedMarker({ lat, lng })
                    onSelect({ locationId: null, name: null, lat, lng })
                }
            )
        } else {
            const [lat, lng] = defaultCenter
            setInitialCenter([lat, lng])
            setSelectedMarker({ lat, lng })
            onSelect({ locationId: null, name: null, lat, lng })
        }
    }, [])


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
        onSelect({ locationId: loc.id, name: loc.name, lat: loc.latitude, lng: loc.longitude })
    }

    return (
        <div className="h-[300px] w-full rounded overflow-hidden">
            <MapContainer
                center={initialCenter}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler />
                <SetViewOnMarker lat={selectedMarker.lat} lng={selectedMarker.lng} />

                {existingLocations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.latitude, loc.longitude]}
                        eventHandlers={{
                            click: () => handleExistingMarkerClick(loc),
                        }}
                    >
                        <Popup>{loc.name}</Popup>
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
