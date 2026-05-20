import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const features = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        color: 'from-rose-500 to-pink-600',
        glow: 'rgba(244,63,94,0.3)',
        title: 'Live Vital Monitoring',
        desc: 'Stream heart rate, SpO2, blood pressure, temperature and blood sugar — all updating in real time via WebSocket.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        color: 'from-amber-500 to-orange-600',
        glow: 'rgba(245,158,11,0.3)',
        title: 'AI Smart Alerts',
        desc: 'Threshold-based alerts instantly notify doctors when a patient enters a critical, warning or emergency state.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        color: 'from-indigo-500 to-violet-600',
        glow: 'rgba(99,102,241,0.3)',
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
        glow: 'rgba(16,185,129,0.3)',
        title: 'Appointment Management',
        desc: 'Schedule, confirm and track doctor-patient appointments with real-time status notifications.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        color: 'from-violet-500 to-purple-600',
        glow: 'rgba(139,92,246,0.3)',
        title: 'Trend Analytics',
        desc: 'Interactive charts show vitals over time, helping doctors spot patterns and make data-driven decisions.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        color: 'from-cyan-500 to-blue-600',
        glow: 'rgba(6,182,212,0.3)',
        title: 'Secure & Role-Based',
        desc: 'JWT authentication with Admin, Doctor and Patient roles — each user sees only what they need.',
    },
];

const stats = [
    { value: '3',    label: 'User Roles',             color: 'from-indigo-400 to-violet-400' },
    { value: '21+',  label: 'Health Metrics Tracked', color: 'from-rose-400 to-pink-400' },
    { value: 'Live', label: 'WebSocket Updates',       color: 'from-emerald-400 to-teal-400' },
    { value: '100%', label: 'Open Source',             color: 'from-amber-400 to-orange-400' },
];

