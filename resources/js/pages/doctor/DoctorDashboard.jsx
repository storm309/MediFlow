import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPatients } from '../../redux/slices/patientSlice';
import { fetchAlerts, fetchAlertStats, selectAlertStats } from '../../redux/slices/alertSlice';
import { fetchAppointments, cancelAppointment, selectAppointments } from '../../redux/slices/appointmentSlice';
import { fetchReports, selectReports } from '../../redux/slices/reportSlice';
import MetricCard from '../../components/ui/MetricCard';
import AlertBadge from '../../components/ui/AlertBadge';
import { selectUser } from '../../redux/slices/authSlice';
import { format, parseISO, isFuture, isToday } from 'date-fns';
import toast from 'react-hot-toast';

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

const statusCls = {
    scheduled: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    confirmed:  'status-resolved',
    cancelled:  'status-emergency',
    completed:  'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300',
    no_show:    'status-critical',
};

export default function DoctorDashboard() {
    const dispatch = useDispatch();
    const user     = useSelector(selectUser);
    const { items: patients, loading: pLoading } = useSelector((s) => s.patients);
    const { items: alerts } = useSelector((s) => s.alerts);
    const stats    = useSelector(selectAlertStats);
    const appointments = useSelector(selectAppointments);
    const reports  = useSelector(selectReports);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        dispatch(fetchPatients());
        dispatch(fetchAlerts({ limit: 6 }));
        dispatch(fetchAlertStats());
        dispatch(fetchAppointments());
        dispatch(fetchReports({ per_page: 8 }));
    }, [dispatch]);

    const criticalPatients = patients.filter((p) => p.is_critical);
    const activeAlerts     = alerts.filter(a => !a.resolved_at);
    const upcomingAppts    = appointments
        .filter(a => a.status !== 'cancelled' && a.status !== 'completed' && a.scheduled_at && isFuture(parseISO(a.scheduled_at)))
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    const todayAppts = appointments.filter(a => a.scheduled_at && isToday(parseISO(a.scheduled_at)));

    const handleCancel = async (appt) => {
        if (!window.confirm(`Cancel appointment "${appt.title}"?`)) return;
        setCancellingId(appt._id);
        try {
            await dispatch(cancelAppointment({ id: appt._id, reason: 'Cancelled by doctor' })).unwrap();
            toast.success('Appointment cancelled');
        } catch (err) {
            toast.error(err ?? 'Failed to cancel');
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl">
            {/* Header — clinical style */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title">{getGreeting()}, Dr. {user?.name?.split(' ').slice(-1)[0]}</h1>
                    <p className="page-subtitle">Clinical overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Live Monitoring</span>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard title="My Patients"      value={patients.length}        color="blue"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <MetricCard title="Critical"          value={criticalPatients.length} color="red"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
                <MetricCard title="Today's Appts"    value={todayAppts.length}       color="purple"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <MetricCard title="Active Alerts"    value={activeAlerts.length}     color="yellow"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} />
            </div>

            {/* Main content 3-column */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Patient list — 2/3 */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Patients */}
                    <div className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Patient List</h2>
                            </div>
                            <span className="text-xs text-slate-400">{patients.length} assigned</span>
                        </div>
                        {pLoading ? (
                            <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
                        ) : patients.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 text-sm">No patients assigned yet.</div>
                        ) : (
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {patients.slice(0, 8).map((p) => (
                                    <Link key={p._id} to={`/doctor/patients/${p._id}`}
                                        className="flex items-center gap-4 px-6 py-3.5 table-row-hover group"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow">
                                            {p.user?.name?.[0]?.toUpperCase() ?? '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.user?.name ?? 'Unknown'}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {p.blood_group && <span className="text-xs text-slate-400 font-mono">{p.blood_group}</span>}
                                                {p.age && <span className="text-xs text-slate-400">{p.age} yrs</span>}
                                                {p.gender && <span className="text-xs text-slate-400 capitalize">{p.gender}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {p.is_critical ? (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full badge-pulse" />Critical
                                                </span>
                                            ) : (
                                                <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full font-semibold">Stable</span>
                                            )}
                                            <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                        {patients.length > 8 && (
                            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 text-center">
                                <Link to="/patients" className="text-xs text-blue-600 font-semibold hover:text-blue-700">View all {patients.length} patients →</Link>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Appointments with Cancel */}
                    <div className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Appointments</h2>
                            </div>
                            <Link to="/appointments" className="text-xs text-blue-600 font-medium hover:text-blue-700">View all →</Link>
                        </div>
                        {upcomingAppts.length === 0 ? (
                            <div className="p-10 text-center text-slate-500 text-sm">No upcoming appointments.</div>
                        ) : (
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {upcomingAppts.slice(0, 5).map(a => (
                                    <div key={a._id} className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center shrink-0 text-purple-500">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{a.title}</p>
                                            <p className="text-xs text-slate-500">
                                                {a.patient?.user?.name && <span className="font-medium">{a.patient.user.name} · </span>}
                                                {a.scheduled_at ? format(parseISO(a.scheduled_at), 'MMM d, h:mm a') : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCls[a.status] ?? ''}`}>{a.status}</span>
                                            {a.status !== 'cancelled' && a.status !== 'completed' && (
                                                <button
                                                    onClick={() => handleCancel(a)}
                                                    disabled={cancellingId === a._id}
                                                    className="text-xs text-red-600 hover:text-red-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                                >
                                                    {cancellingId === a._id ? '...' : 'Cancel'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column — alerts + reports */}
                <div className="space-y-6">
                    {/* Alerts */}
                    <div className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 dark:text-white">Active Alerts</h2>
                            <Link to="/alerts" className="text-xs text-blue-600 font-medium hover:text-blue-700">View all</Link>
                        </div>
                        {activeAlerts.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p className="text-slate-500 text-sm">All clear!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {activeAlerts.slice(0, 5).map((a) => (
                                    <div key={a._id} className="px-5 py-3.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertBadge severity={a.severity} />
                                            {a.patient?.user?.name && (
                                                <span className="text-xs text-slate-500 font-medium">{a.patient.user.name}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{a.message}</p>
                                        {a.created_at && (
                                            <p className="text-xs text-slate-400 mt-1">{format(new Date(a.created_at), 'MMM d, HH:mm')}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Patient Reports */}
                    <div className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 dark:text-white">Recent Reports</h2>
                            <Link to="/reports" className="text-xs text-blue-600 font-medium hover:text-blue-700">View all</Link>
                        </div>
                        {reports.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No reports yet.</div>
                        ) : (
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {reports.slice(0, 5).map(r => (
                                    <Link key={r._id} to={`/reports`} className="block px-5 py-3.5 table-row-hover">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{r.patient?.user?.name ?? 'Patient'}</p>
                                            <span className="text-xs text-slate-400 capitalize">{r.period}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-slate-500">{r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy') : ''}</p>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === 'reviewed' || r.status === 'finalized' ? 'status-resolved' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700'}`}>{r.status}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Critical patients callout */}
            {criticalPatients.length > 0 && (
                <div className="card p-5 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <p className="font-bold text-red-700 dark:text-red-400">{criticalPatients.length} patient{criticalPatients.length > 1 ? 's' : ''} need immediate attention</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {criticalPatients.map(p => (
                            <Link key={p._id} to={`/doctor/patients/${p._id}`}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <span className="w-2 h-2 bg-red-500 rounded-full badge-pulse" />
                                {p.user?.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

