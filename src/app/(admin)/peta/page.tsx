// app/peta/page.tsx (or wherever your PetaPage is)
"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import SidebarPeta from "./sidebar"

const LeafletMap = dynamic(() => import("@/components/common/LeafletMap"), { ssr: false })

// types.ts
export interface DataPoint {
    id: string
    timestamp: string
    location: {
        id: string
        name: string
        latitude: number
        longitude: number
    }
    account: {
        name: string
    }
    parameters: {
        [key: string]: {
        value: number | string
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


export default function PetaPage() {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
    const [groupedByLocation, setGroupedByLocation] = useState<{ [locId: string]: DataPoint[] }>({})
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
        const res = await fetch("/api/data")
        const json = await res.json()
        setDataPoints(json)

        const grouped: { [locId: string]: DataPoint[] } = {}
        json.forEach((entry: DataPoint) => {
            const locId = entry.location.id
            if (!grouped[locId]) grouped[locId] = []
            grouped[locId].push(entry)
        })

        setGroupedByLocation(grouped)
        }

        fetchData()
    }, [])

    const uniqueLocations = Object.values(groupedByLocation).map((entries) => entries[0])

    return (
        <div className="relative w-full h-screen">
        <LeafletMap
            locations={uniqueLocations}
            onMarkerClick={(locId) => setSelectedLocationId(locId)}
        />
        {selectedLocationId && groupedByLocation[selectedLocationId] && (
            <SidebarPeta
            data={groupedByLocation[selectedLocationId]}
            onClose={() => setSelectedLocationId(null)}
            />
        )}
        </div>
    )
}
