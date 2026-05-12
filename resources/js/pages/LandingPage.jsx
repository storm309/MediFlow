import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white flex flex-col">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm">❤</span>
                    MediFlow
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login"    className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors">Login</Link>
                    <Link to="/register" className="px-4 py-2 text-sm bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors">Get Started</Link>
                </div>
            </nav>

            {/* Hero */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
                <div className="max-w-3xl">
                    <span className="inline-block bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
                        AI-Powered Remote Patient Monitoring
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
                        Healthcare <br />
                        <span className="text-cyan-300">Reimagined</span> in Real Time
                    </h1>
                    <p className="text-blue-100 text-lg leading-relaxed max-w-xl mx-auto mb-10">
                        MediFlow connects doctors and patients through live health monitoring, intelligent alerts, and instant communication — all in one seamless dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-lg">
                            Start Monitoring
                        </Link>
                        <Link to="/login" className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/30">
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Feature cards */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
                    {[
                        { icon: '❤️', title: 'Live Vitals', desc: 'Heart rate, SpO₂, temperature, and more — streaming in real time.' },
                        { icon: '⚠️', title: 'Smart Alerts', desc: 'AI-powered alerts notify doctors instantly when values go critical.' },
                        { icon: '📋', title: 'PDF Reports', desc: 'Auto-generated health reports with trend analysis and doctor notes.' },
                    ].map((f) => (
                        <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/20">
                            <div className="text-3xl mb-3">{f.icon}</div>
                            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                            <p className="text-blue-100 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="text-center text-blue-200 text-xs py-4">
                &copy; {new Date().getFullYear()} MediFlow. Built with ❤ for better healthcare.
            </footer>
        </div>
    );
}
