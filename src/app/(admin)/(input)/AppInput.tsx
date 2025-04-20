"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import MultiSelect from "@/components/form/MultiSelect"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import ComponentCard from "@/components/common/ComponentCard"
import Button from "@/components/ui/button/Button"
import InfoTooltip from "@/components/common/InfoTooltip"
import { useLanguage } from "@/context/LanguageContext"

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
    const queryClient = useQueryClient()
    const { language } = useLanguage()
    const [selectedValues, setSelectedValues] = useState<string[]>([])
    const [locationId, setLocationId] = useState<number | null>(null)
    const [locationName, setLocationName] = useState<string | null>("Baru")
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [errors, setErrors] = useState<{
        parameters: { [key: string]: boolean }
        models: boolean
        location: {
            latitude: boolean
            longitude: boolean
            name: boolean
        }
        }>({
        parameters: {},
        models: false,
        location: {
            latitude: false,
            longitude: false,
            name: false,
        },
    })

    const [parameters, setParameters] = useState<ParametersInput>({
        Temperatur: null,
        OksigenTerlarut: null,
        SaturasiOksigen: null,
        Konduktivitas: null,
        Kekeruhan: null,
        PH: null,
        ZatPadatTerlarut: null,
    })

    const parameterDescriptions: Record<keyof ParametersInput, string[]> = {
        Temperatur: language === "en" ? ["Temperature", "Water temperature (°C)"] : ["Suhu", "Suhu air (°C)"],
        OksigenTerlarut: language === "en" ? ["Dissolved Oxygen", "Amount of oxygen dissolved in the water (mg/L)"] : ["Oksigen Terlarut", "Jumlah oksigen yang terlarut dalam air (mg/L)"],
        SaturasiOksigen: language === "en" ? ["Oxygen Saturation", "Percentage of oxygen saturation in the water (%)"] : ["Saturasi Oksigen", "Persentase kejenuhan oksigen dalam air (%)"],
        Konduktivitas: language === "en" ? ["Conductivity", "Electrical conductivity in the water (µS/cm)"] : ["Konduktivitas", "Konduktivitas listrik dalam air (µS/cm)"],
        Kekeruhan: language === "en" ? ["Turbidity", "Water clarity level (NTU)"] : ["Kekeruhan", "Tingkat kejernihan air (NTU)"],
        PH: language === "en" ? ["pH", "Water acidity level (pH)"] : ["pH", "Tingkat keasaman air (pH)"],
        ZatPadatTerlarut: language === "en" ? ["Total Dissolved Solids", "Total dissolved solids in the water (mg/L)"] : ["Zat Padat Terlarut", "Total zat padat terlarut dalam air (mg/L)"],
    }

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
            return result
        } catch (error) {
            console.error("Error submitting classification:", error)
            throw error
        }
    }

    const handleSubmit = async () => {
        const newErrors = {
            parameters: {} as { [key: string]: boolean },
            models: false,
            location: {
                latitude: false,
                longitude: false,
                name: false,
            },
        }

        let hasError = false

        // Parameters
        for (const [key, val] of Object.entries(parameters)) {
            if (val === null || isNaN(val)) {
                newErrors.parameters[key] = true
                hasError = true
            }
        }
        
        // Models
        if (selectedValues.length === 0) {
            newErrors.models = true
            hasError = true
        }

        // Location
        if (locationId === null) {
            if (latitude === null) {
                newErrors.location.latitude = true
                hasError = true
            }
            if (longitude === null) {
                newErrors.location.longitude = true
                hasError = true
            }
            if (!locationName || locationName.trim() === "") {
                newErrors.location.name = true
                hasError = true
            }
        }

        if (hasError) {
            setErrors(newErrors)
            alert("Mohon lengkapi semua input sebelum mengklasifikasikan.")
            return
        }

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

        await onKlasifikasi(input)
    }

    const onKlasifikasi = async (input: SubmitInput) => {
        try {
            const result = await submitClassification(input)

            const formattedParams = Object.fromEntries(
                Object.entries(input.parameters).map(([key, val]) => [
                    key,
                    { value: val, isImputed: false },
                ])
            )

            const formattedWQI = Object.fromEntries(
                Object.entries(result.modelResults).map(([model, res]) => [
                    model,
                    {
                        value: (res as { value: number }).value,
                        confidence: (res as { confidence?: number | undefined })?.confidence ?? 1,
                    },
                ])
            )

            const postPayload = {
                location: input.location,
                parameters: formattedParams,
                wqi: formattedWQI,
                accountId: 1,
            }

            postDataMutation.mutate(postPayload)
        } catch (error) {
            console.error("Error during classification:", error)
        }
    }

    const postDataMutation = useMutation({
        mutationFn: async (postPayload: any) => {
            const res = await fetch("/api/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postPayload),
            })

            if (!res.ok) throw new Error("Failed to post data")
            return res.json()
        },
        onSuccess: () => {
            alert("Klasifikasi berhasil disimpan!")

            // Optional: Refetch data or invalidate related cache
            queryClient.invalidateQueries({ queryKey: ["data"] })
        },
        onError: (err: any) => {
            console.error("Error posting data:", err)
            alert("Gagal menyimpan data klasifikasi")
        },
    })

    const handleImputasi = async () => {
        const input = {
            dissolvedOxygenMgL: parameters.OksigenTerlarut,
            dissolvedOxygenSaturation: parameters.SaturasiOksigen,
            specificConductance: parameters.Konduktivitas,
            temperatureWaterDegC: parameters.Temperatur,
            turbidityNTU: parameters.Kekeruhan,
            pHStdUnits: parameters.PH,
            tdlMgL: parameters.ZatPadatTerlarut,
        }

        const res = await fetch("/api/imputasi", {
            method: "POST",
            body: JSON.stringify(input),
            headers: { "Content-Type": "application/json" },
        })

        const imputed = await res.json()

        // Update state with imputed values
        setParameters({
            Temperatur: imputed.temperatureWaterDegC,
            OksigenTerlarut: imputed.dissolvedOxygenMgL,
            SaturasiOksigen: imputed.dissolvedOxygenSaturation,
            Konduktivitas: imputed.specificConductance,
            Kekeruhan: imputed.turbidityNTU,
            PH: imputed.pHStdUnits,
            ZatPadatTerlarut: imputed.tdlMgL,
        })

        // Optionally: Keep track of which fields were imputed
    }

    return (
        <ComponentCard title="Input" desc={language === "en" ? "Enter Water Quality Parameters" : "Masukkan Parameter Kualitas Air"}>
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 md:col-span-4 space-y-3">
                <MultiSelect
                    label={language === "en" ? "Select Models" : "Pilih Model"}
                    options={multiOptions}
                    className={errors.models ? "border border-red-500 p-1 rounded" : ""}
                    onChange={(values) => {
                    setSelectedValues(values)
                    setErrors((prev) => ({ ...prev, models: false }))
                    }}
                />
            <p className="text-sm text-gray-500">
                {language === "en" ? "Classification:" : "Klasifikasi:"}
            </p>
            <p className="text-sm text-gray-500">
                {language === "en" ? "0 = Very Good, 1 = Good, 2 = Moderate, 3 = Bad, 4 = Not Suitable for Consumption" : "0 = Sangat Baik, 1 = Baik, 2 = Sedang, 3 = Buruk, 4 = Tidak Layak Konsumsi"}
            </p>
            </div>

            <div className="col-span-12 md:col-span-8 space-y-6">
                <div className="grid md:grid-cols-4 gap-4 md:gap-6 w-full">
                    {Object.entries(parameters).map(([key, value]) => (
                        <div key={key}>
                            <div className="flex justify-between items-center gap-2">
                                <Label>
                                    {parameterDescriptions[key as keyof ParametersInput][0]}
                                </Label>
                                <InfoTooltip message={parameterDescriptions[key as keyof ParametersInput][1]} />
                            </div>
                            <Input
                                type="number"
                                value={value ?? ""}
                                className={errors.parameters[key] ? "border border-red-500" : ""}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value)
                                    setParameters((prev) => ({
                                        ...prev,
                                        [key]: isNaN(val) ? null : val,
                                    }))
                                    setErrors((prev) => ({
                                        ...prev,
                                        parameters: { ...prev.parameters, [key]: false },
                                    }))
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="col-span-12 md:col-span-8">
            <Map existingLocations={existingLocations} onSelect={handleMapSelect} />
            </div>

            <div className="col-span-12 md:col-span-4 space-y-6">
            <Label>{language === "en" ? "Location" : "Lokasi"}</Label>
            <Label className="flex items-center gap-1">
                {language === "en" ? "Latitude" : "Lintang"}
            </Label>
            <Input
                type="text"
                value={latitude ?? ""}
                className={errors.location.latitude ? "border border-red-500" : ""}
                readOnly
            />
            <Label className="flex items-center gap-1">
                {language === "en" ? "Longitude" : "Bujur"}
            </Label>
            <Input
                type="text"
                value={longitude ?? ""}
                className={errors.location.longitude ? "border border-red-500" : ""}
                readOnly
            />
            {/* <Label>Nama Lokasi</Label> */}
            <Label className="flex items-center gap-1">
                {language === "en" ? "Location Name" : "Nama Lokasi"}
            </Label>
            <Input
                type="text"
                value={locationName ?? ""}
                className={errors.location.name ? "border border-red-500" : ""}
                readOnly={locationId !== null}
                onChange={(e) => {
                    if (locationId === null) {
                    setLocationName(e.target.value)
                    setErrors((prev) => ({
                        ...prev,
                        location: { ...prev.location, name: false },
                    }))
                    }
                }}
            />
            <input type="hidden" value={locationId ?? ""} readOnly />
            </div>

            <div className="col-span-12 flex justify-center gap-4 md:gap-6">
            <Button size="md" variant="warning" className="px-4"
                onClick={handleImputasi}
            >
                {language === "en" ? "Impute" : "Imputasi"}
            </Button>
            <Button
                size="md"
                variant="primary"
                className="px-4"
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {language === "en" ? "Classify" : "Klasifikasi"}
            </Button>
            </div>
        </div>
        </ComponentCard>
    )
}