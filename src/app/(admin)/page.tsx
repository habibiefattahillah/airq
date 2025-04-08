import React from "react";
import MultiSelect from "@/components/form/MultiSelect";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { DataTable } from "./(result-table)/data-table";
import { columns, Data } from "./(result-table)/columns";
import DataInput from "./(input)/page";

// metadata
export const metadata = {
    title: "AirQ",
    description: "Aplikasi Klasifikasi Kualitas Air",
    icons: {
        icon: "water.jpg"
    },
}

async function getData(): Promise<Data[]> {
    return [
        {
            id: 1,
            timestamp: "2025-04-08T12:00:00Z",
            account: {
                id: 1,
                name: "John Doe",
            },
            location: {
                id: 1,
                latitude: -7.250445,
                longitude: 112.768845,
            },
            parameters: {
                "Temperatur": { value: 25, isImputed: false },
                "Oksigen Terlarut": { value: 8, isImputed: false },
                "Saturasi Oksigen": { value: 90, isImputed: false },
                "Konduktivitas": { value: 1000, isImputed: false },
                "Kekeruhan": { value: 5, isImputed: false },
                "PH": { value: 7, isImputed: false },
                "Zat Padat Terlarut": { value: 500, isImputed: false },
            },
            wqi: {
                RF: { value: 2, confidence: 0.9 },
                CNN: { value: 4, confidence: 0.85 },
            },
        },
    ]
}

export default async function App() {
    
    const data = await getData()

    const multiOptions = [
        { value: "1", text: "Tabnet (85%)", selected: false },
        { value: "2", text: "CNN (87%)", selected: false },
        { value: "3", text: "MLP (86%)", selected: false },
        { value: "4", text: "RF (91%)", selected: false },
    ];

    return (
        <div className="grid gap-y-3">
            <DataInput />
            <ComponentCard title="Hasil" desc="Hasil klasifikasi WQI" className="overflow-auto">
                <DataTable columns={columns} data={data} />
            </ComponentCard>
        </div>
    );
}
