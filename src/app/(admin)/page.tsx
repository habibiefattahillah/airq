import React from "react";
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

export default async function App() {
    return (
        <div className="grid gap-y-3">
            <DataInput />
            <ResultTable />
        </div>
    );
}
