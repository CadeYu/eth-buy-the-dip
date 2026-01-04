import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metrics';

export async function GET() {
    const data = await getMetrics();
    return NextResponse.json(data);
}
