import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import ContactAdminModal from '../../components/ui/ContactAdminModal';

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
    const [showContactModal, setShowContactModal] = useState(false);

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
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Account Type</label>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                            <strong>Patient Account</strong><br/>
                            Monitor your health with real-time vitals and AI insights.
                        </p>
                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 space-y-1.5">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                💡 Doctor? Admin creates your account.
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:shivamkumarp447@gmail.com" className="hover:underline font-medium">
                                    shivamkumarp447@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href="tel:+918252980774" className="hover:underline font-medium">
                                    +91 82529 80774
                                </a>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowContactModal(true)}
                                className="mt-1 w-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-2 transition-colors"
                            >
                                Send Request to Admin →
                            </button>
                        </div>
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

            {showContactModal && <ContactAdminModal onClose={() => setShowContactModal(false)} />}
        </>
    );
}
