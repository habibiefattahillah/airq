"use client"

import { DataTable } from "./data-table"
import { columns, Data, Location } from "./columns"
import ComponentCard from "@/components/common/ComponentCard"
import { useLanguage } from "@/context/LanguageContext"
import { useQueryClient } from "@tanstack/react-query"

export default function ResultTable({ latestData }: { latestData: Data | null }) {
    const { language } = useLanguage()
    const queryClient = useQueryClient()
    const location = queryClient.getQueryData(["locations"]) as Location[]

    if (latestData) {
        const locationData = location.find((loc) => loc.id === latestData.location.id)
        if (locationData) {
            latestData.location = locationData
        }
    }

    if (!latestData) {
        return null
    }

    return (
        <ComponentCard title={language === "en" ? "Result" : "Hasil"} desc={language === "en" ? "WQI Classification Result" : "Hasil klasifikasi WQI"} className="overflow-auto">
            <DataTable columns={columns} data={[latestData]} />
        </ComponentCard>
    )
}
