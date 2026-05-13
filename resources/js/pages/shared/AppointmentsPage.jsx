import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAppointments, createAppointment, selectAppointments } from '../../redux/slices/appointmentSlice';
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

export default function AppointmentsPage() {
    const dispatch     = useDispatch();
    const appointments = useSelector(selectAppointments);
    const { loading }  = useSelector((s) => s.appointments);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', scheduled_at: '', duration: 30, type: 'consultation', location: '' });

    useEffect(() => { dispatch(fetchAppointments()); }, [dispatch]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createAppointment(form)).unwrap();
            toast.success('Appointment booked!');
            setShowForm(false);
            setForm({ title: '', description: '', scheduled_at: '', duration: 30, type: 'consultation', location: '' });
        } catch (err) {
            toast.error(err ?? 'Failed to create appointment');
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Appointments</h1>
                    <p className="page-subtitle">Schedule and manage doctor-patient appointments.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Appointment
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="card p-6 animate-fade-in-up">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Book Appointment</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[['Title *', 'title', 'text', true], ['Location', 'location', 'text', false]].map(([label, name, type, req]) => (
                            <div key={name}>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                                <input required={req} type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="input-base" />
                            </div>
                        ))}
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
                    <div className="flex gap-3 mt-5">
                        <button type="submit" className="btn-primary">Book Appointment</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                    </div>
                </form>
            )}

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
                    <p className="text-slate-500 text-sm mt-1">Schedule an appointment to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((a) => {
                        const typeCfg   = typeConfig[a.type]   ?? { cls: 'status-info',    label: a.type };
                        const statusCfg = statusConfig[a.status] ?? { cls: 'status-info', label: a.status };
                        return (
                            <div key={a._id} className="card p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{a.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {a.scheduled_at ? format(parseISO(a.scheduled_at), 'PPp') : ''}
                                            {a.location ? ` â€¢ ${a.location}` : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeCfg.cls}`}>{typeCfg.label}</span>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.cls}`}>{statusCfg.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

