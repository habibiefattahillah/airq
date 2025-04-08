"use client"

import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type Props = {
    lat: number
    lng: number
}

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

export default function LeafletStaticMap({ lat, lng }: Props) {
    return (
        <div className="h-[250px] w-full rounded overflow-hidden">
        <MapContainer
            center={[lat, lng]}
            zoom={13}
            scrollWheelZoom={false}
            dragging={false}
            doubleClickZoom={false}
            zoomControl={false}
            attributionControl={false}
            className="h-full w-full z-0"
        >
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} />
        </MapContainer>
        </div>
    )
}
