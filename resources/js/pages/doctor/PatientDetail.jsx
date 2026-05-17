import React, { useEffect, useState } from 'react';
import { useParams, Link }     from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatient }        from '../../redux/slices/patientSlice';
import { fetchRecentMetrics, selectRecent } from '../../redux/slices/metricsSlice';
import { fetchAlerts }         from '../../redux/slices/alertSlice';
import { fetchAppointments, cancelAppointment, selectAppointments } from '../../redux/slices/appointmentSlice';
import { fetchReports, addReportNotes, selectReports } from '../../redux/slices/reportSlice';
import { usePatientChannel }   from '../../hooks/useRealtimeChannels';
import MetricCard              from '../../components/ui/MetricCard';
import LiveChart               from '../../components/ui/LiveChart';
import AlertBadge              from '../../components/ui/AlertBadge';
import AiRiskCard              from '../../components/ui/AiRiskCard';

import { format, parseISO, isFuture } from 'date-fns';
import toast from 'react-hot-toast';

const CHART_FIELDS = [
    { key: 'heart_rate',  label: 'Heart Rate',  color: '#EF4444' },
    { key: 'spo2',        label: 'SpO₂ %',      color: '#2563EB' },
    { key: 'temperature', label: 'Temp °F',     color: '#F59E0B' },
    { key: 'sugar_level', label: 'Sugar mg/dL', color: '#8B5CF6' },
];

const statusCls = {
    scheduled: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700',
    confirmed: 'status-resolved',
    cancelled: 'status-emergency',
    completed: 'bg-slate-100 dark:bg-slate-700 text-slate-500',
    no_show:   'status-critical',
};

