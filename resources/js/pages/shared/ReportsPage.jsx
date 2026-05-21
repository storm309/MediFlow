import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReports, generateReport, addReportNotes, selectReports } from '../../redux/slices/reportSlice';
import { selectUser } from '../../redux/slices/authSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';

const statusBadge = {
    finalized: 'status-resolved',
    reviewed:  'status-info',
    draft:     'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
};

/* ── Doctor notes inline form ─────────────────────────────── */
function DoctorNotesForm({ report, onSaved }) {
    const dispatch = useDispatch();
    const [notes, setNotes]   = useState(report.doctor_notes ?? '');
    const [status, setStatus] = useState(report.status ?? 'draft');
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await dispatch(addReportNotes({ id: report._id, doctor_notes: notes, status })).unwrap();
            toast.success('Notes saved');
            onSaved();
        } catch (err) {
            toast.error(err ?? 'Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
            <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-base resize-none text-sm"
                placeholder="Add clinical notes for this patient's report…"
            />
            <div className="flex items-center gap-3">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-base text-xs py-1.5 w-36">
                    <option value="draft">Draft</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="finalized">Finalized</option>
                </select>
                <button type="submit" disabled={saving} className="btn-primary text-xs py-1.5 px-4">
                    {saving ? 'Saving…' : 'Save Notes'}
                </button>
            </div>
        </form>
    );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function ReportsPage() {
    const dispatch = useDispatch();
    const reports  = useSelector(selectReports);
    const { loading } = useSelector((s) => s.reports);
    const user     = useSelector(selectUser);
    const isDoctor = user?.role === 'doctor';
    const isPatient = user?.role === 'patient';
    const isAdmin = user?.role === 'admin';

    const [showForm, setShowForm]       = useState(false);
    const [expandedId, setExpandedId]   = useState(null);
    const [form, setForm] = useState({ period: 'weekly', start_date: '', end_date: '' });

    useEffect(() => { dispatch(fetchReports()); }, [dispatch]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        const patientId = user?.patient_profile?._id;
        if (!patientId) { toast.error('Patient profile not found'); return; }
        try {
            await dispatch(generateReport({ ...form, patient_id: patientId })).unwrap();
            toast.success('Report generated!');
            setForm({ period: 'weekly', start_date: '', end_date: '' });
            setShowForm(false);
        } catch (err) {
            toast.error(err ?? 'Failed to generate report');
        }
    };

    const handleDownloadPdf = async (id) => {
        try {
            const res = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error('Failed to download PDF');
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">{isDoctor ? 'Patient Reports' : isAdmin ? 'System Reports' : 'My Health Reports'}</h1>
                    <p className="page-subtitle">
                        {isDoctor
                            ? 'Review reports for all your patients and add clinical notes.'
                            : isAdmin
                            ? 'View and manage health reports across the entire system.'
                            : 'Generate and download your personal health summaries.'}
                    </p>
                </div>
                {isPatient && (
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Generate Report
                    </button>
                )}
            </div>

            {/* Patient generate form */}
            {isPatient && showForm && (
                <form onSubmit={handleGenerate} className="card p-6 animate-fade-in-up">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">New Health Report</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Period</label>
                            <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="input-base">
                                {['daily', 'weekly', 'monthly'].map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Start Date</label>
                            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input-base" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">End Date</label>
                            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="input-base" />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                        <button type="submit" className="btn-primary">Generate</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                    </div>
                </form>
            )}

            {/* List */}
            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
            ) : reports.length === 0 ? (
                <div className="card p-14 text-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-white">No reports yet</p>
                    <p className="text-slate-500 text-sm mt-1">
                        {isDoctor ? 'No patient reports available yet.' : isAdmin ? 'No system reports available yet.' : 'Generate a report to view your health summary.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map((r) => (
                        <div key={r._id} className="card p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white capitalize">{r.period} Report</p>
                                        {/* Doctor sees patient name */}
                                        {isDoctor && r.patient?.user?.name && (
                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                                                Patient: {r.patient.user.name}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {r.start_date ? format(new Date(r.start_date), 'MMM d') : ''}
                                            {r.end_date ? ` – ${format(new Date(r.end_date), 'MMM d, yyyy')}` : ''}
                                            {r.metrics_count != null ? ` · ${r.metrics_count} readings` : ''}
                                        </p>
                                        {/* Show existing doctor notes */}
                                        {r.doctor_notes && (
                                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">"{r.doctor_notes}"</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusBadge[r.status] ?? statusBadge.draft}`}>{r.status ?? 'draft'}</span>
                                    {r.pdf_path && (
                                        <button onClick={() => handleDownloadPdf(r._id)}
                                            className="flex items-center gap-1.5 btn-ghost text-xs px-3 py-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            PDF
                                        </button>
                                    )}
                                    {/* Doctor: add/edit notes */}
                                    {isDoctor && (
                                        <button
                                            onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                        >
                                            {expandedId === r._id ? 'Close' : (r.doctor_notes ? 'Edit Notes' : '+ Add Notes')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Inline notes editor for doctor */}
                            {isDoctor && expandedId === r._id && (
                                <DoctorNotesForm report={r} onSaved={() => setExpandedId(null)} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

