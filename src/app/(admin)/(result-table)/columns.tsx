"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export type Account = {
    id: number
    name: string
    email: string
}

export type Location = {
    id: number
    name: string
    latitude: number
    longitude: number
}

export type Data = {
    id: number
    timestamp: string // ISO string, e.g., "2025-04-08T12:00:00Z"
    account: {
        id: number
        name: string
    }
    location: {
        id: number
        latitude: number
        longitude: number
    }
    parameters: {
        [key: string]: {
        value: number
        isImputed: boolean
        }
    }
    wqi: {
        [model: string]: {
        value: number
        confidence: number
        }
    }
}

export const columns: ColumnDef<Data>[] = [
    {
        header: "Timestamp",
        accessorKey: "timestamp",
        cell: ({ row }) => new Date(row.original.timestamp).toLocaleString(),
    },
    {
        header: "Lokasi",
        cell: ({ row }) => {
        const { latitude, longitude } = row.original.location
        return (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">Tunjukkan Peta</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Location</DialogTitle>
                        <p>📍 Latitude: {latitude}, Longitude: {longitude}</p>
                        {/* Optional: embed Leaflet or Google Maps here */}
                    </DialogContent>
                </Dialog>
            )
        },
    },
    {
        header: "Disubmit Oleh",
        cell: ({ row }) => row.original.account.name,
    },
    {
        header: "WQI",
        cell: ({ row }) => {
        const wqiEntries = Object.entries(row.original.wqi)
        return (
            <div className="space-y-1">
            {wqiEntries.map(([model, result]) => (
                <div key={model}>
                <strong>{model}</strong>: {result.value} (Confidence: {Math.round(result.confidence * 100)}%)
                </div>
            ))}
            </div>
        )
        },
    },
    {
        header: "Parameter",
        cell: ({ row }) => {
        const parameters = row.original.parameters
        return (
            <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">View Parameters</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Water Quality Parameters</DialogTitle>
                <table className="w-full text-sm mt-2">
                <thead>
                    <tr>
                    <th className="text-left">Parameter</th>
                    <th className="text-left">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(parameters).map(([name, { value, isImputed }]) => (
                    <tr key={name}>
                        <td>{name}</td>
                        <td className={isImputed ? "text-orange-500 font-semibold" : ""}>
                        {value}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </DialogContent>
            </Dialog>
        )
        },
    },
]
