import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { selectUser } from '../../redux/slices/authSlice';
import { format } from 'date-fns';

/* ── KPI Card ──────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon, gradient, glow }) {
    return (
        <div className="card p-5 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${glow} 0%, transparent 60%)` }} />
            <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}
                    style={{ boxShadow: `0 8px 20px ${glow}` }}>
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {value ?? <span className="inline-block w-12 h-6 skeleton rounded" />}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
            {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
        </div>
    );
}

/* ── Contact Request Row ───────────────────────────────────────────── */
function ContactRow({ log }) {
    const meta = log.metadata ?? {};
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-md">
                {meta.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{meta.name ?? '—'}</p>
                <p className="text-xs text-slate-500 truncate">{meta.email ?? '—'}</p>
                {meta.message && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{meta.message}</p>
                )}
            </div>
            <p className="text-[11px] text-slate-400 shrink-0 mt-0.5">
                {log.created_at ? format(new Date(log.created_at), 'MMM d') : ''}
            </p>
        </div>
    );
}

/* ── Activity Row ──────────────────────────────────────────────────── */
const actionGrad = {
    login:           'from-emerald-500 to-teal-600',
    logout:          'from-slate-400 to-slate-500',
    create:          'from-blue-500 to-indigo-600',
    update:          'from-amber-500 to-orange-600',
    delete:          'from-red-500 to-rose-600',
    contact_request: 'from-violet-500 to-purple-600',
    alert_resolved:  'from-cyan-500 to-blue-600',
};
function ActivityRow({ log }) {
    const grad = actionGrad[log.action] ?? 'from-slate-400 to-slate-500';
    return (
        <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className={`w-7 h-7 shrink-0 bg-gradient-to-br ${grad} rounded-lg flex items-center justify-center`}>
                <span className="text-[9px] text-white font-black uppercase">{log.action?.substring(0, 2)}</span>
            </div>
            <p className="flex-1 text-xs text-slate-600 dark:text-slate-300 truncate">{log.description}</p>
            <p className="text-[11px] text-slate-400 shrink-0">
                {log.created_at ? format(new Date(log.created_at), 'HH:mm') : ''}
            </p>
        </div>
    );
}

