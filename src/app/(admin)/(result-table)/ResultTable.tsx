"use client"

import { useEffect, useState } from "react"
import { DataTable } from "./data-table"
import { columns, Data } from "./columns"
import ComponentCard from "@/components/common/ComponentCard"

export default function ResultTable() {
    const [data, setData] = useState<Data[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
        try {
            const res = await fetch("/api/data")
            const json = await res.json()
            setData(json)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
        }

        fetchData()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <ComponentCard title="Hasil" desc="Hasil klasifikasi WQI" className="overflow-auto">
            <DataTable columns={columns} data={data} />
        </ComponentCard>
    )
}