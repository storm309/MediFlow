import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { fetchAlertStats, selectAlertStats } from '../../redux/slices/alertSlice';
import MetricCard from '../../components/ui/MetricCard';
import { selectUser } from '../../redux/slices/authSlice';

const quickActions = [
    {
        to: '/admin/users', label: 'Manage Users', desc: 'Edit user roles & manage access control',
        gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        to: '/alerts', label: 'Manage Alerts', desc: 'Review & resolve patient alerts',
        gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/25',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    {
        to: '/reports', label: 'Reports', desc: 'Generate & download PDF reports',
        gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        to: '/appointments', label: 'Appointments', desc: 'View & manage all appointments',
        gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
];

export default function AdminDashboard() {
    const dispatch  = useDispatch();
    const stats     = useSelector(selectAlertStats);
    const user      = useSelector(selectUser);
    const [adminStats, setAdminStats] = React.useState(null);

    useEffect(() => {
        dispatch(fetchAlertStats());
        api.get('/admin/dashboard').then(r => setAdminStats(r.data.data)).catch(() => {});
    }, [dispatch]);

    return (
        <div className="space-y-8 p-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">System-wide overview — welcome back, {user?.name?.split(' ')[0]}.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">System Online</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard title="Total Users"    value={adminStats?.total_users}    color="blue"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <MetricCard title="Total Doctors"  value={adminStats?.total_doctors}  color="green"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
                <MetricCard title="Total Patients" value={adminStats?.total_patients} color="cyan"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                <MetricCard title="Active Alerts"  value={stats?.total ?? 0}          color="red"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} />
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {quickActions.map((a) => (
                        <Link key={a.to} to={a.to}
                            className="card p-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                        >
                            <div className={`w-12 h-12 bg-gradient-to-br ${a.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg ${a.shadow} mb-4 group-hover:scale-110 transition-transform`}>
                                {a.icon}
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white mb-1">{a.label}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a.desc}</p>
                            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600">
                                Go to {a.label}
                                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
