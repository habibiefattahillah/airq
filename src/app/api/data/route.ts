// app/api/data/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const data = await prisma.data.findMany({
    include: {
        location: true,
        account: {
        select: { name: true }
        }
    }
    })
    return NextResponse.json(data)
}
