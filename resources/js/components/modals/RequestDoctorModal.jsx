import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { selectUser } from '../../redux/slices/authSlice';

export default function RequestDoctorModal({ isOpen, onClose, onSuccess }) {
    const user = useSelector(selectUser);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadDoctors();
        }
    }, [isOpen]);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctors');
            setDoctors(res.data.data ?? []);
        } catch (err) {
            toast.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDoctor) {
            toast.error('Please select a doctor');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/patients/request-doctor', {
                doctor_id: selectedDoctor._id,
                reason: reason || undefined,
            });
            toast.success('Request sent! You will be notified when approved.');
            setSelectedDoctor(null);
            setReason('');
            onClose();
            onSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Request failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request a Doctor</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Connect with a healthcare professional to get personalized care.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Doctor Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Select Doctor</label>
                        {loading ? (
                            <div className="text-center py-3 text-slate-500 text-sm">Loading doctors...</div>
                        ) : (
                            <select
                                value={selectedDoctor?._id ?? ''}
                                onChange={(e) => setSelectedDoctor(doctors.find(d => d._id === e.target.value))}
                                className="input-base w-full"
                                required
                            >
                                <option value="">Choose a doctor...</option>
                                {doctors.map(d => (
                                    <option key={d._id} value={d._id}>
                                        Dr. {d.name}
                                        {d.phone && ` • ${d.phone}`}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Doctor Info */}
                    {selectedDoctor && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <p className="text-sm text-slate-900 dark:text-white font-medium">Dr. {selectedDoctor.name}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{selectedDoctor.email}</p>
                            {selectedDoctor.phone && (
                                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedDoctor.phone}</p>
                            )}
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                            Reason (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Tell the doctor why you're requesting their services..."
                            maxLength={500}
                            className="input-base w-full resize-none"
                            rows={3}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{reason.length}/500</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn btn-secondary"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submitting || !selectedDoctor}
                        >
                            {submitting ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
