import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchRiskAnalysis,
    selectRisk,
    selectRiskLoading,
    selectRiskError,
} from '../../redux/slices/aiSlice';

const severityColors = {
    normal:    { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
    warning:   { bg: 'bg-amber-50 dark:bg-amber-900/20',    border: 'border-amber-200 dark:border-amber-700',    text: 'text-amber-700 dark:text-amber-400',    badge: 'bg-amber-100 text-amber-700' },
    critical:  { bg: 'bg-orange-50 dark:bg-orange-900/20',  border: 'border-orange-200 dark:border-orange-700',  text: 'text-orange-700 dark:text-orange-400',  badge: 'bg-orange-100 text-orange-700' },
    emergency: { bg: 'bg-red-50 dark:bg-red-900/20',        border: 'border-red-200 dark:border-red-700',        text: 'text-red-700 dark:text-red-400',        badge: 'bg-red-100 text-red-700' },
};

const riskLevelColors = {
    low:      'bg-emerald-100 text-emerald-700',
    medium:   'bg-amber-100 text-amber-700',
    high:     'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

export default function AiRiskCard({ patientId }) {
    const dispatch = useDispatch();
    const risk     = useSelector(selectRisk);
    const loading  = useSelector(selectRiskLoading);
    const error    = useSelector(selectRiskError);

    useEffect(() => {
        if (patientId) dispatch(fetchRiskAnalysis(patientId));
    }, [patientId]);

    const sev    = severityColors[risk?.severity ?? 'normal'];
    const score  = risk?.risk_score ?? 0;

    if (loading) {
        return (
            <div className="card p-5 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
                <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card p-5 border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <button onClick={() => dispatch(fetchRiskAnalysis(patientId))} className="mt-2 text-xs text-red-600 underline">
                    Retry
                </button>
            </div>
        );
    }

    if (!risk) return null;

    return (
        <div className={`card p-5 border ${sev.border} ${sev.bg}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5" />
                        </svg>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white text-sm">AI Risk Analysis</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${sev.badge}`}>
                    {risk.severity}
                </span>
            </div>

            {/* Score ring */}
            <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke={score > 70 ? '#ef4444' : score > 40 ? '#f59e0b' : '#10b981'}
                            strokeWidth="3"
                            strokeDasharray={`${score} ${100 - score}`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-white">
                        {score}
                    </span>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Risk Score</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{risk.summary}</p>
                </div>
            </div>

            {/* Risk tags */}
            {risk.risks?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {risk.risks.map((r, i) => (
                        <span key={i} className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${riskLevelColors[r.level] ?? 'bg-slate-100 text-slate-700'}`}>
                            {r.type.replace(/_/g, ' ')} — {r.level}
                        </span>
                    ))}
                </div>
            )}

            {/* Recommendations */}
            {risk.recommendations?.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Recommendations</p>
                    <ul className="space-y-1">
                        {risk.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Refresh button */}
            <button
                onClick={() => dispatch(fetchRiskAnalysis(patientId))}
                className="mt-4 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh analysis
            </button>
        </div>
    );
}
