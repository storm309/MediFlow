import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import { fetchMe, selectUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const roleColors = { admin: 'from-slate-600 to-slate-800', doctor: 'from-blue-600 to-cyan-600', patient: 'from-emerald-600 to-teal-600' };
const roleBadge  = { admin: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300', doctor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', patient: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' };

export default function ProfilePage() {
    const dispatch = useDispatch();
    const user     = useSelector(selectUser);
    const [form, setForm]     = useState({ name: '', email: '', phone: '' });
    const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) setForm({ name: user.name ?? '', email: user.email ?? '', phone: user.phone ?? '' });
    }, [user]);

    const handleProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/profile', form);
            dispatch(fetchMe());
            toast.success('Profile updated!');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        if (pwForm.password !== pwForm.password_confirmation) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await api.put('/auth/password', pwForm);
            toast.success('Password changed!');
            setPwForm({ current_password: '', password: '', password_confirmation: '' });
        } catch {
            toast.error('Failed to change password');
        }
    };

    const avatarGrad = roleColors[user?.role] ?? 'from-blue-600 to-cyan-600';
    const badgeCls   = roleBadge[user?.role] ?? roleBadge.doctor;

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-6">
            <h1 className="page-title">Profile</h1>

            {/* Avatar card */}
            <div className="card p-6 flex items-center gap-5">
                <div className={`w-20 h-20 bg-linear-to-br ${avatarGrad} rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shrink-0`}>
                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize mt-2 inline-block ${badgeCls}`}>{user?.role}</span>
                </div>
            </div>

            {/* Personal info */}
            <form onSubmit={handleProfile} className="card p-6 space-y-5">
                <h2 className="font-bold text-slate-900 dark:text-white">Personal Information</h2>
                {[
                    { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your full name' },
                    { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@example.com' },
                    { label: 'Phone', name: 'phone', type: 'tel', placeholder: '+1 234 567 8900' },
                ].map(({ label, name, type, placeholder }) => (
                    <div key={name}>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                        <input type={type} value={form[name]}
                            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                            className="input-base" placeholder={placeholder}
                        />
                    </div>
                ))}
                <div className="pt-1">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Savingâ€¦
                            </>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Change password */}
            <form onSubmit={handlePassword} className="card p-6 space-y-5">
                <h2 className="font-bold text-slate-900 dark:text-white">Change Password</h2>
                {[
                    { label: 'Current Password', name: 'current_password' },
                    { label: 'New Password',     name: 'password' },
                    { label: 'Confirm New Password', name: 'password_confirmation' },
                ].map(({ label, name }) => (
                    <div key={name}>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                        <input type="password" value={pwForm[name]}
                            onChange={(e) => setPwForm({ ...pwForm, [name]: e.target.value })}
                            className="input-base" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                        />
                    </div>
                ))}
                <div className="pt-1">
                    <button type="submit" className="btn-ghost font-semibold hover:bg-slate-900 hover:text-white hover:border-slate-900">
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
}
