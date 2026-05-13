import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const features = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        color: 'from-red-500 to-pink-600',
        bg: 'bg-red-50',
        title: 'Live Vital Monitoring',
        desc: 'Stream heart rate, SpOâ‚‚, blood pressure, temperature and blood sugar â€” all updating in real time via WebSocket.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        color: 'from-amber-500 to-orange-600',
        bg: 'bg-amber-50',
        title: 'AI Smart Alerts',
        desc: 'Threshold-based alerts instantly notify doctors when a patient enters a critical, warning or emergency state.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        color: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        title: 'PDF Health Reports',
        desc: 'Auto-generate detailed health reports with trend charts, doctor notes and downloadable PDF exports.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        color: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50',
        title: 'Appointment Management',
        desc: 'Schedule, confirm and track doctor-patient appointments with real-time status notifications.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        color: 'from-purple-500 to-violet-600',
        bg: 'bg-purple-50',
        title: 'Trend Analytics',
        desc: 'Interactive charts show vitals over time, helping doctors spot patterns and make data-driven decisions.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        color: 'from-slate-600 to-slate-800',
        bg: 'bg-slate-50',
        title: 'Secure & Role-Based',
        desc: 'JWT authentication with Admin, Doctor and Patient roles â€” each user sees only what they need.',
    },
];

