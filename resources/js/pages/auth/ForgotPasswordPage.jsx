import React, { useState } from 'react';
import { Link }             from 'react-router-dom';
import api                  from '../../services/api';
import toast                from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail]     = useState('');
    const [sent, setSent]       = useState(false);
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
            <div className="text-center">
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Check Your Email</h2>
                <p className="text-slate-500 text-sm">A password reset link has been sent to <strong>{email}</strong>.</p>
                <Link to="/login" className="mt-6 inline-block text-blue-600 hover:underline text-sm">Back to Login</Link>
            </div>
        );
    }

    return (
        <>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Forgot Password</h2>
            <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="you@example.com"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm"
                >
                    {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-5">
                <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
            </p>
        </>
    );
}
