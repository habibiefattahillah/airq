// app/api/accounts/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const { pathname } = new URL(req.url);
        const parts = pathname.split('/');
        const id = parts[parts.length - 1];

    try {
        const account = await prisma.account.findUnique({
        where: { id: id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        },
        })

        if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
        }

        return NextResponse.json(account)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
