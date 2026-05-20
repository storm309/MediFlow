import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const vitals = [
    { icon: '❤️', label: 'Heart Rate', value: '78 bpm', color: 'text-red-400' },
    { icon: '💧', label: 'SpO₂',       value: '98%',    color: 'text-blue-400' },
    { icon: '🌡️', label: 'Temp',       value: '98.4°F', color: 'text-amber-400' },
    { icon: '🩸', label: 'Blood Sugar', value: '112 mg/dL', color: 'text-purple-400' },
];

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-[52%] flex-col p-10 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #070d1c 0%, #0c1630 40%, #0f1a40 70%, #070d1c 100%)' }}
            >
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="animate-orb absolute -top-32 -left-32 w-96 h-96 rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)' }} />
                    <div className="animate-orb absolute bottom-0 -right-16 w-80 h-80 rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', animationDelay: '-4s' }} />
                    <div className="animate-orb absolute top-1/2 left-1/3 w-64 h-64 rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', animationDelay: '-8s' }} />
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '40px 40px' }}
                    />
                </div>

                {/* Logo */}
                <Link to="/" className="relative flex items-center gap-2.5 w-fit">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <svg className="w-6 h-6 text-white animate-heartbeat" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                    </div>
                    <div>
                        <p className="font-black text-xl text-white tracking-tight">MediFlow</p>
                        <p className="text-xs text-indigo-300/70">Patient Monitoring</p>
                    </div>
                </Link>

                {/* Main copy */}
                <div className="relative flex-1 flex flex-col justify-center">
                    <div className="mb-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-xs font-semibold rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full badge-pulse" />
                            Live WebSocket Monitoring
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-white leading-tight mt-4 mb-4 tracking-tight">
                        Monitor patients<br />
                        <span className="gradient-text">in real time</span>
                    </h2>
                    <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                        AI-powered alerts, live vitals, automated PDF reports — all from one beautiful dashboard.
                    </p>

                    {/* Fake vitals card */}
                    <div className="mt-8 glass rounded-2xl p-5 max-w-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs text-slate-400">Patient</p>
                                <p className="font-semibold text-white text-sm">John Doe</p>
                            </div>
                            <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Live
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {vitals.map((v) => (
                                <div key={v.label} className="bg-white/5 rounded-xl p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">{v.label}</span>
                                        <span className="text-base">{v.icon}</span>
                                    </div>
                                    <p className={`font-bold text-sm mt-1 ${v.color}`}>{v.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="relative text-slate-600 text-xs">&copy; {new Date().getFullYear()} MediFlow. All rights reserved.</p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12" style={{ background: 'var(--page-bg)' }}>
                {/* Mobile logo */}
                <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                    </div>
                    <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">MediFlow</span>
                </Link>

                <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-2xl shadow-indigo-500/5 border border-indigo-100/80 dark:border-white/5 p-8 animate-fade-in-up">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
