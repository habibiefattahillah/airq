"use client"

import { useQuery } from "@tanstack/react-query"
import { DataTable } from "./data-table"
import { columns, Data } from "./columns"
import ComponentCard from "@/components/common/ComponentCard"

async function fetchData(): Promise<Data[]> {
    const res = await fetch("/api/data")
    if (!res.ok) throw new Error("Failed to fetch data")
    return res.json()
}

export default function TabelData() {
    const { data, isLoading, error } = useQuery<Data[]>({
        queryKey: ["water-quality-data"],
        queryFn: fetchData,
        staleTime: 1000 * 60 * 5, // cache for 5 minutes
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Failed to load data.</div>

    return (
        <ComponentCard title="Hasil" desc="Hasil klasifikasi WQI" className="overflow-auto">
            <DataTable columns={columns} data={data!} />
        </ComponentCard>
    )
}