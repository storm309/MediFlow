import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLatestMetric, fetchRecentMetrics, selectRecent } from '../../redux/slices/metricsSlice';
import { fetchAlerts, selectLiveAlerts } from '../../redux/slices/alertSlice';
import { usePatientChannel } from '../../hooks/useRealtimeChannels';
import MetricCard from '../../components/ui/MetricCard';
import LiveChart from '../../components/ui/LiveChart';
import AlertBadge from '../../components/ui/AlertBadge';
import { selectUser } from '../../redux/slices/authSlice';

const CHART_FIELDS = [
    { key: 'heart_rate',  label: 'Heart Rate', color: '#ef4444' },
    { key: 'spo2',        label: 'SpO2 %',     color: '#3b82f6' },
    { key: 'temperature', label: 'Temp °F',    color: '#f59e0b' },
];

export default function PatientDashboard() {
    const dispatch   = useDispatch();
    const user       = useSelector(selectUser);
    const recent     = useSelector(selectRecent);
    const { items: alerts } = useSelector((s) => s.alerts);
    const liveAlerts = useSelector(selectLiveAlerts);
    const patientId  = user?.patient_profile?._id;
    const latest     = useSelector((s) => s.metrics.latestByPatient[patientId]);

    usePatientChannel(patientId);

    useEffect(() => {
        if (patientId) {
            dispatch(fetchLatestMetric(patientId));
            dispatch(fetchRecentMetrics(patientId));
            dispatch(fetchAlerts({ patient_id: patientId }));
        }
    }, [patientId, dispatch]);

    const allAlerts = [...liveAlerts, ...alerts].slice(0, 5);

    return (
        <div className="space-y-8 p-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title">Hello, {user?.name?.split(' ')[0]}</h1>
                    <p className="page-subtitle">Here's your latest health overview.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Live Vitals</span>
                </div>
            </div>

            {/* Primary vitals */}
            <div>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Current Vitals</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <MetricCard title="Heart Rate"  value={latest?.heart_rate}  unit="bpm"   color="red"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} />
                    <MetricCard title="SpO2"        value={latest?.spo2}        unit="%"     color="blue"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.485-8.485l-.707.707M4.222 4.222l-.707.707M21 12h-1M4 12H3m16.485 4.485l-.707-.707M4.929 19.071l-.707-.707M12 6a6 6 0 100 12A6 6 0 0012 6z" /></svg>} />
                    <MetricCard title="Temperature" value={latest?.temperature} unit="°F"    color="yellow"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>} />
                    <MetricCard title="Blood Sugar" value={latest?.sugar_level} unit="mg/dL" color="purple"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <MetricCard title="Systolic BP"  value={latest?.blood_pressure_systolic}  unit="mmHg" color="cyan"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                <MetricCard title="Diastolic BP" value={latest?.blood_pressure_diastolic} unit="mmHg" color="green"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>} />
            </div>

            {/* Trend chart */}
            <LiveChart data={recent} fields={CHART_FIELDS} title="Vitals Trend (Live)" />

            {/* Active alerts */}
            {allAlerts.length > 0 && (
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="font-bold text-slate-900 dark:text-white">Active Alerts</h2>
                        <span className="ml-auto text-xs bg-red-100 dark:bg-red-900/30 text-red-600 font-bold px-2 py-0.5 rounded-full">
                            {allAlerts.length}
                        </span>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {allAlerts.map((a, i) => (
                            <div key={a._id ?? i} className="px-6 py-4 flex items-start gap-3">
                                <AlertBadge severity={a.severity} />
                                <p className="text-sm text-slate-700 dark:text-slate-300 flex-1 leading-relaxed">{a.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
