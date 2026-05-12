import React from 'react';

/**
 * Simple metric card component.
 * Props: title, value, unit, icon, trend (up|down|neutral), color (blue|green|red|yellow|purple)
 */
const colorMap = {
    blue:   'bg-blue-100   dark:bg-blue-900/30  text-blue-600',
    green:  'bg-green-100  dark:bg-green-900/30 text-green-600',
    red:    'bg-red-100    dark:bg-red-900/30   text-red-600',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    cyan:   'bg-cyan-100   dark:bg-cyan-900/30  text-cyan-600',
};

export default function MetricCard({ title, value, unit = '', icon, color = 'blue', trend, loading }) {
    const iconClass = colorMap[color] ?? colorMap.blue;

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-3" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                        {value ?? '—'}
                        {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
                    </p>
                    {trend && (
                        <p className={`text-xs mt-1 font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-500'}`}>
                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} trending
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconClass}`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
