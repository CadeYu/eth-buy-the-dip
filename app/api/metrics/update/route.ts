import { NextResponse } from 'next/server';
import { updateConfig } from '@/lib/metrics';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Convert flat body to config structure
        const configUpdate = {
            cohorts: body.cost.cohorts,
            manual_overrides: {
                sentiment: body.sentiment.value,
                structure: body.structure.value,
                momentum: body.momentum.score,
            }
        };

        const updated = updateConfig(configUpdate);
        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 });
    }
}
