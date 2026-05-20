import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';

const actionColors = {
    login:             'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    logout:            'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    create:            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    update:            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    delete:            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    view:              'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    export:            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    alert_resolved:    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const entityIcons = {
    user:          '👤',
    patient:       '🏥',
    health_metric: '📊',
    alert:         '⚠️',
    report:        '📄',
    appointment:   '📅',
};

const ACTIONS  = ['login', 'logout', 'create', 'update', 'delete', 'view', 'export', 'alert_resolved'];
const ENTITIES = ['user', 'patient', 'health_metric', 'alert', 'report', 'appointment'];

// Skeleton row for loading state
function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" /></td>
        </tr>
    );
}

export default function AdminAuditLogs() {
    const [logs,    setLogs]    = useState([]);
    const [meta,    setMeta]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [page,    setPage]    = useState(1);
    const [filters, setFilters] = useState({ action: '', entity_type: '', search: '' });
    const [search,  setSearch]  = useState('');

    const loadLogs = useCallback(async (currentPage = 1, currentFilters = filters) => {
        setLoading(true);
        try {
            const params = { page: currentPage, per_page: 20, ...currentFilters };
            // Remove empty filter values
            Object.keys(params).forEach(k => !params[k] && delete params[k]);
            const res = await api.get('/admin/activity-logs', { params });
            setLogs(res.data.data?.data ?? []);
            setMeta(res.data.data?.meta ?? res.data.data);
        } catch (_) {
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadLogs(page, filters);
    }, [page, filters]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        setPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        handleFilterChange('search', search);
    };

    const totalPages = meta?.last_page ?? 1;

    return (
        <div className="p-6 space-y-6 max-w-7xl">
            {/* Header */}
            <div>
                <h1 className="page-title">Audit Logs</h1>
                <p className="page-subtitle">Track all system actions — who did what and when.</p>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
                        <input
                            type="text"
                            placeholder="Search by user or description…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input flex-1 text-sm"
                        />
                        <button type="submit" className="btn-primary text-sm px-3">Search</button>
                    </form>

                    {/* Action filter */}
                    <select
                        value={filters.action}
                        onChange={(e) => handleFilterChange('action', e.target.value)}
                        className="input text-sm w-40"
                    >
                        <option value="">All Actions</option>
                        {ACTIONS.map(a => (
                            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                        ))}
                    </select>

                    {/* Entity filter */}
                    <select
                        value={filters.entity_type}
                        onChange={(e) => handleFilterChange('entity_type', e.target.value)}
                        className="input text-sm w-44"
                    >
                        <option value="">All Entities</option>
                        {ENTITIES.map(e => (
                            <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>
                        ))}
                    </select>

                    {/* Clear */}
                    {(filters.action || filters.entity_type || filters.search) && (
                        <button
                            onClick={() => { setFilters({ action: '', entity_type: '', search: '' }); setSearch(''); setPage(1); }}
                            className="text-sm text-slate-500 hover:text-red-500 transition-colors"
                        >
                            ✕ Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entity</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>No logs found for the selected filters.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white text-xs">
                                                    {log.user?.name ?? 'System'}
                                                </p>
                                                <p className="text-[11px] text-slate-400 truncate max-w-32">
                                                    {log.user?.email ?? '—'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-full capitalize ${actionColors[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {log.action?.replace(/_/g, ' ') ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                                                <span>{entityIcons[log.entity_type] ?? '📦'}</span>
                                                <span className="capitalize">{log.entity_type?.replace(/_/g, ' ') ?? '—'}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize font-medium ${
                                                log.user?.role === 'admin'   ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                                                log.user?.role === 'doctor'  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                                log.user?.role === 'patient' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                                {log.user?.role ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 max-w-xs">
                                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate" title={log.description}>
                                                {log.description ?? '—'}
                                            </p>
                                            {log.ip_address && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">{log.ip_address}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                                {log.created_at ? new Date(log.created_at).toLocaleDateString() : '—'}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                {log.created_at ? new Date(log.created_at).toLocaleTimeString() : ''}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                ← Previous
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
