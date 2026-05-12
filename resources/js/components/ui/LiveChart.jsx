import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format } from 'date-fns';

export default function LiveChart({ data = [], fields = [], title }) {
    const formatted = data
        .slice()
        .reverse()
        .map((m) => ({
            ...m,
            time: m.timestamp ? format(new Date(m.timestamp), 'HH:mm') : '',
        }));

    return (
        <div className="card p-5">
            {title && (
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
                    <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                    <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Live
                    </span>
                </div>
            )}
            {formatted.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p className="text-sm">No data yet</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.07} />
                        <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                background: '#0f172a',
                                border: '1px solid rgba(99,102,241,0.2)',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#f1f5f9',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            }}
                            labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: 12 }} />
                        {fields.map((f) => (
                            <Line
                                key={f.key}
                                type="monotone"
                                dataKey={f.key}
                                name={f.label}
                                stroke={f.color ?? '#3b82f6'}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 2, fill: f.color ?? '#3b82f6', stroke: '#fff' }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
