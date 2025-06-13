import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Data } from "@/app/types"

// Helper to interpolate color between green (0) and red (4)
function getColor(value: number) {
    const v = Math.max(0, Math.min(4, value))
    const r = Math.round((v / 4) * 255)
    const g = Math.round((1 - v / 4) * 128)
    return `rgb(${r},${g},0)`
}

// Generate a Leaflet icon with a colored SVG
function getColoredIcon(value: number) {
    const color = getColor(value)
    const svg = encodeURIComponent(`
        <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="16" cy="20" rx="12" ry="12" fill="${color}" stroke="black" stroke-width="2"/>
            <rect x="14" y="32" width="4" height="8" rx="2" fill="${color}" stroke="black" stroke-width="2"/>
        </svg>
    `)
    return L.icon({
        iconUrl: `data:image/svg+xml,${svg}`,
        iconSize: [32, 41],
        iconAnchor: [16, 41],
    })
}

interface LeafletMapProps {
    locations: Data[]
    onMarkerClick: (locationId: string) => void
}

function calculateWqiValue(location: Data): number {
    const wqiValues = Object.values(location.wqi);
    return wqiValues.reduce((sum, { value }) => sum + value, 0) / wqiValues.length;
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
            icon={getColoredIcon(calculateWqiValue(entry))}
            eventHandlers={{
            click: () => onMarkerClick(String(entry.location.id)),
            }}
        />
        ))}
    </MapContainer>
    );
}
