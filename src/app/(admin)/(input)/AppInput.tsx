"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import MultiSelect from "@/components/form/MultiSelect"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import ComponentCard from "@/components/common/ComponentCard"
import Button from "@/components/ui/button/Button"

const Map = dynamic(() => import("@/components/common/LeafletInputMap"), {
    ssr: false,
})

type ParametersInput = {
    Temperatur: number | null
    OksigenTerlarut: number | null
    SaturasiOksigen: number | null
    Konduktivitas: number | null
    Kekeruhan: number | null
    PH: number | null
    ZatPadatTerlarut: number | null
}

type SubmitInput = {
    models: string[]
    location: {
        id: number | null
        name: string | null
        latitude: number | null
        longitude: number | null
    }
    parameters: ParametersInput
}

const fetchLocations = async () => {
    const res = await fetch("/api/location")
    if (!res.ok) throw new Error("Failed to fetch locations")
    return res.json()
}

export default function DataInput() {
    const [selectedValues, setSelectedValues] = useState<string[]>([])
    const [locationId, setLocationId] = useState<number | null>(null)
    const [locationName, setLocationName] = useState<string | null>("Baru")
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)

    const [parameters, setParameters] = useState<ParametersInput>({
        Temperatur: null,
        OksigenTerlarut: null,
        SaturasiOksigen: null,
        Konduktivitas: null,
        Kekeruhan: null,
        PH: null,
        ZatPadatTerlarut: null,
    })

    const { data: existingLocations = [], isLoading } = useQuery({
        queryKey: ["locations"],
        queryFn: fetchLocations,
    })

    const multiOptions = [
        { value: "Tabnet", text: "Tabnet (85%)", selected: false },
        { value: "CNN", text: "CNN (87%)", selected: false },
        { value: "MLP", text: "MLP (86%)", selected: false },
        { value: "RF", text: "RF (91%)", selected: false },
    ]

    const handleMapSelect = ({ locationId, name, lat, lng }: {
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

    async function submitClassification(input: SubmitInput) {
    try {
        const res = await fetch("/api/classify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        })

        if (!res.ok) throw new Error(`API error ${res.status}`)

        const result = await res.json()
        return result // { modelResults: { "RF": 1, "MLP": 0 }, finalWQI: 1 }
    } catch (error) {
        console.error("Error submitting classification:", error)
        throw error
    }
    }


    return (
        <ComponentCard title="Input" desc="Input data untuk klasifikasi WQI">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 md:col-span-4 space-y-3">
            <MultiSelect
                label="Model"
                options={multiOptions}
                onChange={(values) => setSelectedValues(values)}
            />
            <p className="text-sm text-gray-500">Klasifikasi:</p>
            <p className="text-sm text-gray-500">
                0 = Sangat Baik, 1 = Baik, 2 = Sedang, 3 = Buruk, 4 = Tidak Layak Konsumsi
            </p>
            </div>

            <div className="col-span-12 md:col-span-8 space-y-6">
            <div className="grid md:grid-cols-4 gap-4 md:gap-6 w-full">
                {Object.entries(parameters).map(([key, value]) => (
                <div key={key}>
                    <Label>{key.replace(/([A-Z])/g, " $1")}</Label>
                    <Input
                    type="number"
                    value={value ?? ""}
                    onChange={(e) =>
                        setParameters((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || null,
                        }))
                    }
                    />
                </div>
                ))}
            </div>
            </div>

            <div className="col-span-12 md:col-span-8">
            <Map existingLocations={existingLocations} onSelect={handleMapSelect} />
            </div>

            <div className="col-span-12 md:col-span-4 space-y-6">
            <div>
                <Label>Latitude</Label>
                <Input type="text" value={latitude ?? ""} readOnly />
            </div>
            <div>
                <Label>Longitude</Label>
                <Input type="text" value={longitude ?? ""} readOnly />
            </div>
            <input type="hidden" value={locationId ?? ""} readOnly />
            <div>
                <Label>Lokasi</Label>
                <Input type="text" value={locationName ?? "Baru"} readOnly />
            </div>
            </div>

            <div className="col-span-12 flex justify-center gap-4 md:gap-6">
            <Button size="md" variant="warning" className="px-4">
                Imputasi
            </Button>
            <Button
                size="md"
                variant="primary"
                className="px-4"
                onClick={async () => {
                    const input = {
                        models: selectedValues,
                        location: {
                        id: locationId,
                        name: locationName,
                        latitude: latitude,
                        longitude: longitude,
                        },
                        parameters,
                    }

                    try {
                        const result = await submitClassification(input)

                        const postPayload = {
                        location: input.location,
                        parameters: input.parameters,
                        result: result.finalWQI,
                        modelDetails: result.modelResults,
                        accountId: "example-id", // get this from session or context
                        }

                        await fetch("/api/post-data", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(postPayload),
                        })

                        alert("Klasifikasi berhasil disimpan!")
                    } catch (error) {
                        console.error("Error during classification:", error)
                    }
                    }}
            >
                Klasifikasi
            </Button>
            </div>
        </div>
        </ComponentCard>
    )
}