const stats = [
    { value: '3', label: 'User Roles', icon: 'ðŸ‘¥' },
    { value: '21+', label: 'Health Metrics Tracked', icon: 'ðŸ“Š' },
    { value: 'Live', label: 'WebSocket Updates', icon: 'âš¡' },
    { value: '100%', label: 'Open Source', icon: 'ðŸ”“' },
];

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* â”€â”€ Navbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white animate-heartbeat" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </div>
                        <div>
                            <p className={`font-bold text-lg leading-none tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>MediFlow</p>
                            <p className={`text-xs leading-none ${scrolled ? 'text-slate-500' : 'text-blue-200'}`}>Patient Monitoring</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                scrolled ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Sign In
                        </Link>
                        <Link to="/register"
                            className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 -left-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
                    {/* Grid */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Text */}
                        <div className="animate-fade-in-up">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold rounded-full uppercase tracking-widest mb-6">
                                <span className="w-2 h-2 bg-green-400 rounded-full badge-pulse" />
                                Live Monitoring Active
                            </span>
                            <h1 className="text-5xl lg:text-6xl font-black leading-[1.08] text-white mb-6 tracking-tight">
                                Remote Patient<br />
                                <span className="gradient-text">Monitoring</span><br />
                                Reimagined
                            </h1>
                            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
                                MediFlow gives doctors real-time visibility into patient vitals, smart AI-powered alerts, and automated health reports â€” all in one beautiful dashboard.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/register"
                                    className="btn-primary text-base px-8 py-3.5 shadow-2xl shadow-blue-500/40"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Start Monitoring
                                </Link>
                                <Link to="/login"
                                    className="flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white/80 border border-white/20 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Sign In to Dashboard
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                            {/* Trust row */}
                            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/10">
                                {[
                                    { n: '3+', t: 'User Roles' },
                                    { n: 'Live', t: 'WebSocket' },
                                    { n: 'Free', t: 'Open Source' },
                                ].map((s) => (
                                    <div key={s.t}>
                                        <p className="text-xl font-bold text-white">{s.n}</p>
                                        <p className="text-xs text-slate-400">{s.t}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Dashboard mockup card */}
                        <div className="hidden lg:block animate-float">
                            <div className="glass rounded-2xl p-6 shadow-2xl shadow-black/40">
                                {/* Fake topbar */}
                                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                                    <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold text-white">Patient Vitals â€” John Doe</p>
                                    <span className="ml-auto flex items-center gap-1.5 text-green-400 text-xs font-medium">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        Live
                                    </span>
                                </div>
                                {/* Metric mini-cards */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {[
                                        { icon: 'â¤ï¸', label: 'Heart Rate', val: '78', unit: 'bpm', ok: true },
                                        { icon: 'ðŸ’§', label: 'SpOâ‚‚',       val: '98', unit: '%',   ok: true },
                                        { icon: 'ðŸŒ¡ï¸', label: 'Temp',       val: '98.4', unit: 'Â°F', ok: true },
                                        { icon: 'ðŸ©¸', label: 'Sugar',      val: '112', unit: 'mg/dL', ok: true },
                                    ].map((m) => (
                                        <div key={m.label} className="bg-white/10 rounded-xl p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-slate-300">{m.label}</span>
                                                <span className="text-base">{m.icon}</span>
                                            </div>
                                            <p className="text-lg font-bold text-white">{m.val}<span className="text-xs text-slate-400 ml-1">{m.unit}</span></p>
                                            <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-400 rounded-full" style={{ width: '72%' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Fake chart */}
                                <div className="bg-white/5 rounded-xl p-3">
                                    <p className="text-xs text-slate-400 mb-2">Vitals Trend (last 24h)</p>
                                    <svg viewBox="0 0 240 60" className="w-full" fill="none">
                                        <polyline points="0,45 30,38 60,42 90,30 120,35 150,22 180,28 210,18 240,24"
                                            stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinejoin="round" />
                                        <polyline points="0,50 30,48 60,47 90,45 120,46 150,44 180,43 210,42 240,41"
                                            stroke="#06b6d4" strokeWidth="2" fill="none" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                {/* Alert chip */}
                                <div className="mt-3 flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-lg px-3 py-2">
                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="text-xs text-green-300 font-medium">All vitals within normal range</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom wave */}
                <div className="absolute bottom-0 inset-x-0">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 80 C360 0 1080 0 1440 80 V80 H0 Z" fill="white"/>
                    </svg>
                </div>
            </section>

            {/* â”€â”€ Stats Strip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="py-12 bg-white border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((s) => (
                        <div key={s.label} className="animate-fade-in-up">
                            <p className="text-3xl mb-1">{s.icon}</p>
                            <p className="text-2xl font-black text-slate-900">{s.value}</p>
                            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* â”€â”€ Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Everything You Need</span>
                        <h2 className="text-4xl font-black text-slate-900 mt-3 tracking-tight">
                            Built for modern healthcare teams
                        </h2>
                        <p className="text-slate-500 mt-4 max-w-xl mx-auto leading-relaxed">
                            From real-time vitals to automated PDF reports, MediFlow covers every aspect of remote patient monitoring.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div
                                key={f.title}
                                className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                style={{ animationDelay: `${i * 0.08}s` }}
                            >
                                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${f.color} text-white`}>
                                    {f.icon}
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* â”€â”€ Roles section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Role-Based Access</span>
                        <h2 className="text-4xl font-black text-slate-900 mt-3 tracking-tight">One platform, three perspectives</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                emoji: 'ðŸ”‘',
                                role: 'Admin',
                                color: 'border-t-slate-900',
                                badge: 'bg-slate-900',
                                perks: ['Manage all users', 'System analytics', 'Activity audit logs', 'Platform KPIs'],
                            },
                            {
                                emoji: 'ðŸ©º',
                                role: 'Doctor',
                                color: 'border-t-blue-600',
                                badge: 'bg-blue-600',
                                perks: ['Monitor assigned patients', 'Receive live critical alerts', 'Generate PDF reports', 'Manage appointments'],
                            },
                            {
                                emoji: 'ðŸ¥',
                                role: 'Patient',
                                color: 'border-t-emerald-600',
                                badge: 'bg-emerald-600',
                                perks: ['View your health trends', 'Track appointments', 'Download health reports', 'In-app notifications'],
                            },
                        ].map((r) => (
                            <div key={r.role} className={`rounded-2xl border border-slate-100 border-t-4 ${r.color} p-7 shadow-sm hover:shadow-lg transition-shadow`}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`w-11 h-11 ${r.badge} rounded-2xl flex items-center justify-center text-xl`}>
                                        {r.emoji}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-lg">{r.role}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${r.badge}`}>{r.role} Portal</span>
                                    </div>
                                </div>
                                <ul className="space-y-2.5">
                                    {r.perks.map((p) => (
                                        <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                                            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black text-white tracking-tight mb-5">
                        Ready to transform your clinic?
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed mb-10">
                        Get started with MediFlow today â€” free, open source, and ready for your patients in minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register"
                            className="px-10 py-4 bg-white text-blue-700 font-bold rounded-2xl shadow-2xl hover:shadow-white/30 hover:-translate-y-1 transition-all text-sm"
                        >
                            Create Free Account
                        </Link>
                        <Link to="/login"
                            className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/20 transition-all text-sm"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <footer className="bg-slate-900 text-slate-400 py-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </div>
                        <span className="font-semibold text-white text-sm">MediFlow</span>
                    </div>
                    <p className="text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} MediFlow. Built with â¤ï¸ for better healthcare. Open Source under MIT License.
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                        <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                        <Link to="/register" className="hover:text-white transition-colors">Register</Link>
                        <a href="https://github.com/storm309/MediFlow" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
