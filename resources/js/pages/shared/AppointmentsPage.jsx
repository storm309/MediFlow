import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAppointments, createAppointment, cancelAppointment, updateAppointment, selectAppointments } from '../../redux/slices/appointmentSlice';
import { selectUser } from '../../redux/slices/authSlice';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const typeConfig = {
    consultation: { cls: 'status-info',      label: 'Consultation' },
    follow_up:    { cls: 'status-warning',    label: 'Follow-up' },
    emergency:    { cls: 'status-emergency',  label: 'Emergency' },
    routine:      { cls: 'status-resolved',   label: 'Routine' },
};
const statusConfig = {
    scheduled:  { cls: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700', label: 'Scheduled' },
    confirmed:  { cls: 'status-resolved',  label: 'Confirmed' },
    cancelled:  { cls: 'status-emergency', label: 'Cancelled' },
    completed:  { cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600', label: 'Completed' },
    no_show:    { cls: 'status-critical',  label: 'No Show' },
};

/* ── Patient booking form ─────────────────────────────────────────── */
function PatientBookingForm({ user, onClose }) {
    const dispatch   = useDispatch();
    const patientId  = user?.patient_profile?._id;
    const doctorId   = user?.patient_profile?.doctor_id;
    const [form, setForm] = useState({
        title: '', description: '', scheduled_at: '',
        duration: 30, type: 'consultation', location: '',
        patient_id: patientId ?? '',
        doctor_id:  doctorId  ?? '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.patient_id) { toast.error('Patient profile not found'); return; }
        if (!form.doctor_id)  { toast.error('No doctor assigned to your profile yet'); return; }
        try {
            await dispatch(createAppointment(form)).unwrap();
            toast.success('Appointment booked!');
            onClose();
        } catch (err) {
            toast.error(err ?? 'Failed to book appointment');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card p-6 animate-fade-in-up">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Book Appointment</h3>
            {!doctorId && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                    No doctor is assigned to your profile yet. Contact admin to get a doctor assigned.
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Title *</label>
                    <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-base" placeholder="e.g. Follow-up checkup" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                    <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-base" placeholder="Room / Online" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Date & Time *</label>
                    <input required type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="input-base" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-base">
                        {Object.entries(typeConfig).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Reason / Notes</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-base resize-none" placeholder="Describe your concern…" />
            </div>
            <div className="flex gap-3 mt-5">
                <button type="submit" className="btn-primary">Book Appointment</button>
                <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            </div>
        </form>
    );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function AppointmentsPage() {
    const dispatch     = useDispatch();
    const appointments = useSelector(selectAppointments);
    const { loading }  = useSelector((s) => s.appointments);
    const user         = useSelector(selectUser);
    const isDoctor     = user?.role === 'doctor';
    const isPatient    = user?.role === 'patient';
    const [showForm, setShowForm]     = useState(false);
    const [cancellingId, setCancellingId] = useState(null);
    const [updatingId, setUpdatingId]     = useState(null);

    useEffect(() => { dispatch(fetchAppointments()); }, [dispatch]);

    const handleCancel = async (a) => {
        if (!window.confirm(`Cancel appointment "${a.title}"?`)) return;
        setCancellingId(a._id);
        try {
            await dispatch(cancelAppointment({ id: a._id, reason: 'Cancelled by doctor' })).unwrap();
            toast.success('Appointment cancelled');
        } catch (err) {
            toast.error(err ?? 'Failed to cancel');
        } finally {
            setCancellingId(null);
        }
    };

    const handleStatusChange = async (a, newStatus) => {
        setUpdatingId(a._id);
        try {
            await dispatch(updateAppointment({ id: a._id, data: { status: newStatus } })).unwrap();
            toast.success(`Marked as ${newStatus}`);
        } catch (err) {
            toast.error(err ?? 'Failed to update');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">{isDoctor ? 'Patient Appointments' : 'My Appointments'}</h1>
                    <p className="page-subtitle">
                        {isDoctor
                            ? 'View and manage all your patients\' scheduled appointments.'
                            : 'Book and track your appointments with your doctor.'}
                    </p>
                </div>
                {isPatient && (
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Appointment
                    </button>
                )}
            </div>

            {/* Patient booking form */}
            {isPatient && showForm && (
                <PatientBookingForm user={user} onClose={() => setShowForm(false)} />
            )}

            {/* List */}
            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
            ) : appointments.length === 0 ? (
                <div className="card p-14 text-center">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-white">No appointments</p>
                    <p className="text-slate-500 text-sm mt-1">
                        {isDoctor ? 'No patient appointments scheduled yet.' : 'Book an appointment to get started.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((a) => {
                        const typeCfg   = typeConfig[a.type]    ?? { cls: 'status-info',    label: a.type };
                        const statusCfg = statusConfig[a.status] ?? { cls: 'status-info', label: a.status };
                        const canAct    = a.status !== 'cancelled' && a.status !== 'completed';
                        return (
                            <div key={a._id} className="card p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{a.title}</p>
                                            {/* Doctor sees patient name; patient sees nothing extra */}
                                            {isDoctor && a.patient?.user?.name && (
                                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                                                    Patient: {a.patient.user.name}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {a.scheduled_at ? format(parseISO(a.scheduled_at), 'PPp') : ''}
                                                {a.location ? ` · ${a.location}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeCfg.cls}`}>{typeCfg.label}</span>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.cls}`}>{statusCfg.label}</span>

                                        {/* Doctor actions */}
                                        {isDoctor && canAct && (
                                            <>
                                                {a.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => handleStatusChange(a, 'confirmed')}
                                                        disabled={updatingId === a._id}
                                                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
                                                    >
                                                        {updatingId === a._id ? '…' : 'Confirm'}
                                                    </button>
                                                )}
                                                {a.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleStatusChange(a, 'completed')}
                                                        disabled={updatingId === a._id}
                                                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                                                    >
                                                        {updatingId === a._id ? '…' : 'Complete'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleCancel(a)}
                                                    disabled={cancellingId === a._id}
                                                    className="text-xs text-red-600 hover:text-red-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                                >
                                                    {cancellingId === a._id ? '…' : 'Cancel'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {a.description && (
                                    <p className="text-xs text-slate-500 mt-3 pl-15 ml-15 border-t border-slate-100 dark:border-slate-700 pt-2">{a.description}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


