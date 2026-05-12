import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format } from 'date-fns';

/**
 * Props:
 *  - data: array of metric objects with `timestamp`, `heart_rate`, `spo2`, etc.
 *  - fields: [{ key: 'heart_rate', label: 'Heart Rate', color: '#2563EB' }, ...]
 *  - title: chart title string
 */
export default function LiveChart({ data = [], fields = [], title }) {
    const formatted = data
        .slice()
        .reverse()
        .map((m) => ({
            ...m,
            time: m.timestamp ? format(new Date(m.timestamp), 'HH:mm') : '',
        }));

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            {title && <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{
                            background: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#f1f5f9',
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {fields.map((f) => (
                        <Line
                            key={f.key}
                            type="monotone"
                            dataKey={f.key}
                            name={f.label}
                            stroke={f.color ?? '#2563EB'}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
