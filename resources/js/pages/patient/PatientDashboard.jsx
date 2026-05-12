import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLatestMetric, fetchRecentMetrics, selectRecent } from '../../redux/slices/metricsSlice';
import { fetchAlerts, selectLiveAlerts }  from '../../redux/slices/alertSlice';
import { usePatientChannel }              from '../../hooks/useRealtimeChannels';
import MetricCard  from '../../components/ui/MetricCard';
import LiveChart   from '../../components/ui/LiveChart';
import AlertBadge  from '../../components/ui/AlertBadge';
import { selectUser }  from '../../redux/slices/authSlice';

const CHART_FIELDS = [
    { key: 'heart_rate',  label: 'Heart Rate',  color: '#EF4444' },
    { key: 'spo2',        label: 'SpO₂ %',      color: '#2563EB' },
    { key: 'temperature', label: 'Temp °F',     color: '#F59E0B' },
];

export default function PatientDashboard() {
    const dispatch = useDispatch();
    const user     = useSelector(selectUser);
    const recent   = useSelector(selectRecent);
    const { items: alerts } = useSelector((s) => s.alerts);
    const liveAlerts = useSelector(selectLiveAlerts);

    // The patient's own patientId is in the patient_profile embedded in the me response
    const patientId = user?.patient_profile?._id;
    const latest    = useSelector((s) => s.metrics.latestByPatient[patientId]);

    usePatientChannel(patientId);

    useEffect(() => {
        if (patientId) {
            dispatch(fetchLatestMetric(patientId));
            dispatch(fetchRecentMetrics(patientId));
            dispatch(fetchAlerts({ patient_id: patientId }));
        }
    }, [patientId, dispatch]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Hello, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-500 text-sm mt-1">Here's your latest health overview.</p>
            </div>

            {/* Live Vitals */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Heart Rate"  value={latest?.heart_rate}  unit="bpm"   icon="❤️" color="red"    />
                <MetricCard title="SpO₂"        value={latest?.spo2}        unit="%"     icon="💧" color="blue"   />
                <MetricCard title="Temperature" value={latest?.temperature} unit="°F"    icon="🌡️" color="yellow" />
                <MetricCard title="Blood Sugar" value={latest?.sugar_level} unit="mg/dL" icon="🩸" color="purple" />
            </div>

            {/* Blood Pressure row */}
            <div className="grid grid-cols-2 gap-4">
                <MetricCard title="Systolic BP"  value={latest?.blood_pressure_systolic}  unit="mmHg" icon="📈" color="cyan" />
                <MetricCard title="Diastolic BP" value={latest?.blood_pressure_diastolic} unit="mmHg" icon="📉" color="green" />
            </div>

            {/* Chart */}
            <LiveChart data={recent} fields={CHART_FIELDS} title="Vitals Trend (Live)" />

            {/* Active Alerts */}
            {(alerts.length > 0 || liveAlerts.length > 0) && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Active Alerts</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {[...liveAlerts, ...alerts].slice(0, 5).map((a, i) => (
                            <div key={a._id ?? i} className="px-5 py-3 flex items-start gap-2">
                                <AlertBadge severity={a.severity} />
                                <p className="text-sm text-slate-600 dark:text-slate-300">{a.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
