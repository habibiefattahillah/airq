import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Data } from "@/app/types"

function getColoredIcon(value: number) {
    function interpolateColor(value: number) {
        const v = Math.max(0, Math.min(4, value));
        if (v <= 2) {
            const t = v / 2;
            const r = Math.round((1 - t) * 11 + t * 255);
            const g = Math.round((1 - t) * 254 + t * 185);
            const b = Math.round((1 - t) * 2 + t * 1);
            return `rgb(${r},${g},${b})`;
        } else {
            const t = (v - 2) / 2;
            const r = Math.round((1 - t) * 255 + t * 254);
            const g = Math.round((1 - t) * 185 + t * 0);
            const b = Math.round((1 - t) * 1 + t * 0);
            return `rgb(${r},${g},${b})`;
        }
    }

    const color = interpolateColor(value);
    const svg = encodeURIComponent(`
        <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="16" cy="20" rx="12" ry="12" fill="${color}" stroke="black" stroke-width="2"/>
            <rect x="14" y="32" width="4" height="8" rx="2" fill="${color}" stroke="black" stroke-width="2"/>
        </svg>
    `);
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
