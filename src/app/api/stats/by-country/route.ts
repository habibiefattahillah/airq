// /api/stats/by-country/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await prisma.data.findMany({
            select: {
                location: {
                    select: {
                        country: true,
                    },
                },
            },
        });

        const counts: Record<string, number> = {};

        for (const entry of data) {
            const country = entry.location?.country ?? 'Unknown';
            counts[country] = (counts[country] || 0) + 1;
        }

        const grouped = Object.entries(counts)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count);

        const top5 = grouped.slice(0, 5);
        const otherCount = grouped.slice(5).reduce((sum, item) => sum + item.count, 0);

        const result = [...top5];
        if (otherCount > 0) {
            result.push({ country: 'Other', count: otherCount });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in /api/stats/by-country:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
