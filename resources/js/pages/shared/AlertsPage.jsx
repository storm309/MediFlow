import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAlerts, fetchAlertStats, updateAlertStatus, selectLiveAlerts } from '../../redux/slices/alertSlice';
import AlertBadge from '../../components/ui/AlertBadge';
import { format } from 'date-fns';

export default function AlertsPage() {
    const dispatch = useDispatch();
    const { items: alerts, stats, loading } = useSelector((s) => s.alerts);
    const liveAlerts = useSelector(selectLiveAlerts);

    useEffect(() => {
        dispatch(fetchAlerts());
        dispatch(fetchAlertStats());
    }, [dispatch]);

    const handleResolve = (id) => {
        dispatch(updateAlertStatus({ id, status: 'resolved' }));
    };

    const allAlerts = [...liveAlerts, ...alerts];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Alerts</h1>
                {stats && (
                    <div className="flex gap-3">
                        <span className="text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full font-medium">
                            {stats.critical ?? 0} Critical
                        </span>
                        <span className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">
                            {stats.unread ?? 0} Unread
                        </span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-white dark:bg-slate-800 rounded-xl animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : allAlerts.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="font-medium">No active alerts</p>
                    <p className="text-sm mt-1">All patients are in stable condition.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {allAlerts.map((alert) => (
                        <div key={alert._id ?? alert.id}
                            className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-l-4 ${
                                alert.severity === 'emergency' ? 'border-red-600' :
                                alert.severity === 'critical'  ? 'border-red-400' :
                                alert.severity === 'warning'   ? 'border-yellow-400' : 'border-blue-400'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertBadge severity={alert.severity} />
                                        <span className="text-xs text-slate-400">
                                            {alert.created_at ? format(new Date(alert.created_at), 'MMM d, HH:mm') : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{alert.message}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{alert.type}</p>
                                </div>
                                {alert.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleResolve(alert._id ?? alert.id)}
                                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors"
                                    >
                                        Resolve
                                    </button>
                                )}
                                {alert.status === 'resolved' && (
                                    <span className="text-xs text-green-500 font-medium">Resolved</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
