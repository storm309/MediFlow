import React, { useEffect } from 'react';
import { useParams }         from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatient }      from '../../redux/slices/patientSlice';
import { fetchRecentMetrics, selectRecent } from '../../redux/slices/metricsSlice';
import { fetchAlerts }       from '../../redux/slices/alertSlice';
import { usePatientChannel } from '../../hooks/useRealtimeChannels';
import MetricCard            from '../../components/ui/MetricCard';
import LiveChart             from '../../components/ui/LiveChart';
import AlertBadge            from '../../components/ui/AlertBadge';

const CHART_FIELDS = [
    { key: 'heart_rate',  label: 'Heart Rate',  color: '#EF4444' },
    { key: 'spo2',        label: 'SpO₂ %',      color: '#2563EB' },
    { key: 'temperature', label: 'Temp °F',     color: '#F59E0B' },
];

export default function PatientDetail() {
    const { id }   = useParams();
    const dispatch = useDispatch();
    const patient  = useSelector((s) => s.patients.selected);
    const recent   = useSelector(selectRecent);
    const { items: alerts, loading: aLoading } = useSelector((s) => s.alerts);
    const latest   = useSelector((s) => s.metrics.latestByPatient[id]);

    // Subscribe to real-time updates for this patient
    usePatientChannel(id);

    useEffect(() => {
        dispatch(fetchPatient(id));
        dispatch(fetchRecentMetrics(id));
        dispatch(fetchAlerts({ patient_id: id }));
    }, [id, dispatch]);

    if (!patient) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            </div>
        );
    }

    const initial = patient.user?.name?.[0]?.toUpperCase() ?? '?';

    return (
        <div className="space-y-6 p-6 max-w-5xl">
            {/* Patient Header */}
            <div className="card p-6 flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
                    {initial}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{patient.user?.name}</h1>
                        {patient.is_critical && (
                            <span className="status-emergency badge-pulse text-xs font-bold px-2.5 py-1 rounded-full">CRITICAL</span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        {[patient.blood_group, patient.age ? `${patient.age} yrs` : null, patient.gender, patient.phone].filter(Boolean).join(' • ')}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Monitoring
                </div>
            </div>

            {/* Latest vitals */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Heart Rate"  value={latest?.heart_rate}  unit="bpm"   color="red"    />
                <MetricCard title="SpO₂"        value={latest?.spo2}        unit="%"     color="blue"   />
                <MetricCard title="Temperature" value={latest?.temperature} unit="°F"   color="yellow" />
                <MetricCard title="Blood Sugar" value={latest?.sugar_level} unit="mg/dL" color="purple" />
            </div>

            {/* Chart */}
            <LiveChart data={recent} fields={CHART_FIELDS} title="Vitals Over Time" />

            {/* Alerts */}
            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900 dark:text-white">Patient Alerts</h2>
                    {alerts.length > 0 && (
                        <span className="status-emergency text-xs font-bold px-2.5 py-1 rounded-full">{alerts.length} active</span>
                    )}
                </div>
                {aLoading ? (
                    <div className="p-5 space-y-2">{[1, 2].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
                ) : alerts.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-slate-500 text-sm">No alerts for this patient</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {alerts.map((a) => (
                            <div key={a._id} className="px-6 py-4 flex items-start gap-3">
                                <AlertBadge severity={a.severity} />
                                <p className="text-sm text-slate-700 dark:text-slate-300">{a.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
