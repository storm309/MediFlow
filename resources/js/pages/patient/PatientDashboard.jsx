import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestMetric, fetchRecentMetrics, selectRecent } from '../../redux/slices/metricsSlice';
import { fetchAlerts, selectLiveAlerts } from '../../redux/slices/alertSlice';
import { fetchAppointments, selectAppointments } from '../../redux/slices/appointmentSlice';
import { usePatientChannel } from '../../hooks/useRealtimeChannels';
import MetricCard from '../../components/ui/MetricCard';
import LiveChart from '../../components/ui/LiveChart';
import AlertBadge from '../../components/ui/AlertBadge';
import AiRiskCard from '../../components/ui/AiRiskCard';
import EmergencyBanner from '../../components/ui/EmergencyBanner';
import RequestDoctorModal from '../../components/modals/RequestDoctorModal';
import { selectUser } from '../../redux/slices/authSlice';
import { format, parseISO, isFuture } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CHART_FIELDS = [
    { key: 'heart_rate',  label: 'Heart Rate', color: '#ef4444' },
    { key: 'spo2',        label: 'SpO2 %',     color: '#3b82f6' },
    { key: 'temperature', label: 'Temp °F',    color: '#f59e0b' },
];

const UPLOAD_TYPES = ['report', 'prescription', 'scan', 'xray', 'other'];

