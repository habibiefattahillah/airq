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
    parameters: {
        [key: string]: {
        value: number
        isImputed: boolean
        }
    }
    wqi: {
        [model: string]: {
        value: number
        confidence: number
        }
    }
}