import React from "react";
import DataInput from "./(input)/AppInput";
import ResultTable from "./(result-table)/ResultTable";

export default async function App() {
    return (
        <div className="grid gap-y-3">
            <DataInput />
            <ResultTable />
        </div>
    );
}