export default function PatientDashboard() {
    const dispatch   = useDispatch();
    const user       = useSelector(selectUser);
    const recent     = useSelector(selectRecent);
    const { items: alerts } = useSelector((s) => s.alerts);
    const liveAlerts = useSelector(selectLiveAlerts);
    const appointments = useSelector(selectAppointments);
    const patientId  = user?.patient_profile?._id;
    const latest     = useSelector((s) => s.metrics.latestByPatient[patientId]);

    // File upload state
    const [uploadFile, setUploadFile]   = useState(null);
    const [uploadLabel, setUploadLabel] = useState('');
    const [uploadType, setUploadType]   = useState('report');
    const [uploading, setUploading]     = useState(false);
    const [uploads, setUploads]         = useState([]);
    const [uploadErr, setUploadErr]     = useState('');
    const [showRequestDoctor, setShowRequestDoctor] = useState(false);

    usePatientChannel(patientId);

    useEffect(() => {
        if (patientId) {
            dispatch(fetchLatestMetric(patientId));
            dispatch(fetchRecentMetrics(patientId));
            dispatch(fetchAlerts({ patient_id: patientId }));
            dispatch(fetchAppointments());
            loadUploads();
        }
    }, [patientId, dispatch]);

    const loadUploads = async () => {
        try {
            const res = await api.get(`/uploads/${patientId}`);
            setUploads(res.data.data ?? []);
        } catch (_) {}
    };

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(f.type)) { setUploadErr('Only PDF, JPEG, PNG, WEBP, GIF allowed'); return; }
        if (f.size > 10 * 1024 * 1024) { setUploadErr('Max file size is 10 MB'); return; }
        setUploadFile(f);
        setUploadErr('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !patientId) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('patient_id', patientId);
            formData.append('type', uploadType);
            formData.append('label', uploadLabel || uploadFile.name);
            await api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Document uploaded successfully!');
            setUploadFile(null);
            setUploadLabel('');
            loadUploads();
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const allAlerts = [...liveAlerts, ...alerts].slice(0, 5);
    const upcomingAppts = appointments
        .filter(a => a.status !== 'cancelled' && a.status !== 'completed' && a.scheduled_at && isFuture(parseISO(a.scheduled_at)))
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
        .slice(0, 3);

    return (
        <div className="space-y-8 p-6 max-w-7xl">
            {/* Emergency Banner — shown only when SpO2 < 85 or HR > 130 */}
            <EmergencyBanner latest={latest} />

            {/* Doctor Assignment Alert */}
            {!user?.patient_profile?.doctor_id && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 dark:text-amber-200">No Doctor Assigned Yet</h3>
                        <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">You need a doctor to generate reports and receive personalized health guidance. Request one now!</p>
                        <button
                            onClick={() => setShowRequestDoctor(true)}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m0 0h3m-3 0h3M9 9h.01M15 15H9.01M7 15h.01M5 21H3a2 2 0 01-2-2V3a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-2.25" /></svg>
                            Request a Doctor
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title">Hello, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="page-subtitle">Here's your complete health overview.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Live Vitals</span>
                </div>
            </div>

            {/* Primary vitals row */}
            <div>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Current Vitals</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <MetricCard title="Heart Rate"  value={latest?.heart_rate}  unit="bpm"   color="red"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} />
                    <MetricCard title="SpO₂"        value={latest?.spo2}        unit="%"     color="blue"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" strokeLinecap="round" /><path strokeLinecap="round" d="M12 7v5l3 3" /></svg>} />
                    <MetricCard title="Temperature" value={latest?.temperature} unit="°F"    color="yellow"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>} />
                    <MetricCard title="Blood Sugar" value={latest?.sugar_level} unit="mg/dL" color="purple"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} />
                </div>
            </div>

            {/* BP + extra vitals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <MetricCard title="Systolic BP"    value={latest?.blood_pressure_systolic}  unit="mmHg" color="cyan"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                <MetricCard title="Diastolic BP"   value={latest?.blood_pressure_diastolic} unit="mmHg" color="green"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>} />
                <MetricCard title="Resp. Rate"     value={latest?.respiratory_rate}         unit="/min" color="indigo"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>} />
                <MetricCard title="Weight"         value={latest?.weight}                   unit="kg"   color="orange"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5 5 0 006.027 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5 5 0 006.027 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>} />
            </div>

            {/* Trend chart */}
            <LiveChart data={recent} fields={CHART_FIELDS} title="Vitals Trend (Live)" />

            {/* AI Risk Analysis */}
            {patientId && (
                <div>
                    <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">AI Health Risk</h2>
                    <AiRiskCard patientId={patientId} />
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <h2 className="font-bold text-slate-900 dark:text-white">Upcoming Appointments</h2>
                        </div>
                        <Link to="/appointments" className="text-xs text-blue-600 font-medium hover:text-blue-700">View all →</Link>
                    </div>
                    {upcomingAppts.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-slate-500 text-sm">No upcoming appointments.</p>
                            <Link to="/appointments" className="mt-3 inline-block text-xs text-blue-600 font-semibold hover:text-blue-700">Schedule one →</Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {upcomingAppts.map(a => (
                                <div key={a._id} className="px-6 py-4 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{a.title}</p>
                                        <p className="text-xs text-slate-500">{a.scheduled_at ? format(parseISO(a.scheduled_at), 'MMM d, h:mm a') : ''}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.status === 'confirmed' ? 'status-resolved' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'}`}>
                                        {a.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Uploads */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <h2 className="font-bold text-slate-900 dark:text-white">My Documents</h2>
                        </div>
                        <span className="text-xs text-slate-400">{uploads.length} file{uploads.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-48 overflow-y-auto">
                        {uploads.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-slate-500 text-sm">No documents uploaded yet.</p>
                            </div>
                        ) : uploads.slice(0, 5).map(f => (
                            <div key={f._id} className="px-6 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{f.label}</p>
                                    <p className="text-xs text-slate-400 capitalize">{f.type}</p>
                                </div>
                                <a href={`/api/v1/uploads/serve/${f._id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View</a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submit Document */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-white">Submit Medical Document</h2>
                        <p className="text-xs text-slate-500">Upload your reports, prescriptions, scans (PDF or image, max 10 MB)</p>
                    </div>
                </div>
                <form onSubmit={handleUpload} className="space-y-4">
                    {uploadErr && (
                        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600">{uploadErr}</div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Document Type</label>
                            <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="input-base capitalize">
                                {UPLOAD_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Label / Description</label>
                            <input type="text" value={uploadLabel} onChange={e => setUploadLabel(e.target.value)} placeholder="e.g. Blood Test June 2025" className="input-base" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">File *</label>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif" onChange={handleFileChange} className="input-base file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
                        </div>
                    </div>
                    {uploadFile && (
                        <p className="text-xs text-slate-500">Selected: <span className="font-medium text-slate-700 dark:text-slate-300">{uploadFile.name}</span> ({(uploadFile.size / 1024).toFixed(0)} KB)</p>
                    )}
                    <div className="flex gap-3">
                        <button type="submit" disabled={!uploadFile || uploading} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                            {uploading ? (
                                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Uploading...</span>
                            ) : 'Upload Document'}
                        </button>
                        {uploadFile && (
                            <button type="button" onClick={() => { setUploadFile(null); setUploadErr(''); }} className="btn-ghost">Clear</button>
                        )}
                    </div>
                </form>
            </div>

            {/* Active alerts */}
            {allAlerts.length > 0 && (
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h2 className="font-bold text-slate-900 dark:text-white">Active Health Alerts</h2>
                        <span className="ml-auto text-xs bg-red-100 dark:bg-red-900/30 text-red-600 font-bold px-2 py-0.5 rounded-full">{allAlerts.length}</span>
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

            {/* Request Doctor Modal */}
            <RequestDoctorModal
                isOpen={showRequestDoctor}
                onClose={() => setShowRequestDoctor(false)}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
}

