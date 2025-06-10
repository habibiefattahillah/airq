// app/api/accounts/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
    const accounts = await prisma.account.findMany({
        select: {
        id: true,
        email: true,
        name: true,
        role: true,
        },
    })

    return NextResponse.json(accounts)
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 })
    }
}
