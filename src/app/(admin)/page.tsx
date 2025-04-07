"use client";
import React from "react";
import MultiSelect from "@/components/form/MultiSelect";
import { useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";

export default function App() {
    
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    
    const multiOptions = [
        { value: "1", text: "Tabnet (85%)", selected: false },
        { value: "2", text: "CNN (87%)", selected: false },
        { value: "3", text: "MLP (86%)", selected: false },
        { value: "4", text: "RF (91%)", selected: false },
    ];

    return (
        <div className="grid gap-y-3">
            <PageBreadcrumb pageTitle="Klasifikasi WQI" />
            <ComponentCard title="Input" desc="Input data untuk klasifikasi WQI">
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 md:col-span-4 space-y-3">
                        <MultiSelect
                            label="Model"
                            options={multiOptions}
                            defaultSelected={["1", "3"]}
                            onChange={(values) => setSelectedValues(values)}
                        />
                        <p className="text-sm text-gray-500"> Klasifikasi:</p>
                        <p className="text-sm text-gray-500">1 - Sangat Baik, 2 - Baik, 3 - Cukup, 4 - Tidak layak</p>
                </div>
                <div className="col-span-8 space-y-6">
                    <div className="grid md:grid-cols-4 gap-4 md:gap-6 w-full">
                        <div>
                            <Label>Temperatur (degC)</Label>
                            <Input type="text" />
                        </div>
                        <div>
                            <Label>Oksigen Terlarut (mg/L)</Label>
                            <Input type="text" />
                        </div>
                        <div>
                            <Label>Saturasi Oksigen (%)</Label>
                            <Input type="text" />
                        </div>
                        <div>
                            <Label>Konduktivitas (uS/cm)</Label>
                            <Input type="text" />
                        </div>
                        <div>
                            <Label>Kekeruhan (NTU)</Label>
                            <Input type="text" />
                        </div>
                        <div>
                            <Label>pH</Label>
                            <Input type="text" />
                        </div>
                        <div>
                            <Label>Zat Padat Terlarut (mg/L)</Label>
                            <Input type="text" />
                        </div>
                    </div>
                </div>
                <div className="col-span-12 flex justify-center gap-4 md:gap-6">
                    <Button size="md" variant="warning" className="px-4">Imputasi</Button>
                    <Button size="md" variant="primary" className="px-4">Klasifikasi</Button>
                </div>
            </div>
            </ComponentCard>
            <ComponentCard title="Hasil" desc="Hasil klasifikasi WQI">
                kys
            </ComponentCard>
        </div>
    );
}
