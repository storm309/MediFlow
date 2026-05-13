import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const InputField = ({ label, name, type = 'text', placeholder, form, setForm }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
        <input
            type={type}
            required
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            className="input-base"
            placeholder={placeholder}
        />
    </div>
);

export default function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'patient' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.password_confirmation) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const user = await dispatch(registerUser(form)).unwrap();
            toast.success('Account created!');
            navigate(`/${user.role}`, { replace: true });
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create account</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join MediFlow to monitor health in real time.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Full Name"        name="name"                  type="text"     placeholder="Dr. John Doe"    form={form} setForm={setForm} />
                <InputField label="Email Address"    name="email"                 type="email"    placeholder="you@example.com" form={form} setForm={setForm} />
                <InputField label="Password (min 8 chars)" name="password"              type="password" placeholder="••••••••"         form={form} setForm={setForm} />
                <InputField label="Confirm Password"      name="password_confirmation" type="password" placeholder="••••••••"         form={form} setForm={setForm} />

                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Your Role</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['patient', 'doctor'].map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setForm({ ...form, role: r })}
                                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                    form.role === r
                                        ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-300'
                                }`}
                            >
                                {r === 'patient' ? '🏥 Patient' : '🩺 Doctor'}
                            </button>
                        ))}
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                    {loading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating account…
                        </>
                    ) : (
                        <>
                            Create Account
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign In</Link>
            </p>
        </>
    );
}
