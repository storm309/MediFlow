import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate }        from 'react-router-dom';
import { loginUser }                from '../../redux/slices/authSlice';
import toast                        from 'react-hot-toast';

export default function LoginPage() {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await dispatch(loginUser(form)).unwrap();
            toast.success('Welcome back!');
            navigate(`/${user.role}`, { replace: true });
        } catch (err) {
            toast.error(err ?? 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Sign In</h2>
            <p className="text-slate-500 text-sm mb-6">Enter your credentials to access the dashboard.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm"
                >
                    {loading ? 'Signing in…' : 'Sign In'}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
            </p>
        </>
    );
}
