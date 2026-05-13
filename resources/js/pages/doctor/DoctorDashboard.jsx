import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { fetchAlerts, fetchAlertStats, selectAlertStats } from '../../redux/slices/alertSlice';
import MetricCard from '../../components/ui/MetricCard';
import AlertBadge from '../../components/ui/AlertBadge';
import { selectUser } from '../../redux/slices/authSlice';
import { format } from 'date-fns';

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function DoctorDashboard() {
    const dispatch = useDispatch();
    const user     = useSelector(selectUser);
    const { items: patients, loading: pLoading } = useSelector((s) => s.patients);
    const { items: alerts } = useSelector((s) => s.alerts);
    const stats = useSelector(selectAlertStats);

    useEffect(() => {
        dispatch(fetchPatients());
        dispatch(fetchAlerts({ limit: 6 }));
        dispatch(fetchAlertStats());
    }, [dispatch]);

    const criticalPatients = patients.filter((p) => p.is_critical);

    return (
        <div className="space-y-8 p-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title">{getGreeting()}, Dr. {user?.name?.split(' ').slice(-1)[0]}</h1>
                    <p className="page-subtitle">Monitor your patients in real time.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Live Monitoring</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard title="Total Patients"    value={patients.length}        color="blue"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <MetricCard title="Critical Patients" value={criticalPatients.length} color="red"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
                <MetricCard title="Unread Alerts"     value={stats?.unread ?? 0}      color="yellow"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} />
                <MetricCard title="Today's Readings"  value={stats?.today ?? 0}       color="green"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Patient list */}
                <div className="xl:col-span-2 card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900 dark:text-white">Your Patients</h2>
                        <span className="text-xs text-slate-400">{patients.length} total</span>
                    </div>
                    {pLoading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 text-sm">No patients assigned yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {patients.slice(0, 8).map((p) => (
                                <Link key={p._id} to={`/doctor/patients/${p._id}`}
                                    className="flex items-center gap-4 px-6 py-3.5 table-row-hover"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                                        {p.user?.name?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.user?.name ?? 'Unknown'}</p>
                                        <p className="text-xs text-slate-500 truncate">{p.blood_group && `${p.blood_group} · `}{p.age ? `${p.age} yrs` : ''}</p>
                                    </div>
                                    {p.is_critical ? (
                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full badge-pulse" />
                                            Critical
                                        </span>
                                    ) : (
                                        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Alerts */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900 dark:text-white">Recent Alerts</h2>
                        <Link to="/alerts" className="text-xs text-blue-600 font-medium hover:text-blue-700">View all</Link>
                    </div>
                    {alerts.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-slate-500 text-sm">All clear — no alerts!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {alerts.slice(0, 7).map((a) => (
                                <div key={a._id} className="px-6 py-3">
                                    <div className="flex items-start gap-2 mb-1">
                                        <AlertBadge severity={a.severity} />
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5">{a.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {a.created_at ? format(new Date(a.created_at), 'MMM d, HH:mm') : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
