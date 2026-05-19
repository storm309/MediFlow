import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logoutUser } from '../../redux/slices/authSlice';
import { selectAlertStats } from '../../redux/slices/alertSlice';

/* ── SVG icon set ────────────────────────────────────── */
const Icons = {
    dashboard: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    alert: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    report: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    calendar: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    profile: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    logout: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
};

const roleColors = { admin: 'bg-slate-600', doctor: 'bg-blue-600', patient: 'bg-emerald-600' };
const roleLabels = { admin: 'Admin', doctor: 'Doctor', patient: 'Patient' };

const navItems = {
    admin: [
        { to: '/admin',        label: 'Dashboard',    icon: 'dashboard' },
        { to: '/profile',      label: 'Profile',      icon: 'profile' },
    ],
    doctor: [
        { to: '/doctor',       label: 'Dashboard',    icon: 'dashboard' },
        { to: '/alerts',       label: 'Alerts',       icon: 'alert',    badge: 'alerts' },
        { to: '/reports',      label: 'Reports',      icon: 'report' },
        { to: '/appointments', label: 'Appointments', icon: 'calendar' },
        { to: '/profile',      label: 'Profile',      icon: 'profile' },
    ],
    patient: [
        { to: '/patient',      label: 'Dashboard',    icon: 'dashboard' },
        { to: '/reports',      label: 'My Reports',   icon: 'report' },
        { to: '/appointments', label: 'Appointments', icon: 'calendar' },
        { to: '/profile',      label: 'Profile',      icon: 'profile' },
    ],
};

export default function Sidebar({ open }) {
    const user     = useSelector(selectUser);
    const stats    = useSelector(selectAlertStats);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const items    = navItems[user?.role] ?? [];
    const roleBadgeBg = roleColors[user?.role] ?? 'bg-blue-600';

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <aside className={`${
            open ? 'w-64' : 'w-0 overflow-hidden'
        } transition-all duration-300 shrink-0 flex flex-col`}
            style={{ background: 'var(--sidebar-bg)' }}
        >
            {/* Logo */}
            <div className="px-5 py-5 border-b border-slate-700/60 flex items-center gap-3">
                <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                    <svg className="w-5 h-5 text-white animate-heartbeat" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </div>
                <div className="min-w-0">
                    <p className="font-black text-white text-base leading-none tracking-tight">MediFlow</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-semibold mt-0.5 inline-block ${roleBadgeBg}`}>
                        {roleLabels[user?.role] ?? 'User'}
                    </span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-1">Navigation</p>
                {items.map((item) => {
                    const badgeCount = item.badge === 'alerts' ? (stats?.unread ?? 0) : 0;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={['/admin', '/doctor', '/patient'].includes(item.to)}
                            className={({ isActive }) =>
                                `sidebar-item ${isActive ? 'active' : ''}`
                            }
                        >
                            {Icons[item.icon]}
                            <span className="flex-1 text-sm">{item.label}</span>
                            {badgeCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1 badge-pulse">
                                    {badgeCount > 9 ? '9+' : badgeCount}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="p-3 border-t border-slate-700/60">
                <div className="flex items-center gap-3 px-2 py-2 mb-1">
                    <div className={`w-9 h-9 ${roleBadgeBg} rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md`}>
                        {user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="sidebar-item w-full text-left hover:bg-red-600/20 hover:text-red-400 mt-1"
                >
                    {Icons.logout}
                    <span className="text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
