import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await dispatch(loginUser(form)).unwrap();
            toast.success(`Welcome back, ${user.name?.split(' ')[0]}!`);
            navigate(`/${user.role}`, { replace: true });
        } catch (err) {
            toast.error(err ?? 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-7">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to your MediFlow dashboard.</p>
            </div>

            {/* Quick-fill demo hint */}
            <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Demo:</span> admin@mediflow.com / doctor@mediflow.com / patient@mediflow.com — password: <span className="font-mono font-semibold">password</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input-base"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
                        <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>
                    </div>
                    <div className="relative">
                        <input
                            type={showPw ? 'text' : 'password'}
                            required
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="input-base pr-10"
                            placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPw
                                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            }
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                    {loading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing in…
                        </>
                    ) : (
                        <>
                            Sign In
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">Create one free</Link>
            </p>
        </>
    );
}
