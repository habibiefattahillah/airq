import React from "react";
import { columns, Data } from "./(result-table)/columns";
import DataInput from "./(input)/AppInput";
import ResultTable from "./(result-table)/ResultTable";

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
                name: "Lokasi 1",
                latitude: -7.250445,
                longitude: 112.768845,
            },
            parameters: {
                "Temperatur": { value: 25, isImputed: false },
                "Oksigen Terlarut": { value: 8, isImputed: false },
                "Saturasi Oksigen": { value: 90, isImputed: false },
                "Konduktivitas": { value: 1000, isImputed: true },
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
    return (
        <div className="grid gap-y-3">
            <DataInput />
            <ResultTable />
        </div>
    );
}
