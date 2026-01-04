import React from 'react';

interface StrategyScoreProps {
    score: number;
}

const StrategyScore: React.FC<StrategyScoreProps> = ({ score }) => {
    // Score 0-6
    const getScoreData = (s: number) => {
        if (s <= 1) return { text: '市场防御 (Defensive)', color: 'text-purple-400' };
        if (s <= 3) return { text: '动能衰减 (Weak)', color: 'text-blue-400' };
        return { text: '趋势向上 (Healthy)', color: 'text-green-400' };
    };

    const { text, color } = getScoreData(score);

    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row items-center justify-between">
            <div>
                <h2 className="text-gray-400 font-medium text-sm uppercase tracking-wider mb-1">动能综合评分 (Momentum Score)</h2>
                <div className={`text-3xl font-bold ${color}`}>{score} / 6</div>
                <div className="text-sm text-gray-400 mt-1">{text}</div>
            </div>

            <div className="flex gap-1 mt-4 md:mt-0">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-3 h-8 rounded-sm ${i < score ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default StrategyScore;
