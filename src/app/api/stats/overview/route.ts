import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const [accounts, data, locations] = await Promise.all([
        prisma.account.count(),
        prisma.data.count(),
        prisma.location.count()
    ]);

    return NextResponse.json({
        totalAccounts: accounts,
        totalData: data,
        totalLocations: locations
    });
}