/* ── System Status Item ────────────────────────────────────────────── */
function StatusItem({ label, ok, note }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
            </div>
            <span className={`text-xs font-semibold ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{note}</span>
        </div>
    );
}

/* ── Quick Actions Config ──────────────────────────────────────────── */
const quickActions = [
    { to: '/admin/users', label: 'Manage Users', desc: 'Edit roles & accounts', gradient: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.3)', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { to: '/admin/doctors/verify', label: 'Verify Doctors', desc: 'Approve credentials', gradient: 'from-amber-500 to-orange-600', glow: 'rgba(245,158,11,0.3)', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { to: '/admin/audit-logs', label: 'Audit Logs', desc: 'System activity', gradient: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.3)', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { to: '/alerts', label: 'Alerts', desc: 'Health alerts', gradient: 'from-rose-500 to-pink-600', glow: 'rgba(244,63,94,0.3)', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
    { to: '/reports', label: 'Reports', desc: 'Patient reports', gradient: 'from-blue-500 to-indigo-600', glow: 'rgba(99,102,241,0.3)', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { to: '/appointments', label: 'Appointments', desc: 'All schedules', gradient: 'from-cyan-500 to-teal-600', glow: 'rgba(6,182,212,0.3)', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
];

/* ── Main Dashboard ────────────────────────────────────────────────── */
export default function AdminDashboard() {
    const user = useSelector(selectUser);
    const [stats, setStats]             = useState(null);
    const [contactReqs, setContactReqs] = useState([]);
    const [recentLogs, setRecentLogs]   = useState([]);
    const [pendingDrs, setPendingDrs]   = useState(0);

    useEffect(() => {
        api.get('/admin/dashboard').then(r => setStats(r.data.data)).catch(() => {});
        api.get('/admin/activity-logs', { params: { action: 'contact_request', per_page: 5 } })
            .then(r => setContactReqs(r.data.data?.data ?? [])).catch(() => {});
        api.get('/admin/activity-logs', { params: { per_page: 8 } })
            .then(r => setRecentLogs(r.data.data?.data ?? [])).catch(() => {});
        api.get('/admin/pending-doctors')
            .then(r => setPendingDrs(r.data.data?.total ?? (Array.isArray(r.data.data) ? r.data.data.length : 0)))
            .catch(() => {});
    }, []);

    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-7 p-6 max-w-7xl">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-0.5">{greeting}, {user?.name?.split(' ')[0]} 👋</p>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">System-wide overview — {format(now, 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">System Online</span>
                    </div>
                    {pendingDrs > 0 && (
                        <Link to="/admin/doctors/verify"
                            className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                            <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">{pendingDrs}</span>
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Pending Doctors</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* KPI Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard label="Total Users" value={stats?.total_users} sub={`+${stats?.new_users_today ?? 0} today`}
                    gradient="from-indigo-500 to-violet-600" glow="rgba(99,102,241,0.25)"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <KpiCard label="Doctors" value={stats?.total_doctors} sub="Registered"
                    gradient="from-blue-500 to-cyan-600" glow="rgba(59,130,246,0.25)"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
                <KpiCard label="Patients" value={stats?.total_patients} sub="Enrolled"
                    gradient="from-emerald-500 to-teal-600" glow="rgba(16,185,129,0.25)"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                <KpiCard label="Critical Patients" value={stats?.critical_patients ?? 0} sub="Require attention"
                    gradient="from-red-500 to-rose-600" glow="rgba(239,68,68,0.25)"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} />
            </div>

            {/* KPI Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard label="Unread Alerts" value={stats?.unread_alerts ?? 0} sub={`${stats?.critical_alerts ?? 0} critical`}
                    gradient="from-amber-500 to-orange-600" glow="rgba(245,158,11,0.25)"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} />
                <KpiCard label="Alerts Today" value={stats?.today_alerts ?? 0} sub="Past 24 hours"
                    gradient="from-violet-500 to-purple-600" glow="rgba(139,92,246,0.25)"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
                <KpiCard label="Appointments Today" value={stats?.appointments_today ?? 0} sub="Scheduled"
                    gradient="from-cyan-500 to-blue-600" glow="rgba(6,182,212,0.25)"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <KpiCard label="New Users Today" value={stats?.new_users_today ?? 0} sub="Registered today"
                    gradient="from-pink-500 to-rose-600" glow="rgba(236,72,153,0.25)"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>} />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickActions.map((a) => (
                        <Link key={a.to} to={a.to}
                            className="card p-4 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center gap-3">
                            <div className={`w-12 h-12 bg-gradient-to-br ${a.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                                style={{ boxShadow: `0 8px 20px ${a.glow}` }}>
                                {a.icon}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{a.label}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{a.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom 3-column row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Contact Requests */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-500" /> Contact Requests
                        </h3>
                        <Link to="/admin/audit-logs" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">View all →</Link>
                    </div>
                    {contactReqs.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm">No contact requests yet</div>
                    ) : (
                        <div className="space-y-1">{contactReqs.map(log => <ContactRow key={log._id} log={log} />)}</div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" /> Recent Activity
                        </h3>
                        <Link to="/admin/audit-logs" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">View all →</Link>
                    </div>
                    {recentLogs.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm">No recent activity</div>
                    ) : (
                        <div>{recentLogs.map(log => <ActivityRow key={log._id} log={log} />)}</div>
                    )}
                </div>

                {/* System Status */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> System Status
                        </h3>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-800">All Green</span>
                    </div>
                    <StatusItem label="API Server"         ok={true} note="Operational" />
                    <StatusItem label="MongoDB"            ok={true} note="Connected" />
                    <StatusItem label="JWT Auth"           ok={true} note="Active" />
                    <StatusItem label="WebSocket (Pusher)" ok={true} note="Live" />
                    <StatusItem label="File Storage"       ok={true} note="Available" />
                    <StatusItem label="Mail Service"       ok={true} note="Configured" />
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Breakdown</p>
                        <div className="space-y-2">
                            {[
                                { label: 'Total Alerts',         val: stats?.total_alerts ?? 0,   color: 'bg-amber-500' },
                                { label: 'Critical Alerts',      val: stats?.critical_alerts ?? 0,color: 'bg-red-500' },
                                { label: 'Doctors / Patients',   val: `${stats?.total_doctors ?? 0} / ${stats?.total_patients ?? 0}`, color: 'bg-indigo-500' },
                                { label: 'Admins',               val: stats?.total_admins ?? 0,   color: 'bg-violet-500' },
                            ].map(({ label, val, color }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${color}`} />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
