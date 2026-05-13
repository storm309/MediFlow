import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
            toast.success('Reset link sent to your email!');
        } catch {
            toast.error('Failed to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Check your email</h2>
                <p className="text-slate-500 text-sm">A password reset link has been sent to<br /><strong className="text-slate-700 dark:text-slate-300">{email}</strong>.</p>
                <Link to="/login" className="mt-6 inline-flex items-center gap-2 btn-primary px-6 py-2.5 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Login
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="mb-7">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Forgot password?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter your email and we'll send a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-base"
                        placeholder="you@example.com"
                    />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                    {loading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending…
                        </>
                    ) : 'Send Reset Link'}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign In</Link>
            </p>
        </>
    );
}

