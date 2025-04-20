"use client"

import { useQuery } from "@tanstack/react-query"
import { DataTable } from "./data-table"
import { columns, Data } from "./columns"
import ComponentCard from "@/components/common/ComponentCard"

async function fetchResultData(): Promise<Data[]> {
    const res = await fetch("/api/data")
    if (!res.ok) throw new Error("Failed to fetch data")
    return res.json()
}

export default function ResultTable() {
    const { data = [], isLoading, isError } = useQuery({
        queryKey: ["data"],
        queryFn: fetchResultData,
    })

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Gagal memuat data klasifikasi.</div>

    return (
        <ComponentCard title="Hasil" desc="Hasil klasifikasi WQI" className="overflow-auto">
            <DataTable columns={columns} data={data} />
        </ComponentCard>
    )
}
