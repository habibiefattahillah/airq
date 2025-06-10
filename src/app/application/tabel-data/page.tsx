"use client"

import { useQuery } from "@tanstack/react-query"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Data, Account } from "@/app/types"
import { useUser } from "@clerk/nextjs"
import ComponentCard from "@/components/common/ComponentCard"

async function fetchData(): Promise<Data[]> {
    const res = await fetch("/api/data")
    if (!res.ok) throw new Error("Failed to fetch data")
    return res.json()
}

async function fetchAccount(userId: string): Promise<Account> {
    const res = await fetch(`/api/account/${userId}`)
    if (!res.ok) throw new Error("Failed to fetch account info")
    return res.json()
}

export default function TabelData() {
    const { user } = useUser()

    const { data, isLoading } = useQuery<Data[]>({
        queryKey: ["water-quality-data"],
        queryFn: fetchData,
        staleTime: 1000 * 60 * 5,
        enabled: !!user,
    })
    
    const { data: account } = useQuery<Account>({
        queryKey: ["account-info", user?.id],
        queryFn: () => user ? fetchAccount(user.id) : Promise.reject("No user"),
        enabled: !!user,
    })

    if (!user) return <div>Loading user...</div>
    if (isLoading) return <div>Loading data...</div>

    // Get user role and userId from account data
    const userRole = account?.role;
    const userId = account?.id;

    // Only filter data if the role is 'guest'
    const filteredData =
        userRole === "guest"
        ? data?.filter(entry => entry.account.id === userId) ?? []
        : data ?? []

    return (
        <ComponentCard title="Hasil" desc="Hasil klasifikasi WQI" className="overflow-auto">
            <DataTable columns={columns} data={filteredData} />
        </ComponentCard>
    )
}