import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch }    from 'react-redux';
import { fetchAppointments, createAppointment, selectAppointments } from '../../redux/slices/appointmentSlice';
import { format, parseISO } from 'date-fns';
import toast                 from 'react-hot-toast';

const typeColors = { consultation: 'bg-blue-100 text-blue-700', follow_up: 'bg-purple-100 text-purple-700', emergency: 'bg-red-100 text-red-700', routine: 'bg-green-100 text-green-700' };
const statusColors = { scheduled: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', completed: 'bg-slate-100 text-slate-600', no_show: 'bg-orange-100 text-orange-700' };

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
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Appointments</h1>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    + New Appointment
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[['Title', 'title', 'text'], ['Location', 'location', 'text']].map(([label, name, type]) => (
                        <div key={name}>
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{label}</label>
                            <input required={name === 'title'} type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white" />
                        </div>
                    ))}
                    <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Date & Time</label>
                        <input required type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Type</label>
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white">
                            {['consultation', 'follow_up', 'emergency', 'routine'].map(t => <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                        <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">Book</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded-lg">Cancel</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white dark:bg-slate-800 rounded-xl animate-pulse shadow-sm" />)}</div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="font-medium">No appointments</p>
                    <p className="text-sm mt-1">Schedule an appointment to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((a) => (
                        <div key={a._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">{a.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {a.scheduled_at ? format(parseISO(a.scheduled_at), 'PPp') : ''}
                                    {a.location ? ` • ${a.location}` : ''}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeColors[a.type] ?? 'bg-slate-100 text-slate-600'}`}>{a.type?.replace('_', ' ')}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[a.status] ?? 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
