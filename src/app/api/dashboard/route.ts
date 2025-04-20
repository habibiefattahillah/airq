// app/api/accounts/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
    // Get total number of accounts

    const accountCount = await prisma.account.count()
    
    const locations = await prisma.location.findMany({
        select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        },
    })

    const locationCount = locations.length
    // const locationDistribution = await Promise.all(
    //     locations.map(async (location) => {
    //     const response = await fetch(
    //         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    //     )
    //     const data = await response.json()
    //     const country = data.results[0].address_components.find((component: any) =>
    //         component.types.includes('country')
    //     )
    //     return {
    //         locationId: location.id,
    //         country: country ? country.long_name : 'Unknown',
    //     }
    //     })
    // )

    // console.log('Location distribution:', locationDistribution)

    // const countryDistribution = locationDistribution.reduce((acc: any, loc: any) => {
    //     const country = loc.country || 'Unknown'
    //     if (!acc[country]) {
    //     acc[country] = 0
    //     }
    //     acc[country]++
    //     return acc
    // }
    // , {})

    // const wqiDistribution = await prisma.data.groupBy({
    //     by: ['wqi'],
    //     _count: {
    //         wqi: true,
    //     },
    // })

    // Get total number of data
    const dataCount = await prisma.data.count()

    console.log('Total data count:', dataCount)

    const data = {
        accountCount,
        locationCount,
        // countryDistribution,
        dataCount,
    }

    console.log('Dashboard data:', data)

    return NextResponse.json(data)
    } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }
}
