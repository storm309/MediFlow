import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectUser } from '../../redux/slices/authSlice';
import { toggleDarkMode, selectDarkMode } from '../../redux/slices/uiSlice';
import { selectUnreadCount } from '../../redux/slices/notificationSlice';
import { selectLiveAlerts } from '../../redux/slices/alertSlice';
import toast from 'react-hot-toast';

const roleColors = { admin: 'from-slate-600 to-slate-800', doctor: 'from-blue-600 to-cyan-600', patient: 'from-emerald-600 to-teal-600' };

export default function Topbar({ onToggleSidebar }) {
    const user        = useSelector(selectUser);
    const darkMode    = useSelector(selectDarkMode);
    const dispatch    = useDispatch();
    const unreadCount = useSelector(selectUnreadCount);
    const liveAlerts  = useSelector(selectLiveAlerts);

    React.useEffect(() => {
        if (liveAlerts.length > 0) {
            const a = liveAlerts[0];
            const fn = a.severity === 'emergency' || a.severity === 'critical' ? toast.error : toast;
            fn(`⚠️ ${a.message}`, { duration: 6000 });
        }
    }, [liveAlerts]);

    const avatarGradient = roleColors[user?.role] ?? 'from-blue-600 to-cyan-600';

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-3 flex-shrink-0 shadow-sm">
            {/* Hamburger */}
            <button
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle sidebar"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Brand */}
            <Link to="/" className="hidden md:flex items-center gap-2 ml-1">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </div>
                <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">MediFlow</span>
            </Link>

            <div className="flex-1" />

            {/* Dark mode toggle */}
            <button
                onClick={() => dispatch(toggleDarkMode())}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle dark mode"
            >
                {darkMode ? (
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )}
            </button>

            {/* Notifications bell */}
            <Link
                to="/profile"
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 badge-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Link>

            {/* Avatar */}
            <Link to="/profile" className="flex items-center gap-2.5 ml-1 pl-3 border-l border-slate-100 dark:border-slate-800">
                <div className={`w-9 h-9 bg-gradient-to-br ${avatarGradient} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="hidden md:block">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{user?.name?.split(' ')[0]}</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                </div>
            </Link>
        </header>
    );
}