export default function PatientDetail() {
    const { id }   = useParams();
    const dispatch = useDispatch();
    const patient  = useSelector((s) => s.patients.selected);
    const recent   = useSelector(selectRecent);
    const { items: alerts, loading: aLoading } = useSelector((s) => s.alerts);
    const latest   = useSelector((s) => s.metrics.latestByPatient[id]);
    const appointments = useSelector(selectAppointments);
    const reports  = useSelector(selectReports);

    const [cancellingId, setCancellingId] = useState(null);
    const [notesForm, setNotesForm]       = useState({ id: null, text: '', status: 'reviewed' });
    const [savingNotes, setSavingNotes]   = useState(false);
    const [activeTab, setActiveTab]       = useState('vitals');

    usePatientChannel(id);

    useEffect(() => {
        dispatch(fetchPatient(id));
        dispatch(fetchRecentMetrics(id));
        dispatch(fetchAlerts({ patient_id: id }));
        dispatch(fetchAppointments({ patient_id: id }));
        dispatch(fetchReports({ patient_id: id }));
    }, [id, dispatch]);

    if (!patient) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            </div>
        );
    }

    const patientAppts = appointments.filter(a =>
        (a.patient_id === id) || String(a.patient_id) === String(id)
    );

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

    const handleSaveNotes = async (e) => {
        e.preventDefault();
        if (!notesForm.id || !notesForm.text.trim()) return;
        setSavingNotes(true);
        try {
            await dispatch(addReportNotes({ id: notesForm.id, doctor_notes: notesForm.text, status: notesForm.status })).unwrap();
            toast.success('Notes saved');
            setNotesForm({ id: null, text: '', status: 'reviewed' });
        } catch (err) {
            toast.error(err ?? 'Failed to save notes');
        } finally {
            setSavingNotes(false);
        }
    };

    const initial = patient.user?.name?.[0]?.toUpperCase() ?? '?';

    const tabs = [
        { key: 'vitals',       label: 'Vitals & Charts' },
        { key: 'appointments', label: `Appointments (${patientAppts.length})` },
        { key: 'reports',      label: `Reports (${reports.length})` },
        { key: 'alerts',       label: `Alerts (${alerts.length})` },
        { key: 'ai',           label: 'AI Risk' },
    ];

    return (
        <div className="space-y-6 p-6 max-w-6xl">
            {/* Back */}
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back to Dashboard
            </Link>

            {/* Patient Header */}
            <div className="card p-6">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                        {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{patient.user?.name}</h1>
                            {patient.is_critical && (
                                <span className="status-emergency badge-pulse text-xs font-bold px-2.5 py-1 rounded-full">CRITICAL</span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                            {patient.age        && <span className="text-sm text-slate-500"><span className="font-medium">Age:</span> {patient.age} yrs</span>}
                            {patient.gender     && <span className="text-sm text-slate-500 capitalize"><span className="font-medium">Gender:</span> {patient.gender}</span>}
                            {patient.blood_group && <span className="text-sm text-slate-500"><span className="font-medium">Blood:</span> {patient.blood_group}</span>}
                            {patient.phone      && <span className="text-sm text-slate-500"><span className="font-medium">Phone:</span> {patient.phone}</span>}
                            {patient.user?.email && <span className="text-sm text-slate-500"><span className="font-medium">Email:</span> {patient.user.email}</span>}
                        </div>
                        {(patient.allergies?.length > 0 || patient.current_medications?.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {patient.allergies?.map(a => (
                                    <span key={a} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 px-2 py-0.5 rounded-full">⚠ {a}</span>
                                ))}
                                {patient.current_medications?.map(m => (
                                    <span key={m} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full">💊 {m}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                    </div>
                </div>
            </div>

            {/* Full vitals grid — always visible */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Heart Rate"   value={latest?.heart_rate}               unit="bpm"   color="red"    />
                <MetricCard title="SpO₂"         value={latest?.spo2}                     unit="%"     color="blue"   />
                <MetricCard title="Temperature"  value={latest?.temperature}              unit="°F"   color="yellow" />
                <MetricCard title="Blood Sugar"  value={latest?.sugar_level}             unit="mg/dL" color="purple" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Systolic BP"  value={latest?.blood_pressure_systolic}  unit="mmHg" color="cyan"   />
                <MetricCard title="Diastolic BP" value={latest?.blood_pressure_diastolic} unit="mmHg" color="green"  />
                <MetricCard title="Resp. Rate"   value={latest?.respiratory_rate}         unit="/min" color="indigo" />
                <MetricCard title="Weight"       value={latest?.weight}                   unit="kg"   color="orange" />
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex gap-1 overflow-x-auto">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === t.key
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >{t.label}</button>
                    ))}
                </nav>
            </div>

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
                <LiveChart data={recent} fields={CHART_FIELDS} title="Vitals Over Time" />
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900 dark:text-white">All Appointments</h2>
                        <span className="text-xs text-slate-400">{patientAppts.length} total</span>
                    </div>
                    {patientAppts.length === 0 ? (
                        <div className="p-10 text-center text-slate-500 text-sm">No appointments for this patient.</div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {patientAppts.map(a => (
                                <div key={a._id} className="px-6 py-4 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center shrink-0 text-purple-500">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {a.scheduled_at ? format(parseISO(a.scheduled_at), 'MMM d, yyyy h:mm a') : ''}
                                            {a.duration && ` · ${a.duration} min`}
                                            {a.type && ` · ${a.type.replace('_', ' ')}`}
                                        </p>
                                        {a.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{a.description}</p>}
                                        {a.cancelled_reason && <p className="text-xs text-red-500 mt-1">Reason: {a.cancelled_reason}</p>}
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
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div className="space-y-4">
                    {reports.length === 0 ? (
                        <div className="card p-10 text-center text-slate-500 text-sm">No reports generated yet.</div>
                    ) : reports.map(r => (
                        <div key={r._id} className="card overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white capitalize">{r.period} Report</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy') : ''}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.status === 'reviewed' || r.status === 'finalized' ? 'status-resolved' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700'}`}>{r.status}</span>
                                    <a href={`/api/v1/reports/${r._id}/pdf`} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    >Download PDF</a>
                                </div>
                            </div>
                            {r.doctor_notes && (
                                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/10">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Doctor Notes:</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{r.doctor_notes}</p>
                                </div>
                            )}
                            {notesForm.id !== r._id ? (
                                <div className="px-6 py-3">
                                    <button onClick={() => setNotesForm({ id: r._id, text: r.doctor_notes ?? '', status: r.status ?? 'reviewed' })}
                                        className="text-xs text-blue-600 font-semibold hover:text-blue-700"
                                    >{r.doctor_notes ? 'Edit Notes' : '+ Add Doctor Notes'}</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveNotes} className="px-6 py-4 space-y-3 border-t border-slate-100 dark:border-slate-700">
                                    <textarea
                                        value={notesForm.text}
                                        onChange={e => setNotesForm(n => ({ ...n, text: e.target.value }))}
                                        rows={3}
                                        placeholder="Enter doctor notes..."
                                        className="input-base resize-none"
                                        required
                                    />
                                    <div className="flex items-center gap-3">
                                        <select value={notesForm.status} onChange={e => setNotesForm(n => ({ ...n, status: e.target.value }))} className="input-base w-auto text-sm">
                                            <option value="reviewed">Reviewed</option>
                                            <option value="finalized">Finalized</option>
                                        </select>
                                        <button type="submit" disabled={savingNotes} className="btn-primary text-sm disabled:opacity-50">
                                            {savingNotes ? 'Saving...' : 'Save Notes'}
                                        </button>
                                        <button type="button" onClick={() => setNotesForm({ id: null, text: '', status: 'reviewed' })} className="btn-ghost text-sm">Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
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
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{a.message}</p>
                                        {a.created_at && <p className="text-xs text-slate-400 mt-1">{format(new Date(a.created_at), 'MMM d, HH:mm')}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
                <AiRiskCard patientId={id} />
            )}
        </div>
    );
}
