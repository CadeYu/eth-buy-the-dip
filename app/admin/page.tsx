'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
    const [formData, setFormData] = useState({
        sentimentValue: 0,
        structureValue: 0,
        currentPrice: 0,
        cost1k: 0,
        cost10k: 0,
        cost100k: 0,
        momentumScore: 0,
    });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/metrics')
            .then(res => res.json())
            .then(data => {
                setFormData({
                    sentimentValue: data.sentiment.value,
                    structureValue: data.structure.value,
                    currentPrice: data.cost.currentPrice,
                    cost1k: data.cost.cohorts['1k_10k'],
                    cost10k: data.cost.cohorts['10k_100k'],
                    cost100k: data.cost.cohorts['over_100k'],
                    momentumScore: data.momentum.score,
                });
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('Saving...');

        const payload = {
            sentiment: { value: formData.sentimentValue, status: 'neutral' }, // status updated purely by display logic usually, but keep simple
            structure: { value: formData.structureValue, status: 'neutral' },
            cost: {
                currentPrice: formData.currentPrice,
                cohorts: {
                    '1k_10k': formData.cost1k,
                    '10k_100k': formData.cost10k,
                    'over_100k': formData.cost100k,
                }
            },
            momentum: { score: formData.momentumScore },
        };

        const res = await fetch('/api/metrics/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            setMsg('Success! Dashboard updated.');
        } else {
            setMsg('Error saving data.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Admin: Update Metrics</h1>
                    <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Dashboard</Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-6 rounded-xl border border-white/10">

                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-purple-400 border-b border-white/10 pb-2">1. Sentiment (LTH-NUPL)</h2>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Current Value (Float, ex: 0.4 or -0.2)</label>
                            <input type="number" step="0.01" name="sentimentValue" value={formData.sentimentValue} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded p-2 text-white" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-purple-400 border-b border-white/10 pb-2">2. Structure (PSIP)</h2>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Percentage (0.0 - 1.0, ex: 0.617)</label>
                            <input type="number" step="0.001" name="structureValue" value={formData.structureValue} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded p-2 text-white" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-purple-400 border-b border-white/10 pb-2">3. Cost Basis ($)</h2>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Current ETH Price</label>
                            <input type="number" name="currentPrice" value={formData.currentPrice} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded p-2 text-white" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">1k-10k Cost</label>
                                <input type="number" name="cost1k" value={formData.cost1k} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">10k-100k Cost</label>
                                <input type="number" name="cost10k" value={formData.cost10k} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">{`>100k Cost`}</label>
                                <input type="number" name="cost100k" value={formData.cost100k} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded p-2 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-purple-400 border-b border-white/10 pb-2">4. Momentum</h2>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Score (0 - 6)</label>
                            <input type="number" min="0" max="6" name="momentumScore" value={formData.momentumScore} onChange={handleChange} className="w-full bg-black/50 border border-white/20 rounded p-2 text-white" />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
                        Update Dashboard
                    </button>

                    {msg && <div className="text-center text-sm font-bold text-green-400 mt-2">{msg}</div>}
                </form>
            </div>
        </div>
    );
}
