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
                    <h1 className="page-title">{getGreeting()}, Dr. {user?.name?.split(' ').slice(-1)[0]} ðŸ‘‹</h1>
                    <p className="page-subtitle">Monitor your patients in real time.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Live Monitoring</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard title="Total Patients"    value={patients.length}         icon="ðŸ‘¥" color="blue"   />
                <MetricCard title="Critical Patients" value={criticalPatients.length} icon="ðŸš¨" color="red"    />
                <MetricCard title="Unread Alerts"     value={stats?.unread ?? 0}      icon="âš ï¸" color="yellow" />
                <MetricCard title="Today's Readings"  value={stats?.today ?? 0}       icon="ðŸ“Š" color="green"  />
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
                                        <p className="text-xs text-slate-500 truncate">{p.blood_group && `${p.blood_group} â€¢ `}{p.age ? `${p.age} yrs` : ''}</p>
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
                            <p className="text-slate-500 text-sm">All clear â€” no alerts!</p>
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
