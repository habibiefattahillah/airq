"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import MultiSelect from "@/components/form/MultiSelect"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import { Data, Parameters } from "@/app/types"
import ComponentCard from "@/components/common/ComponentCard"
import Button from "@/components/ui/button/Button"
import InfoTooltip from "@/components/common/InfoTooltip"
import { useLanguage } from "@/context/LanguageContext"
import ResultTable from "../(result-table)/ResultTable"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { useUser } from "@clerk/nextjs"
import { DialogTitle } from "@radix-ui/react-dialog"


const Map = dynamic(() => import("@/components/common/LeafletInputMap"), {
    ssr: false,
})

type LocationInput = {
    id: number | null
    name: string
    latitude: number | null
    longitude: number | null
}

type SubmitInput = {
    models: string[]
    location: LocationInput
    parameters: Parameters
}

type PostPayload = {
    location: LocationInput
    parameters: Parameters
    wqi: Record<string, { value: number; confidence: number }>
    accountId?: string
}

const fetchLocations = async () => {
    const res = await fetch("/api/location")
    if (!res.ok) throw new Error("Failed to fetch locations")
    return res.json()
}

export default function DataInput() {
    const queryClient = useQueryClient()
    const { user } = useUser()
    const { language } = useLanguage()
    const [selectedValues, setSelectedValues] = useState<string[]>([])
    const [locationId, setLocationId] = useState<number | null>(null)
    const [locationName, setLocationName] = useState<string | null>("Baru")
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [latestClassification, setLatestClassification] = useState<Data | null>(
        null
    )
    const [isImputasiButtonLoading, setIsImputasiButtonLoading] = useState(false)
    const [isKlasifikasiButtonLoading, setIsKlasifikasiButtonLoading] = useState(false)
    const [isImputasiModalOpen, setIsImputasiModalOpen] = useState(false)
    const [isResultModalOpen, setIsResultModalOpen] = useState(false)
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

    const [parameters, setParameters] = useState<Parameters>({
        Temperatur: { value: null, isImputed: false },
        OksigenTerlarut: { value: null, isImputed: false },
        SaturasiOksigen: { value: null, isImputed: false },
        Konduktivitas: { value: null, isImputed: false },
        Kekeruhan: { value: null, isImputed: false },
        PH: { value: null, isImputed: false },
        ZatPadatTerlarut: { value: null, isImputed: false },
    })

    const parameterDescriptions: Record<keyof Parameters, string[]> = {
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
        { value: "TabNet", text: "TabNet (85%)", selected: false },
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
                body: JSON.stringify(
                    {
                        models: input.models,
                        parameters: {
                            Temperatur: input.parameters.Temperatur.value,
                            OksigenTerlarut: input.parameters.OksigenTerlarut.value,
                            SaturasiOksigen: input.parameters.SaturasiOksigen.value,
                            Konduktivitas: input.parameters.Konduktivitas.value,
                            Kekeruhan: input.parameters.Kekeruhan.value,
                            PH: input.parameters.PH.value,
                            ZatPadatTerlarut: input.parameters.ZatPadatTerlarut.value,
                        },
                    }
                ),
            })

            if (!res.ok) throw new Error(`API error ${res.status}`)

            const result = await res.json()
            return result
        } catch (error) {
            console.error("Error submitting classification:", error)
            throw error
        }
    }

    const handleKlasifikasi = async () => {
        if (isKlasifikasiButtonLoading) return

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
            if (val === null || isNaN(val.value as number)) {
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

        setIsKlasifikasiButtonLoading(true)

        const input: SubmitInput = {
            models: selectedValues,
            location: {
                id: locationId,
                name: locationName || "Baru",
                latitude: latitude,
                longitude: longitude,
            },
            parameters: {
                Temperatur: { value: parameters.Temperatur.value, isImputed: parameters.Temperatur.isImputed },
                OksigenTerlarut: { value: parameters.OksigenTerlarut.value, isImputed: parameters.OksigenTerlarut.isImputed },
                SaturasiOksigen: { value: parameters.SaturasiOksigen.value, isImputed: parameters.SaturasiOksigen.isImputed },
                Konduktivitas: { value: parameters.Konduktivitas.value, isImputed: parameters.Konduktivitas.isImputed },
                Kekeruhan: { value: parameters.Kekeruhan.value, isImputed: parameters.Kekeruhan.isImputed },
                PH: { value: parameters.PH.value, isImputed: parameters.PH.isImputed },
                ZatPadatTerlarut: { value: parameters.ZatPadatTerlarut.value, isImputed: parameters.ZatPadatTerlarut.isImputed },
            }
        }

        await onKlasifikasi(input)

        setIsKlasifikasiButtonLoading(false)
    }

    const onKlasifikasi = async (input: SubmitInput) => {
        try {
            const result = await submitClassification(input)

            const formattedParams = Object.fromEntries(
                Object.entries(input.parameters).map(([key, val]) => [
                    key,
                    {
                        value: val.value,
                        isImputed: val.isImputed,
                    },
                ])
            ) as Parameters

            const formattedWQI = Object.fromEntries(
                Object.entries(result.modelResults).map(([model, res]) => [
                    model,
                    {
                        value: (res as { value: number }).value,
                        confidence: (res as { confidence?: number | undefined })?.confidence ?? 1,
                    },
                ])
            )
            
            const postPayload: PostPayload = {
                location: {
                    id: input.location.id,
                    name: input.location.name,
                    latitude: input.location.latitude,
                    longitude: input.location.longitude,
                },
                parameters: formattedParams,
                wqi: formattedWQI,
                accountId: user?.id || undefined,
            }

            postDataMutation.mutate(postPayload)
        } catch (error) {
            console.error("Error during classification:", error)
        }
    }

    const { data: latestData } = useQuery({
        queryKey: ["latest"],
        queryFn: async () => {
            return latestClassification as Data
        },
    })

    const postDataMutation = useMutation({
        mutationFn: async (postPayload: PostPayload) => {
        const res = await fetch("/api/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postPayload),
            })
        
            if (!res.ok) throw new Error("Failed to post data")
        
            const { id } = await res.json()
        
            const data = await fetch(`/api/data/${id}`).then((res) => res.json())
            if (!data) throw new Error("Failed to fetch data")
        
            setLatestClassification(data)

            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["water-quality-data"] })
            queryClient.invalidateQueries({ queryKey: ["latest"] })
            setIsResultModalOpen(true)
        },
        onError: (err: unknown) => {
        if (err instanceof Error) {
            console.error("Error posting data:", err.message)
        } else {
            console.error("Unknown error posting data:", err)
        }
            alert("Gagal menyimpan data klasifikasi")
        },
    })

    const handleImputasi = async () => {
        if (isImputasiButtonLoading) return

        // return if all parameters are filled
        const isAllFilled = Object.values(parameters).every(
            (param) => param.value !== null && !isNaN(param.value as number)
        )

        if (isAllFilled) {
            alert("Semua parameter sudah terisi.")
            setIsImputasiButtonLoading(false)
            return
        }

        const hasValue = Object.values(parameters).some(
            (param) => param.value !== null && !isNaN(param.value as number)
        )

        if (!hasValue) {
            alert("Setidaknya satu parameter harus memiliki nilai sebelum melakukan imputasi.")
            setIsImputasiButtonLoading(false)
            return
        }

        setIsImputasiButtonLoading(true)

        const input = {
            "Dissolved_oxygen__DO___mg_L_": parameters.OksigenTerlarut.value,
            "Dissolved_oxygen_saturation____": parameters.SaturasiOksigen.value,
            "Specific_conductance__uS_cm_": parameters.Konduktivitas.value,
            "Temperature__water__deg_C_": parameters.Temperatur.value,
            "Turbidity__NTU_": parameters.Kekeruhan.value,
            "pH__std_units_": parameters.PH.value,
        }

        console.log(input)

        const res = await fetch("/api/imputasi", {
            method: "POST",
            body: JSON.stringify(
                { row: input },
            ),
            headers: { "Content-Type": "application/json" },
        })

        console.log(res)

        const imputed = await res.json()

        const imputedRow = imputed.imputed

        const imputedValues = {
            temperatureWaterDegC: imputedRow["Temperature__water__deg_C_"],
            dissolvedOxygenMgL: imputedRow["Dissolved_oxygen__DO___mg_L_"],
            dissolvedOxygenSaturation: imputedRow["Dissolved_oxygen_saturation____"],
            specificConductance: imputedRow["Specific_conductance__uS_cm_"],
            turbidityNTU: imputedRow["Turbidity__NTU_"],
            pHStdUnits: imputedRow["pH__std_units_"],
        }

        setParameters({
            Temperatur: { value: imputedValues.temperatureWaterDegC, isImputed: imputedValues.temperatureWaterDegC !== parameters.Temperatur.value },
            OksigenTerlarut: { value: imputedValues.dissolvedOxygenMgL, isImputed: imputedValues.dissolvedOxygenMgL !== parameters.OksigenTerlarut.value },
            SaturasiOksigen: { value: imputedValues.dissolvedOxygenSaturation, isImputed: imputedValues.dissolvedOxygenSaturation !== parameters.SaturasiOksigen.value },
            Konduktivitas: { value: imputedValues.specificConductance, isImputed: imputedValues.specificConductance !== parameters.Konduktivitas.value },
            Kekeruhan: { value: imputedValues.turbidityNTU, isImputed: imputedValues.turbidityNTU !== parameters.Kekeruhan.value },
            PH: { value: imputedValues.pHStdUnits, isImputed: imputedValues.pHStdUnits !== parameters.PH.value },
            ZatPadatTerlarut: { value: imputedValues.specificConductance * 0.64, isImputed: imputedValues.specificConductance * 0.64 !== parameters.ZatPadatTerlarut.value },
        })

        const imputedFields = {
            Temperatur: imputedRow["Temperature__water__deg_C_"] !== parameters.Temperatur.value,
            OksigenTerlarut: imputedRow["Dissolved_oxygen__DO___mg_L_"] !== parameters.OksigenTerlarut.value,
            SaturasiOksigen: imputedRow["Dissolved_oxygen_saturation____"] !== parameters.SaturasiOksigen.value,
            Konduktivitas: imputedRow["Specific_conductance__uS_cm_"] !== parameters.Konduktivitas.value,
            Kekeruhan: imputedRow["Turbidity__NTU_"] !== parameters.Kekeruhan.value,
            PH: imputedRow["pH__std_units_"] !== parameters.PH.value,
            ZatPadatTerlarut: (imputedRow["Specific_conductance__uS_cm_"] * 0.64) !== parameters.ZatPadatTerlarut.value,
        }

        setErrors((prev) => ({
            ...prev,
            parameters: imputedFields,
        }))

        setIsImputasiButtonLoading(false)
    }

    function getRandomFloat(min: number, max: number, decimals = 2): number {
        return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
    }
    
    function generateRandomSubmitInput(): SubmitInput {
        const useKnownLocation = Math.random() < 0.5
        const locationId = useKnownLocation ? Math.floor(Math.random() * (23 - 10 + 1)) + 10 : null
        const randomLat = getRandomFloat(-90, 90, 6)
        const randomLng = getRandomFloat(-180, 180, 6)
    
        return {
            models: ["RF", "CNN"], 
            location: {
                id: locationId,
                name: locationId ? "" : "Baru",
                latitude: locationId ? null : randomLat,
                longitude: locationId ? null : randomLng,
            },
            parameters: {
                PH: { value: getRandomFloat(5, 12), isImputed: false },
                Temperatur: { value: getRandomFloat(12, 24), isImputed: false },
                OksigenTerlarut: { value: getRandomFloat(4, 12), isImputed: false },
                SaturasiOksigen: { value: getRandomFloat(50, 150), isImputed: false },
                Kekeruhan: { value: getRandomFloat(0, 4), isImputed: false },
                Konduktivitas: { value: getRandomFloat(0, 1000), isImputed: false },
                ZatPadatTerlarut: { value: getRandomFloat(0, 1000), isImputed: false },
            }
        }
    }    

    const handleGenerateRandom = () => {
        const randomData = generateRandomSubmitInput()
    
        setParameters(randomData.parameters)
        setSelectedValues(randomData.models)
        setLocationId(randomData.location.id)
        setLocationName(randomData.location.name)
        setLatitude(randomData.location.latitude)
        setLongitude(randomData.location.longitude)
    }

    const LoadingSpinner = () => (
        <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.93A8.003 8.003 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.93-1.008zM12 20a8.003 8.003 0 01-6.93-4.07l-3.93 1.008A11.95 11.95 0 0012 24v-4zm6.93-2.07A8.003 8.003 0 0120 12h4c0 3.042-1.135 5.824-3 7.938l-3.07-.938zM20 12a8.003 8.003 0 01-4.07-6.93l3.93-1A11.95 11.95 0 0024 12h-4z"
            ></path>
        </svg>
    )

    return (
        <>
        {isLoading ? (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        )
        : (
        <ComponentCard className="relative" title="Input" desc={language === "en" ? "Enter Water Quality Parameters" : "Masukkan Parameter Kualitas Air"}>

        {/* Modal */}
        <Dialog open={isImputasiModalOpen} onOpenChange={setIsImputasiModalOpen}>
            <DialogTitle className="text-lg font-semibold">
                {language === "en" ? "Impute Missing Values" : "Imputasi Nilai Hilang"}
            </DialogTitle>
            <DialogContent className="max-w-2xl w-full p-6">
                <h2 className="text-lg font-semibold mb-4">
                    {language === "en" ? "Impute Missing Values" : "Imputasi Nilai Hilang"}
                </h2>
                <p className="mb-4">
                    {language === "en" ? "Do understand that imputed values are estimates based on existing data and may not reflect actual measurements." : "Harap pahami bahwa nilai yang diimputasi adalah perkiraan berdasarkan data yang ada dan mungkin tidak mencerminkan pengukuran sebenarnya."}
                </p>
                <Button
                    variant="primary"
                    onClick={() => {
                        handleImputasi()
                        setIsImputasiModalOpen(false)
                    }}
                >
                    {language === "en" ? "Confirm Imputation" : "Konfirmasi Imputasi"}
                </Button>
            </DialogContent>
        </Dialog>

        <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
            <DialogContent className="max-w-3xl w-full p-6">
                <DialogTitle className="text-lg font-semibold mb-2">
                    {language === "en" ? "Classification Result" : "Hasil Klasifikasi"}
                </DialogTitle>

                {/* Parameters */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">
                        {language === "en" ? "Parameters" : "Parameter"}
                    </h3>
                    <ul className="grid grid-cols-2 gap-2">
                        {Object.entries(parameters).map(([key, val]) => (
                            <li
                                key={key}
                                className={`p-2 rounded border ${
                                    val.value !== null ? "bg-yellow-100" : "bg-gray-100"
                                }`}
                            >
                                <strong>{key}:</strong> {val.value ?? "-"}
                                {val.isImputed && (
                                    <span className="ml-2 text-xs text-gray-500">
                                        ({language === "en" ? "imputed" : "imputasi"})
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Models & WQI */}
                <div>
                    <h3 className="font-semibold mb-2">
                        {language === "en" ? "Model Results (WQI)" : "Hasil Model (WQI)"}
                    </h3>
                    <ul className="space-y-2">
                        {latestClassification &&
                            Object.entries(latestClassification.wqi).map(
                                ([model, { value, confidence }]) => (
                                    <li
                                        key={model}
                                        className="p-2 rounded border bg-green-100 flex justify-between"
                                    >
                                        <span className="font-semibold">{model}</span>
                                        <span>
                                            WQI: {value}{" "}
                                            {confidence !== undefined && (
                                                <span className="ml-2 text-xs text-gray-500">
                                                    ({(confidence * 100).toFixed(1)}%)
                                                </span>
                                            )}
                                        </span>
                                    </li>
                                )
                            )}
                    </ul>
                </div>

                <div className="mt-4 text-right">
                    <Button onClick={() => setIsResultModalOpen(false)}>
                        {language === "en" ? "Close" : "Tutup"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

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
            </div>

            <div className="col-span-12 md:col-span-8 space-y-6">
                <div className="grid md:grid-cols-4 gap-4 md:gap-6 w-full">
                    {Object.entries(parameters).map(([key, value]) => (
                        <div key={key}>
                            <div className="flex justify-between items-center gap-2">
                                <Label>
                                    {parameterDescriptions[key as keyof Parameters][0]}
                                </Label>
                                <InfoTooltip message={parameterDescriptions[key as keyof Parameters][1]} />
                            </div>
                            <Input
                                type="number"
                                value={value.value ?? ""}
                                min="0"
                                className={`${
                                    value.isImputed ? "bg-yellow-100" : ""
                                } ${errors.parameters[key] ? "border border-red-500" : ""}`}
                                placeholder={language === "en" ? "Enter value" : "Masukkan nilai"}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value)
                                    setParameters((prev) => ({
                                        ...prev,
                                        [key as keyof Parameters]: {
                                            ...prev[key as keyof Parameters],
                                            value: isNaN(val) ? null : val,
                                        },
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
                onClick={() => setIsImputasiModalOpen(true)}
                disabled={isImputasiButtonLoading || user === null || isKlasifikasiButtonLoading}
            >
                {/* Loading */}
                {isImputasiButtonLoading && <LoadingSpinner />}
                {language === "en" ? "Impute Missing Values" : "Imputasi Nilai Hilang"}
            </Button>

            <Button onClick={handleGenerateRandom}>Generate Random Data</Button>

            <Button
                size="md"
                variant="primary"
                className="px-4"
                onClick={handleKlasifikasi}
                disabled={isKlasifikasiButtonLoading || user === null || isImputasiButtonLoading}
            >
                {isKlasifikasiButtonLoading && <LoadingSpinner />}
                {language === "en" ? "Classify" : "Klasifikasi"}
            </Button>
            </div>
        </div>
        </ComponentCard>
        )}

        {/* Result Table */}
        <ResultTable latestData={latestData ?? null} />
        
        </>
    )
}