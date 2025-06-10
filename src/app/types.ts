export type Account = {
    id: string
    name: string
    email: string
    role: string
}

export type Location = {
    id: number
    name: string
    latitude: number
    longitude: number
    state: string | null
    country: string | null
    address: string | null
}

export type Data = {
    id: number
    timestamp: string
    account: {
        id: string
        name: string
    }
    location: {
        id: number
        name: string
        latitude: number
        longitude: number
        state: string | null
        country: string | null
        address: string | null
    }
    parameters: Parameters
    wqi: {
        [model: string]: {
        value: number
        confidence: number
        }
    }
}

type ParameterValue = {
    value: number | null
    isImputed: boolean
}

export type Parameters = {
    Temperatur: ParameterValue
    OksigenTerlarut: ParameterValue
    SaturasiOksigen: ParameterValue
    Konduktivitas: ParameterValue
    Kekeruhan: ParameterValue
    PH: ParameterValue
    ZatPadatTerlarut: ParameterValue
}