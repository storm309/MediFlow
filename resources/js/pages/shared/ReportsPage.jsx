import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch }    from 'react-redux';
import { fetchReports, generateReport, selectReports } from '../../redux/slices/reportSlice';
import { format } from 'date-fns';
import toast       from 'react-hot-toast';

export default function ReportsPage() {
    const dispatch = useDispatch();
    const reports  = useSelector(selectReports);
    const { loading } = useSelector((s) => s.reports);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm]         = useState({ period: 'weekly', start_date: '', end_date: '' });

    useEffect(() => {
        dispatch(fetchReports());
    }, [dispatch]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        try {
            await dispatch(generateReport(form)).unwrap();
            toast.success('Report generated!');
            setShowForm(false);
        } catch (err) {
            toast.error(err ?? 'Failed to generate report');
        }
    };

    const handleDownloadPdf = (id) => {
        window.open(`/api/v1/reports/${id}/pdf`, '_blank');
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    + Generate Report
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleGenerate}
                    className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Period</label>
                        <select
                            value={form.period}
                            onChange={(e) => setForm({ ...form, period: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Start Date</label>
                        <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">End Date</label>
                        <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white" />
                    </div>
                    <div className="sm:col-span-3 flex gap-3">
                        <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">Generate</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded-lg">Cancel</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white dark:bg-slate-800 rounded-xl animate-pulse shadow-sm" />)}
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="font-medium">No reports yet</p>
                    <p className="text-sm mt-1">Generate a report to view health summaries.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map((r) => (
                        <div key={r._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{r.period} Report</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {r.start_date ? format(new Date(r.start_date), 'MMM d') : ''} –
                                    {r.end_date ? format(new Date(r.end_date), 'MMM d, yyyy') : ''}
                                    {' • '}{r.metrics_count ?? 0} readings
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                    r.status === 'finalized' ? 'bg-green-100 text-green-700' :
                                    r.status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                }`}>{r.status}</span>
                                {r.pdf_path && (
                                    <button
                                        onClick={() => handleDownloadPdf(r._id)}
                                        className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                                    >
                                        📄 PDF
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
