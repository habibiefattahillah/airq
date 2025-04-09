"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import SidebarPeta from "./sidebar" // We'll define this

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = defaultIcon

interface DataPoint {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  // Add other properties as needed
}

export default function PetaPage() {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
    const [selectedData, setSelectedData] = useState<DataPoint | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        const res = await fetch("/api/data")
        const json = await res.json()
        setDataPoints(json)
        }
        fetchData()
    }, [])

    return (
        <div className="relative w-full h-screen">
        <MapContainer center={[-6.2, 106.8]} zoom={10} className="w-full h-full z-0">
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
            />
            {dataPoints.map((entry) => (
            <Marker
                key={entry.id}
                position={[entry.location.latitude, entry.location.longitude]}
                eventHandlers={{
                click: () => {
                    setSelectedData(entry)
                },
                }}
            />
            ))}
        </MapContainer>
        {selectedData && (
            <SidebarPeta data={selectedData} onClose={() => setSelectedData(null)} />
        )}
        </div>
    )
}
