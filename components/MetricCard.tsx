import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    status: 'bullish' | 'bearish' | 'neutral';
    description: string;
    threshold?: string;
    source?: 'Live API' | 'Static (Tweet)' | 'Proxy Est.'; // New prop for transparency
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, status, description, threshold, source }) => {
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'bullish': return 'text-green-400 border-green-500/30 bg-green-500/10';
            case 'bearish': return 'text-red-400 border-red-500/30 bg-red-500/10';
            default: return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
        }
    };

    const getSourceBadge = (s?: string) => {
        if (!s) return null;
        let color = 'bg-gray-800 text-gray-400';
        if (s === 'Live API') color = 'bg-blue-900/50 text-blue-300 border border-blue-500/30';
        if (s === 'Proxy Est.') color = 'bg-purple-900/50 text-purple-300 border border-purple-500/30';
        return <span className={`text-[10px] px-2 py-0.5 rounded ml-2 ${color}`}>{s}</span>;
    };

    return (
        <div className={`relative p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:scale-[1.02] bg-white/5 border-white/10`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                    <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">{title}</h3>
                    {getSourceBadge(source)}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(status)}`}>
                    {status.toUpperCase()}
                </span>
            </div>

            <div className="mb-2">
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                {subValue && <div className="text-sm text-gray-400">{subValue}</div>}
            </div>

            <div className="space-y-2 mt-4">
                {threshold && (
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>目标阈值: {threshold}</span>
                    </div>
                )}
                <p className="text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default MetricCard;
