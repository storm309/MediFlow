import React, { useState } from 'react';
import { useDispatch }       from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser }      from '../../redux/slices/authSlice';
import toast                 from 'react-hot-toast';

export default function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm]    = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'patient' });
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

    const field = (label, name, type = 'text', placeholder = '') => (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <input
                type={type}
                required
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
            />
        </div>
    );

    return (
        <>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Create Account</h2>
            <p className="text-slate-500 text-sm mb-6">Join MediFlow to monitor health in real time.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {field('Full Name',  'name',     'text',     'Dr. John Doe')}
                {field('Email',      'email',    'email',    'you@example.com')}
                {field('Password',   'password', 'password', '••••••••')}
                {field('Confirm Password', 'password_confirmation', 'password', '••••••••')}

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                    <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm"
                >
                    {loading ? 'Creating account…' : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
            </p>
        </>
    );
}
