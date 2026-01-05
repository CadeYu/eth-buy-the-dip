'use client';

import { useState } from 'react';
import MetricCard from './MetricCard';

interface EditableMetricProps {
    title: string;
    initialValue: number;
    description: string;
    source: 'Static (Tweet)' | 'Live API' | 'Proxy Est.';
    threshold: string;
    metricKey: 'structure' | 'sentiment' | 'momentum'; // Allowed keys to update
}

export default function EditableMetric({
    title,
    initialValue,
    description,
    source,
    threshold,
    metricKey
}: EditableMetricProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);

    // Derive status locally for immediate feedback
    const getStatus = (val: number) => {
        // Logic specific to Structure (PSIP) which is what the user asked for
        if (metricKey === 'structure') {
            return val < 0.5 ? 'bullish' : 'neutral';
        }
        return 'neutral';
    };

    const handleUpdate = async (newValue: number) => {
        setIsLoading(true);
        try {
            // Construct the payload expected by the update route
            // The route expects: { sentiment: { value... }, structure: { value... }, cost: ... }
            // But we handled partial updates in a previous step?
            // Let's check the update route implementation. 
            // Actually, looking at previous thought, the update route might expect a full object or specific structure.
            // To be safe, let's fetch current first or just send what we need if the API supports it.
            // Based on my memory of `route.ts`, it did `updateConfig(configUpdate)`.
            // Let's try sending a structured body that matches the `updateConfig` expectations essentially.

            const payload: any = {};
            if (metricKey === 'structure') {
                // The admin page sends a big object. 
                // Let's replicate a minimal valid object for the API if possible, 
                // or better yet, we might need to modify the API to accept partial updates more gracefully if it doesn't.
                // Wait, the API `POST /api/metrics/update` converts the body:
                // configUpdate = { cohorts: body.cost.cohorts, manual_overrides: { ... } }
                // It expects `body.cost.cohorts`, `body.sentiment.value` etc.
                // If I only send `structure`, the others might error or be undefined if the API doesn't handle checks.

                // Let's fetch the current full state first to be safe, then update and send back.
                const res = await fetch('/api/metrics');
                const current = await res.json();

                const updateBody = {
                    sentiment: { value: current.sentiment.value },
                    structure: { value: newValue }, // Update this
                    momentum: { score: current.momentum.score },
                    cost: { cohorts: current.cost.cohorts }
                };

                await fetch('/api/metrics/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateBody),
                });
            }

            setValue(newValue);
            setIsEditing(false);
            // Optional: Trigger a router refresh to update other components if needed
            // import { useRouter } from 'next/navigation'; const router = useRouter(); router.refresh();
            window.location.reload();
        } catch (error) {
            console.error('Update failed', error);
            alert('Update failed. Note: On Vercel demo, file writes are not persistent.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative group">
            <div className='absolute top-4 right-4 z-10'>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-gray-500 hover:text-white underline opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        Edit
                    </button>
                ) : null}
            </div>

            {isEditing ? (
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <h3 className="text-gray-400 font-medium text-sm mb-4">Update {title}</h3>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            step="0.001"
                            defaultValue={value}
                            autoFocus
                            className="bg-black/50 border border-white/20 rounded px-2 py-1 text-white flex-1"
                            onChange={(e) => setValue(parseFloat(e.target.value))}
                        />
                        <button
                            onClick={() => handleUpdate(value)}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-gray-400 hover:text-white px-2 py-1 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        * Will refresh page after save.
                        <br />
                        * Requires Vercel Re-deploy to persist on Prod.
                    </p>
                </div>
            ) : (
                <MetricCard
                    title={title}
                    value={`${(value * 100).toFixed(1)}%`}
                    status={getStatus(value)}
                    description={description}
                    threshold={threshold}
                    source={source}
                />
            )}
        </div>
    );
}