const roles = [
    {
        emoji: '🔐',
        role: 'Admin',
        gradient: 'from-slate-600 to-slate-800',
        border: 'rgba(148,163,184,0.25)',
        glow: 'rgba(100,116,139,0.15)',
        perks: ['Manage all users', 'System analytics', 'Activity audit logs', 'Platform KPIs'],
    },
    {
        emoji: '🩺',
        role: 'Doctor',
        gradient: 'from-indigo-600 to-violet-700',
        border: 'rgba(99,102,241,0.4)',
        glow: 'rgba(99,102,241,0.15)',
        featured: true,
        perks: ['Monitor assigned patients', 'Receive live critical alerts', 'Generate PDF reports', 'Manage appointments'],
    },
    {
        emoji: '🏥',
        role: 'Patient',
        gradient: 'from-emerald-600 to-teal-700',
        border: 'rgba(16,185,129,0.25)',
        glow: 'rgba(16,185,129,0.1)',
        perks: ['View your health trends', 'Track appointments', 'Download health reports', 'In-app notifications'],
    },
];

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen" style={{ background: '#070d1c', color: '#f0f4ff' }}>

            {/* Navbar */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20'
                    : 'bg-transparent'
            }`} style={scrolled ? { background: 'rgba(7,13,28,0.95)' } : {}}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <svg className="w-5 h-5 text-white animate-heartbeat" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </div>
                        <span className="font-black text-white text-lg tracking-tight">MediFlow</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login"
                            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                        >
                            Sign In
                        </Link>
                        <Link to="/register"
                            className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="animate-orb absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />
                    <div className="animate-orb absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%)', animationDelay: '-3s' }} />
                    <div className="animate-orb absolute -bottom-32 left-1/3 w-[400px] h-[400px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', animationDelay: '-6s' }} />
                    <div className="absolute inset-0 opacity-[0.025]"
                        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-16 items-center w-full">
                    {/* Left text */}
                    <div className="animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 badge-pulse inline-block" />
                            Live Health Monitoring Platform
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
                            Monitor{' '}
                            <span className="gradient-text">patients</span>
                            <br />in real time.
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
                            MediFlow connects admins, doctors and patients on a single intelligent platform —
                            with live vitals, AI-powered alerts and automated health reports.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register"
                                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-2xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all text-sm text-center"
                            >
                                Start Free — No Card Required
                            </Link>
                            <Link to="/login"
                                className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-center"
                            >
                                Sign In
                            </Link>
                        </div>
                        <div className="flex items-center gap-6 mt-8 pt-8 border-t border-white/5">
                            {[
                                { icon: '🔒', text: 'JWT Secured' },
                                { icon: '⚡', text: 'Real-time WebSocket' },
                                { icon: '🤖', text: 'AI Powered' },
                            ].map((t) => (
                                <div key={t.text} className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <span>{t.icon}</span>
                                    <span>{t.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right floating mockup card */}
                    <div className="hidden md:flex justify-center items-center animate-float">
                        <div className="relative w-full max-w-sm">
                            <div className="absolute inset-0 -z-10 blur-3xl opacity-40 rounded-3xl"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
                            <div className="glass rounded-3xl p-6 border border-white/10 shadow-2xl">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Patient</p>
                                        <p className="text-white font-bold text-sm">Arjun Sharma</p>
                                    </div>
                                    <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-full border border-rose-500/30 badge-pulse">
                                        ⚠ Critical
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    {[
                                        { label: 'Heart Rate', value: '118', unit: 'bpm', warn: true },
                                        { label: 'SpO₂',       value: '96',  unit: '%',   warn: false },
                                        { label: 'BP Systolic',value: '142', unit: 'mmHg',warn: true },
                                        { label: 'Temperature',value: '37.2',unit: '°C',  warn: false },
                                    ].map((v) => (
                                        <div key={v.label}
                                            className={`rounded-2xl p-3 border ${v.warn
                                                ? 'bg-rose-500/10 border-rose-500/20'
                                                : 'bg-white/5 border-white/[0.08]'
                                            }`}
                                        >
                                            <p className="text-[10px] text-slate-400 mb-1">{v.label}</p>
                                            <p className={`text-lg font-black ${v.warn ? 'text-rose-400' : 'text-white'}`}>
                                                {v.value}<span className="text-[10px] font-normal ml-0.5 opacity-60">{v.unit}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white/5 rounded-2xl p-3 border border-white/[0.08]">
                                    <p className="text-[10px] text-slate-400 mb-2">ECG Live Feed</p>
                                    <svg viewBox="0 0 240 40" className="w-full h-8">
                                        <polyline fill="none" stroke="#6366f1" strokeWidth="1.5"
                                            points="0,20 20,20 30,20 35,5 40,35 45,20 60,20 80,20 90,20 95,3 100,38 105,20 120,20 140,20 150,20 155,5 160,35 165,20 180,20 200,20 210,20 215,4 220,37 225,20 240,20" />
                                    </svg>
                                </div>
                                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                    <span className="text-sm">🤖</span>
                                    <p className="text-xs text-indigo-300 font-medium">AI: Elevated HR + BP — notify doctor</p>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 glass rounded-2xl px-4 py-2.5 border border-white/10 flex items-center gap-2 shadow-xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                <div className="w-7 h-7 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-xs shadow-md badge-pulse">!</div>
                                <div>
                                    <p className="text-[10px] text-white font-bold">Alert sent to Dr. Patel</p>
                                    <p className="text-[9px] text-slate-400">Just now</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                    style={{ background: 'linear-gradient(transparent, #070d1c)' }} />
            </section>

            {/* Stats Strip */}
            <section className="py-16 border-y border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((s) => (
                        <div key={s.label} className="animate-fade-in-up">
                            <p className={`text-4xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent mb-1`}>
                                {s.value}
                            </p>
                            <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24" style={{ background: '#0a0f1e' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
                            Platform Features
                        </div>
                        <h2 className="text-4xl font-black tracking-tight mb-4 text-white">
                            Everything your clinic <span className="gradient-text">needs</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            From live monitoring to AI-powered insights — MediFlow has every tool for modern healthcare.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f) => (
                            <div key={f.title}
                                className="group rounded-2xl p-6 border border-white/[0.06] transition-all duration-300 hover:-translate-y-1 cursor-default"
                                style={{ background: 'rgba(255,255,255,0.03)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                                    e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
                                    e.currentTarget.style.boxShadow = `0 20px 60px ${f.glow}`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}
                                    style={{ boxShadow: `0 8px 24px ${f.glow}` }}>
                                    {f.icon}
                                </div>
                                <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roles */}
            <section className="py-24" style={{ background: '#070d1c' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-bold uppercase tracking-widest mb-4">
                            Three Portals
                        </div>
                        <h2 className="text-4xl font-black tracking-tight mb-4 text-white">
                            One platform, <span className="gradient-text">three perspectives</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto">
                            Each role gets a tailored dashboard with exactly the tools they need.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {roles.map((r) => (
                            <div key={r.role}
                                className={`relative rounded-3xl p-7 border transition-all duration-300 hover:-translate-y-2 ${r.featured ? 'ring-1 ring-indigo-500/40' : ''}`}
                                style={{
                                    background: r.featured ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                                    borderColor: r.border,
                                    boxShadow: r.featured ? `0 20px 60px ${r.glow}` : 'none',
                                }}
                            >
                                {r.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                                            Most Used
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${r.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                                        {r.emoji}
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-lg">{r.role}</p>
                                        <p className="text-xs text-slate-500">{r.role} Portal</p>
                                    </div>
                                </div>
                                <ul className="space-y-2.5">
                                    {r.perks.map((p) => (
                                        <li key={p} className="flex items-center gap-2.5 text-sm text-slate-400">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                                                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-28 relative overflow-hidden">
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #1e1b4b 100%)' }} />
                <div className="absolute inset-0 opacity-40"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.5) 0%, transparent 40%)' }} />
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="animate-orb absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-30"
                        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)' }} />
                    <div className="animate-orb absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)', animationDelay: '-4s' }} />
                </div>
                <div className="relative max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-5xl font-black text-white tracking-tight mb-5 leading-tight">
                        Ready to transform<br />your clinic?
                    </h2>
                    <p className="text-indigo-200 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                        Get started with MediFlow today — free, open source, and ready for your patients in minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register"
                            className="px-10 py-4 bg-white text-indigo-700 font-black rounded-2xl shadow-2xl hover:shadow-white/25 hover:-translate-y-1 transition-all text-sm"
                        >
                            Create Free Account
                        </Link>
                        <Link to="/login"
                            className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-sm"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-10" style={{ background: '#050810' }}>
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </div>
                        <span className="font-bold text-white text-sm">MediFlow</span>
                    </div>
                    <p className="text-xs text-slate-600">
                        &copy; {new Date().getFullYear()} MediFlow. Built with care for better healthcare. Open Source under MIT License.
                    </p>
                    <div className="flex items-center gap-5 text-xs">
                        <Link to="/login" className="text-slate-500 hover:text-white transition-colors">Login</Link>
                        <Link to="/register" className="text-slate-500 hover:text-white transition-colors">Register</Link>
                        <a href="https://github.com/storm309/MediFlow" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
