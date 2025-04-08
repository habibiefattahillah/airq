import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET all locations
export async function GET() {
    const locations = await prisma.location.findMany()
    return NextResponse.json(locations)
}

// POST new location
export async function POST(req: Request) {
    const body = await req.json()
    const location = await prisma.location.create({ data: body })
    return NextResponse.json(location)
}
