'use client';

import { useEffect, useState } from 'react';
import MetricCard from '@/components/MetricCard';
import EditableMetric from '@/components/EditableMetric';
import StrategyScore from '@/components/StrategyScore';
import Link from 'next/link';

interface MetricsData {
    sentiment: { value: number; status: 'bullish' | 'neutral' | 'bearish' };
    fearAndGreed: { value: number; status: string }; // New field
    structure: { value: number; status: 'bullish' | 'neutral' | 'bearish' };
    cost: { currentPrice: number; cohorts: { '1k_10k': number; '10k_100k': number; 'over_100k': number } };
    momentum: { score: number };
    lastUpdated: string;
}

export default function Home() {
    const [data, setData] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/metrics')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            });
    }, []);

    if (loading || !data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Data...</div>;

    // Strategy Logic Calculation
    const isSentimentReady = data.sentiment.value < 0; // LTH-NUPL < 0
    const isStructureReady = data.structure.value < 0.5; // PSIP < 50%

    const whales = data.cost.cohorts;
    const price = data.cost.currentPrice;
    const isCostReady = price < whales['1k_10k'] && price < whales['10k_100k'] && price < whales['over_100k'];

    // Note: Tweet logic implies Momentum < 1 is BAD ("structure turning weak"). 
    // Wait, tweet says: "In addition to the independent standards... check momentum".
    // "When composite score < 1... market enters defensive stage".
    // The goal is "Buy The Dip". Usually you want to buy when blood is in streets but structure is intact?
    // Or buy when momentum recovers?
    // Tweet conclusion: "Meet at least 2 of the 4 standards".
    // Standard 4 (Momentum): Let's assume High > Low is better for specific setups, OR "Score > 1" avoids the crash.
    // Actually Murphy says: "When score < 1... market enters defensive stage." (Bad for bulls). 
    // So Momentum condition might be "Score >= 1" or "Score is improving".
    // BUT, usually "Dip Buying" happens when metrics are oversold.
    // Let's stick strictly to: "Satisfy 2 conditions". 
    // Condition 1: Emotion (NUPL < 0) -> High Conviction Dip.
    // Condition 2: Structure (PSIP < 50%) -> High Conviction Dip.
    // Condition 3: Cost (Price < Whales) -> High Conviction Dip.
    // Condition 4: Momentum. If score < 1, it's "Defensive". Maybe condition is "Not < 1"? Or is "Oversold"?
    // Re-reading tweet: "Score < 1 ... structure weakening". 
    // Let's count the number of "TRUE" dip signals.

    let signals = 0;
    if (isSentimentReady) signals++;
    if (isStructureReady) signals++;
    if (isCostReady) signals++;
    // For momentum, it's ambiguous if "Low Score" is a BUY signal or WARNING.
    // Usually "Momentum < 1" means "Downtrend". buying the dip in a downtrend is risky unless other signals are strong.
    // Let's treat "Momentum < 1" as a WARNING (Not a buy signal).
    // So maybe the 4th condition is "Momentum is recovering" or just simple: 
    // Murphy says "4 conditions... currently none met". Currently score is 2. 
    // So score 2 is NOT "good enough" for him? Or maybe 2 is "Neutral".
    // Let's simplify: Just count the first 3 clear signals for now.

    const getDecision = () => {
        if (signals >= 3) return { text: '大力抄底 (STRONG BUY)', color: 'text-green-500' };
        if (signals === 2) return { text: '小额建仓 (BUY)', color: 'text-blue-400' };
        return { text: '继续观望 (WAIT)', color: 'text-gray-500' };
    };

    const decision = getDecision();

    return (
        <main className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-purple-500/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                            ETH 抄底信号监控
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm">基于 Murphychen888 策略模型</p>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                        <div className="text-sm text-gray-500">当前建议</div>
                        <div className={`text-3xl font-bold ${decision.color} tracking-tight`}>{decision.text}</div>
                        <div className="text-xs text-gray-600 mt-1">满足条件: {signals} / 3 (主要)</div>
                    </div>
                </header>

                {/* Momentum Score */}
                <div className="grid grid-cols-1 gap-6">
                    <StrategyScore score={data.momentum.score} />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 1. Emotion */}
                    {/* 1. Emotion */}
                    <MetricCard
                        title="1. 情绪 (Emotion)"
                        value={data.fearAndGreed.value}
                        subValue={`状态: ${data.fearAndGreed.status}`}
                        status={data.fearAndGreed.value < 20 ? 'bullish' : 'neutral'}
                        threshold="Index < 20"
                        description="当前使用 '恐慌贪婪指数' 作为实时情绪参考。Index < 20 (极度恐慌) 通常对应 LTH-NUPL 的底部区域。"
                        source="Proxy Est."
                    />

                    {/* 2. Structure */}
                    <EditableMetric
                        title="2. 结构 (Structure)"
                        initialValue={data.structure.value}
                        description="PSIP (盈利供应百分比)。点击右上角 edit 可快速修正。(< 50% 极佳)"
                        threshold="< 50%"
                        source="Static (Tweet)"
                        metricKey="structure"
                    />

                    {/* 3. Cost */}
                    <div className="md:col-span-2 lg:col-span-1 relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                        <div className="flex justify-between mb-4">
                            <div className="flex items-center">
                                <h3 className="text-gray-400 font-medium text-sm uppercase">3. 成本 (Cost)</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded ml-2 bg-blue-900/50 text-blue-300 border border-blue-500/30">Live API</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${isCostReady ? 'text-green-400 border-green-500/30' : 'text-gray-400 border-gray-500/30'}`}>
                                {isCostReady ? 'UNDERSOLD' : 'PREMIUM'}
                            </span>
                        </div>
                        <div className="mb-4">
                            <div className="text-3xl font-bold text-white">${data.cost.currentPrice}</div>
                            <div className="text-sm text-gray-500">当前价格</div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">1k-10k 鲸鱼:</span>
                                <span className={data.cost.currentPrice < whales['1k_10k'] ? 'text-green-400' : 'text-red-400'}>${whales['1k_10k']}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">10k-100k 鲸鱼:</span>
                                <span className={data.cost.currentPrice < whales['10k_100k'] ? 'text-green-400' : 'text-red-400'}>${whales['10k_100k']}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">{`>100k`} 鲸鱼:</span>
                                <span className={data.cost.currentPrice < whales['over_100k'] ? 'text-green-400' : 'text-red-400'}>${whales['over_100k']}</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-white/5">
                            当价格低于这三个主要鲸鱼群体的成本价时，性价比极高。
                        </p>
                    </div>
                </div>

                <div className="text-center pt-12">
                    <Link href="/admin" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
                        管理数据入口
                    </Link>
                </div>
            </div>
        </main>
    );
}
