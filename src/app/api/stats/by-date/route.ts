import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const allTimestamps = await prisma.data.findMany({
        select: { timestamp: true },
        });

        // Group by date string
        const countsByDate: Record<string, number> = {};

        for (const entry of allTimestamps) {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        countsByDate[date] = (countsByDate[date] || 0) + 1;
        }

        // Convert to array of { date, count }
        const grouped = Object.entries(countsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json(grouped);
    } catch (error) {
        console.error('Error in /api/stats/by-date:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
