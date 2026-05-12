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
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Patient Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                    {patient.user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">{patient.user?.name}</h1>
                        {patient.is_critical && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full badge-pulse">
                                CRITICAL
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {patient.blood_group} • {patient.age} yrs • {patient.gender}
                        {patient.phone ? ` • ${patient.phone}` : ''}
                    </p>
                </div>
            </div>

            {/* Latest vitals */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Heart Rate"   value={latest?.heart_rate}               unit="bpm" icon="❤️" color="red"    />
                <MetricCard title="SpO₂"         value={latest?.spo2}                     unit="%"   icon="💧" color="blue"   />
                <MetricCard title="Temperature"  value={latest?.temperature}              unit="°F"  icon="🌡️" color="yellow" />
                <MetricCard title="Blood Sugar"  value={latest?.sugar_level}             unit="mg/dL" icon="🩸" color="purple" />
            </div>

            {/* Charts */}
            <LiveChart data={recent} fields={CHART_FIELDS} title="Vitals Over Time (Live)" />

            {/* Alerts */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-700 dark:text-slate-200">Alerts</h2>
                </div>
                {aLoading ? (
                    <div className="p-4 space-y-2">
                        {[1, 2].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />)}
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">No alerts for this patient.</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {alerts.map((a) => (
                            <div key={a._id} className="px-5 py-3 flex items-start gap-2">
                                <AlertBadge severity={a.severity} />
                                <p className="text-sm text-slate-600 dark:text-slate-300">{a.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
