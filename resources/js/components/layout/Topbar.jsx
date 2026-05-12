import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link }                      from 'react-router-dom';
import { selectUser }                from '../../redux/slices/authSlice';
import { toggleDarkMode, selectDarkMode } from '../../redux/slices/uiSlice';
import { selectUnreadCount }         from '../../redux/slices/notificationSlice';
import { selectLiveAlerts }          from '../../redux/slices/alertSlice';
import toast                         from 'react-hot-toast';

export default function Topbar({ onToggleSidebar }) {
    const user        = useSelector(selectUser);
    const darkMode    = useSelector(selectDarkMode);
    const dispatch    = useDispatch();
    const unreadCount = useSelector(selectUnreadCount);
    const liveAlerts  = useSelector(selectLiveAlerts);

    // Show toast for the latest live alert
    React.useEffect(() => {
        if (liveAlerts.length > 0) {
            const a = liveAlerts[0];
            const fn = a.severity === 'emergency' || a.severity === 'critical' ? toast.error : toast;
            fn(`⚠️ ${a.message}`, { duration: 6000 });
        }
    }, [liveAlerts]);

    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-4 flex-shrink-0">
            {/* Hamburger */}
            <button
                onClick={onToggleSidebar}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Brand */}
            <Link to="/" className="font-bold text-blue-600 text-lg hidden md:block">MediFlow</Link>

            <div className="flex-1" />

            {/* Dark mode toggle */}
            <button
                onClick={() => dispatch(toggleDarkMode())}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Toggle dark mode"
            >
                {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            <Link
                to="/profile"
                className="relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Link>

            {/* Avatar */}
            <Link to="/profile" className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">
                    {user?.name}
                </span>
            </Link>
        </header>
    );
}
