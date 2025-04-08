"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import MultiSelect from "@/components/form/MultiSelect"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import ComponentCard from "@/components/common/ComponentCard"
import Button from "@/components/ui/button/Button"
import { Location } from "../(result-table)/columns"

const Map = dynamic(() => import("@/components/common/LeafletInputMap"), {
    ssr: false,
})

export default function DataInput() {
    const [selectedValues, setSelectedValues] = useState<string[]>([])
    const [locationId, setLocationId] = useState<number | null>(null)
    const [locationName, setLocationName] = useState<string | null>("Baru")
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)

    const multiOptions = [
        { value: "1", text: "Tabnet (85%)", selected: false },
        { value: "2", text: "CNN (87%)", selected: false },
        { value: "3", text: "MLP (86%)", selected: false },
        { value: "4", text: "RF (91%)", selected: false },
    ]

    const handleMapSelect = ({
        locationId,
        name,
        lat,
        lng,
    }: {
        locationId: number | null
        name: string | null
        lat: number
        lng: number
    }) => {
        setLocationId(locationId)
        setLocationName(name)
        setLatitude(lat)
        setLongitude(lng)
    }

    const existingLocations: Location[] = [
        { id: 1, name: "test", latitude: -6.2001, longitude: 106.8 },
        { id: 2, name: "haiya", latitude: -6.201, longitude: 106.801 },
    ]

    return (
        <ComponentCard title="Input" desc="Input data untuk klasifikasi WQI">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 md:col-span-4 space-y-3">
                <MultiSelect
                    label="Model"
                    options={multiOptions}
                    defaultSelected={["1", "3"]}
                    onChange={(values) => setSelectedValues(values)}
                />
                <p className="text-sm text-gray-500">Klasifikasi:</p>
                <p className="text-sm text-gray-500">
                    1 - Sangat Baik, 2 - Baik, 3 - Cukup, 4 - Tidak layak
                </p>
            </div>

            <div className="col-span-12 md:col-span-8 space-y-6">
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

                    <div className="col-span-12 md:col-span-8">
                        <Map existingLocations={existingLocations} onSelect={handleMapSelect} />
                    </div>
            <div className="col-span-12 md:col-span-4 space-y-6">
                    <div className="col-span-4">
                        <Label>Latitude</Label>
                        <Input type="text" value={latitude ?? ""} readOnly />
                    </div>
                    <div>
                        <Label>Longitude</Label>
                        <Input type="text" value={longitude ?? ""} readOnly />
                    </div>
                    <div>
                        <Label>Lokasi</Label>
                        <Input type="text" value={locationName ?? "Baru"} readOnly />
                    </div>
            </div>

            <div className="col-span-12 flex justify-center gap-4 md:gap-6">
                <Button size="md" variant="warning" className="px-4">
                    Imputasi
                </Button>
                <Button size="md" variant="primary" className="px-4">
                    Klasifikasi
                </Button>
            </div>
        </div>
        </ComponentCard>
    )
}
