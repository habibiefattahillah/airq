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
        // Do NOT include password unless you intend to (be careful)
        },
    })

    return NextResponse.json(accounts)
    } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
    }
}
