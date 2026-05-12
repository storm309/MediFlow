import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 text-white">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">MediFlow</span>
                    </div>
                    <p className="text-blue-100 text-sm mt-1">AI-Powered Remote Patient Monitoring</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
