import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch }    from 'react-redux';
import api                             from '../../services/api';
import { fetchMe, selectUser }         from '../../redux/slices/authSlice';
import toast                           from 'react-hot-toast';

export default function ProfilePage() {
    const dispatch  = useDispatch();
    const user      = useSelector(selectUser);
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

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile</h1>

            {/* Avatar block */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block">{user?.role}</span>
                </div>
            </div>

            {/* Edit profile */}
            <form onSubmit={handleProfile} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                <h2 className="font-semibold text-slate-700 dark:text-slate-200">Personal Information</h2>
                {[['Full Name', 'name', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel']].map(([label, name, type]) => (
                    <div key={name}>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                        <input type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                ))}
                <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {loading ? 'Saving…' : 'Save Changes'}
                </button>
            </form>

            {/* Change password */}
            <form onSubmit={handlePassword} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                <h2 className="font-semibold text-slate-700 dark:text-slate-200">Change Password</h2>
                {[['Current Password', 'current_password'], ['New Password', 'password'], ['Confirm New Password', 'password_confirmation']].map(([label, name]) => (
                    <div key={name}>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                        <input type="password" value={pwForm[name]} onChange={(e) => setPwForm({ ...pwForm, [name]: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                ))}
                <button type="submit" className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">
                    Change Password
                </button>
            </form>
        </div>
    );
}
