import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link }                      from 'react-router-dom';
import { fetchPatients }             from '../../redux/slices/patientSlice';
import { fetchAlerts, fetchAlertStats, selectAlertStats } from '../../redux/slices/alertSlice';
import { fetchRecentMetrics }        from '../../redux/slices/metricsSlice';
import MetricCard from '../../components/ui/MetricCard';
import AlertBadge from '../../components/ui/AlertBadge';
import LiveChart  from '../../components/ui/LiveChart';
import { selectUser } from '../../redux/slices/authSlice';
import { format }     from 'date-fns';

export default function DoctorDashboard() {
    const dispatch = useDispatch();
    const user     = useSelector(selectUser);
    const { items: patients, loading: pLoading } = useSelector((s) => s.patients);
    const { items: alerts }  = useSelector((s) => s.alerts);
    const stats              = useSelector(selectAlertStats);
    const recentMetrics      = useSelector((s) => s.metrics.recent);

    useEffect(() => {
        dispatch(fetchPatients());
        dispatch(fetchAlerts({ limit: 5 }));
        dispatch(fetchAlertStats());
    }, [dispatch]);

    const criticalPatients = patients.filter((p) => p.is_critical);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Good {getGreeting()}, Dr. {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-slate-500 text-sm mt-1">Monitor your patients in real time.</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Patients"   value={patients.length}              icon="👥" color="blue"   />
                <MetricCard title="Critical Patients" value={criticalPatients.length}      icon="🚨" color="red"    />
                <MetricCard title="Unread Alerts"    value={stats?.unread ?? 0}           icon="⚠️" color="yellow" />
                <MetricCard title="Today's Readings" value={stats?.today ?? 0}            icon="📊" color="green"  />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Patient list */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Your Patients</h2>
                    </div>
                    {pLoading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />)}
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">No patients assigned yet.</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {patients.slice(0, 8).map((p) => (
                                <Link key={p._id} to={`/doctor/patients/${p._id}`}
                                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                        {p.user?.name?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{p.user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{p.blood_group} • {p.age} yrs</p>
                                    </div>
                                    {p.is_critical && (
                                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 badge-pulse" />
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Alerts */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Recent Alerts</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {alerts.slice(0, 6).map((a) => (
                            <div key={a._id} className="px-5 py-3">
                                <div className="flex items-start gap-2">
                                    <AlertBadge severity={a.severity} />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 flex-1 min-w-0">{a.message}</p>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    {a.created_at ? format(new Date(a.created_at), 'MMM d, HH:mm') : ''}
                                </p>
                            </div>
                        ))}
                        {alerts.length === 0 && (
                            <div className="p-6 text-center text-slate-500 text-sm">No alerts</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}
