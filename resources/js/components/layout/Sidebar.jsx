import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { logoutUser } from '../../redux/slices/authSlice';
import { selectAlertStats } from '../../redux/slices/alertSlice';
import { selectUnreadCount } from '../../redux/slices/notificationSlice';

const navItems = {
    admin: [
        { to: '/admin',        label: 'Dashboard',     icon: '⊞' },
        { to: '/alerts',       label: 'Alerts',        icon: '⚠️', badge: 'alerts' },
        { to: '/reports',      label: 'Reports',       icon: '📋' },
        { to: '/appointments', label: 'Appointments',  icon: '📅' },
        { to: '/profile',      label: 'Profile',       icon: '👤' },
    ],
    doctor: [
        { to: '/doctor',       label: 'Dashboard',     icon: '⊞' },
        { to: '/alerts',       label: 'Alerts',        icon: '⚠️', badge: 'alerts' },
        { to: '/reports',      label: 'Reports',       icon: '📋' },
        { to: '/appointments', label: 'Appointments',  icon: '📅' },
        { to: '/profile',      label: 'Profile',       icon: '👤' },
    ],
    patient: [
        { to: '/patient',      label: 'Dashboard',     icon: '⊞' },
        { to: '/reports',      label: 'My Reports',    icon: '📋' },
        { to: '/appointments', label: 'Appointments',  icon: '📅' },
        { to: '/profile',      label: 'Profile',       icon: '👤' },
    ],
};

export default function Sidebar({ open }) {
    const user       = useSelector(selectUser);
    const stats      = useSelector(selectAlertStats);
    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const items      = navItems[user?.role] ?? [];

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <aside className={`${open ? 'w-64' : 'w-0 overflow-hidden'} transition-all duration-300 flex-shrink-0 bg-slate-900 dark:bg-slate-950 text-white flex flex-col`}>
            {/* Logo */}
            <div className="p-5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">❤</div>
                    <div>
                        <p className="font-bold text-sm leading-none">MediFlow</p>
                        <p className="text-xs text-slate-400 capitalize">{user?.role} Portal</p>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {items.map((item) => {
                    const badgeCount = item.badge === 'alerts' ? (stats?.unread ?? 0) : 0;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/admin' || item.to === '/doctor' || item.to === '/patient'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {badgeCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center badge-pulse">
                                    {badgeCount > 9 ? '9+' : badgeCount}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
}
