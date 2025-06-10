// app/peta/page.tsx (or wherever your PetaPage is)
"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import SidebarPeta from "./sidebar"
import { Data } from "@/app/types"

const LeafletMap = dynamic(() => import("@/components/common/LeafletMap"), { ssr: false })

export default function PetaPage() {
    const [groupedByLocation, setGroupedByLocation] = useState<{ [locId: string]: Data[] }>({})
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
        const res = await fetch("/api/data")
        const json = await res.json()

        const grouped: { [locId: string]: Data[] } = {}
        json.forEach((entry: Data) => {
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
