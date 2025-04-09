"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import dynamic from "next/dynamic"

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
    timestamp: string
    account: {
        id: number
        name: string
    }
    location: {
        id: number
        name: string
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

const StaticMap = dynamic(() => import("@/components/common/LeafletStaticMap"), {
    ssr: false,
})

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
                <div className="flex justify-between items-center">
                <p>{row.original.location.name}</p>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 20 20"><path fill="currentColor" d="M16.219 1.943c.653.512 1.103 1.339 1.287 2.205a.474.474 0 0 1 .065.026l2.045.946a.659.659 0 0 1 .384.597v12.367a.665.665 0 0 1-.85.634l-5.669-1.6l-6.74 1.858a.674.674 0 0 1-.371-.004L.474 17.217a.66.66 0 0 1-.474-.63V3.998c0-.44.428-.756.855-.632l5.702 1.661l2.898-.887a.734.734 0 0 1 .122-.025c.112-.656.425-1.286.95-1.9c.623-.73 1.716-1.158 2.781-1.209c1.105-.053 1.949.183 2.91.936ZM1.333 4.881v11.215l4.87 1.449V6.298l-4.87-1.417Zm8.209.614l-2.006.613v11.279l5.065-1.394v-3.295c0-.364.299-.659.667-.659c.368 0 .666.295.666.66v3.177l4.733 1.335V6.136l-1.12-.52c-.019.11-.043.218-.073.323A6.134 6.134 0 0 1 16.4 8.05l-2.477 3.093a.67.67 0 0 1-1.073-.037l-2.315-3.353c-.382-.534-.65-1.01-.801-1.436a3.744 3.744 0 0 1-.192-.822Zm3.83-3.171c-.726.035-1.472.327-1.827.742c-.427.5-.637.968-.679 1.442c-.05.571-.016.974.126 1.373c.105.295.314.669.637 1.12l1.811 2.622l1.91-2.385a4.812 4.812 0 0 0 .841-1.657c.24-.84-.122-2.074-.8-2.604c-.695-.545-1.22-.692-2.018-.653Zm.138.697c1.104 0 2 .885 2 1.977a1.988 1.988 0 0 1-2 1.977c-1.104 0-2-.885-2-1.977s.896-1.977 2-1.977Zm0 1.318a.663.663 0 0 0-.667.659c0 .364.299.659.667.659a.663.663 0 0 0 .666-.66a.663.663 0 0 0-.666-.658Z"/></svg>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogTitle>Location</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            📍 Latitude: {latitude}, Longitude: {longitude}
                        </p>
                        <StaticMap lat={latitude} lng={longitude} />
                    </DialogContent>
                </Dialog>
                </div>
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
