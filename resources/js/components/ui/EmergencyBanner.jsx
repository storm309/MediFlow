import React, { useState } from 'react';

/**
 * EmergencyBanner — shown when SpO2 < 85 OR heart_rate > 130.
 * Displays a pulsing red banner with the specific metric(s) that triggered it.
 */
export default function EmergencyBanner({ latest }) {
    const [dismissed, setDismissed] = useState(false);

    const lowSpo2 = latest?.spo2 !== null && latest?.spo2 !== undefined && latest.spo2 < 85;
    const highHR  = latest?.heart_rate !== null && latest?.heart_rate !== undefined && latest.heart_rate > 130;
    const isEmergency = lowSpo2 || highHR;

    if (!isEmergency || dismissed) return null;

    return (
        <div className="relative animate-pulse-border rounded-xl overflow-hidden">
            <div className="bg-red-600 dark:bg-red-700 text-white px-5 py-4 rounded-xl shadow-2xl shadow-red-600/40 border-2 border-red-400">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Pulsing red dot */}
                        <div className="relative shrink-0">
                            <span className="absolute inline-flex h-4 w-4 rounded-full bg-red-300 opacity-75 animate-ping" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-white" />
                        </div>

                        <div>
                            <p className="font-black text-lg tracking-tight leading-tight">
                                🚨 EMERGENCY — Immediate Attention Required
                            </p>
                            <div className="flex flex-wrap gap-3 mt-1">
                                {lowSpo2 && (
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <circle cx="12" cy="12" r="9" strokeLinecap="round" />
                                        </svg>
                                        SpO₂ critically low: {latest.spo2}%
                                        <span className="text-xs opacity-75">(normal: ≥95%)</span>
                                    </span>
                                )}
                                {highHR && (
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Heart rate dangerously high: {latest.heart_rate} bpm
                                        <span className="text-xs opacity-75">(normal: 60–100)</span>
                                    </span>
                                )}
                            </div>
                            <p className="text-xs mt-2 text-red-200">
                                Your doctor and admin have been notified automatically. Please seek medical attention immediately.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setDismissed(true)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                        title="Dismiss banner"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
