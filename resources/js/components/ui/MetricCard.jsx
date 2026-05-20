import React from 'react';

const colorMap = {
    blue:   { bg: 'from-indigo-500 to-violet-600',   ring: 'shadow-indigo-500/30',   light: 'bg-indigo-50  dark:bg-indigo-900/20',  text: 'text-indigo-600  dark:text-indigo-400' },
    green:  { bg: 'from-emerald-500 to-teal-600',    ring: 'shadow-emerald-500/30',  light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    red:    { bg: 'from-rose-500 to-pink-600',       ring: 'shadow-rose-500/30',     light: 'bg-rose-50   dark:bg-rose-900/20',    text: 'text-rose-600   dark:text-rose-400' },
    yellow: { bg: 'from-amber-500 to-orange-500',    ring: 'shadow-amber-500/30',    light: 'bg-amber-50 dark:bg-amber-900/20',    text: 'text-amber-600 dark:text-amber-400' },
    purple: { bg: 'from-violet-500 to-purple-600',   ring: 'shadow-violet-500/30',   light: 'bg-violet-50 dark:bg-violet-900/20',  text: 'text-violet-600 dark:text-violet-400' },
    cyan:   { bg: 'from-cyan-500 to-sky-600',        ring: 'shadow-cyan-500/30',     light: 'bg-cyan-50  dark:bg-cyan-900/20',     text: 'text-cyan-600  dark:text-cyan-400' },
    orange: { bg: 'from-orange-500 to-red-400',      ring: 'shadow-orange-500/30',   light: 'bg-orange-50 dark:bg-orange-900/20',  text: 'text-orange-600 dark:text-orange-400' },
    indigo: { bg: 'from-indigo-500 to-violet-600',   ring: 'shadow-indigo-500/30',   light: 'bg-indigo-50 dark:bg-indigo-900/20',  text: 'text-indigo-600 dark:text-indigo-400' },
};

const TrendArrow = ({ trend }) => {
    if (!trend || trend === 'neutral') return null;
    const up = trend === 'up';
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
            {up ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
            ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            )}
            {up ? 'Trending up' : 'Trending down'}
        </span>
    );
};

export default function MetricCard({ title, value, unit = '', icon, color = 'blue', trend, loading }) {
    const c = colorMap[color] ?? colorMap.blue;

    if (loading) {
        return (
            <div className="card p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="skeleton h-4 w-28 rounded" />
                    <div className="skeleton w-11 h-11 rounded-2xl" />
                </div>
                <div className="skeleton h-8 w-20 rounded mb-2" />
                <div className="skeleton h-3 w-24 rounded" />
            </div>
        );
    }

    return (
        <div className="card p-5 hover:-translate-y-1 transition-all duration-250 cursor-default">
            <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                {icon && (
                    <div className={`w-12 h-12 bg-gradient-to-br ${c.bg} rounded-2xl flex items-center justify-center text-white shadow-xl ${c.ring} text-lg flex-shrink-0`}>
                        {icon}
                    </div>
                )}
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {value ?? '—'}
                {unit && <span className="text-base font-medium text-slate-400 ml-1.5">{unit}</span>}
            </p>
            <div className="mt-3">
                <TrendArrow trend={trend} />
                {!trend && (
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${c.bg} rounded-full w-3/4 transition-all duration-700`} />
                    </div>
                )}
            </div>
        </div>
    );
}
