import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectNotifications, fetchNotifications, markNotificationRead, markAllRead } from '../../redux/slices/notificationSlice';
import toast from 'react-hot-toast';

// Priority-based color system — overrides type colors for emergency/warning
const priorityConfig = {
    emergency: {
        border:  'border-l-red-600',
        bg:      'bg-red-50 dark:bg-red-900/20',
        badge:   'bg-red-600 text-white',
        label:   '🚨 EMERGENCY',
        ring:    'ring-2 ring-red-400 dark:ring-red-500/50',
    },
    warning: {
        border:  'border-l-amber-500',
        bg:      'bg-amber-50 dark:bg-amber-900/20',
        badge:   'bg-amber-500 text-white',
        label:   '⚠️ Warning',
        ring:    '',
    },
    info: {
        border:  'border-l-blue-500',
        bg:      'bg-blue-50 dark:bg-blue-900/10',
        badge:   null,
        label:   null,
        ring:    '',
    },
};

// Fallback type-based colors (used when no priority set)
const typeColors = {
    alert:       'border-l-red-500 bg-red-50 dark:bg-red-900/10',
    report:      'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
    appointment: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/10',
    system:      'border-l-slate-500 bg-slate-50 dark:bg-slate-900/10',
    info:        'border-l-cyan-500 bg-cyan-50 dark:bg-cyan-900/10',
};

const typeIcons = {
    alert:       '⚠️',
    report:      '📄',
    appointment: '📅',
    system:      '⚙️',
    info:        'ℹ️',
};

export default function NotificationsPage() {
    const dispatch = useDispatch();
    const notifications = useSelector(selectNotifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const handleMarkRead = (id) => {
        dispatch(markNotificationRead(id)).then(() => {
            toast.success('Marked as read');
        }).catch(() => {
            toast.error('Failed to mark as read');
        });
    };

    const handleMarkAllRead = () => {
        dispatch(markAllRead()).then(() => {
            toast.success('All marked as read');
        }).catch(() => {
            toast.error('Failed to mark all as read');
        });
    };

    if (notifications.length === 0) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <h1 className="page-title mb-6">Notifications</h1>
                <div className="card p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No notifications yet</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">You're all caught up!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="page-title">Notifications</h1>
                <button
                    onClick={handleMarkAllRead}
                    className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                    Mark All Read
                </button>
            </div>

            <div className="space-y-3">
                {notifications.map((notification) => {
                    const priority = notification.priority;
                    const pConfig  = priorityConfig[priority];

                    // Use priority-based styling when priority is set, else fall back to type
                    const borderBg = pConfig
                        ? `${pConfig.border} ${pConfig.bg}`
                        : (typeColors[notification.type] || typeColors.info);
                    const ringClass = pConfig?.ring || (!notification.is_read ? 'ring-2 ring-blue-300 dark:ring-blue-500/30' : '');
                    const icon = typeIcons[notification.type] || '📌';

                    return (
                        <div
                            key={notification._id}
                            className={`card border-l-4 p-4 cursor-pointer hover:shadow-md transition-all ${borderBg} ${ringClass}`}
                            onClick={() => {
                                if (!notification.is_read) handleMarkRead(notification._id);
                                if (notification.action_url) window.location.href = notification.action_url;
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <span className="text-2xl flex-shrink-0">{icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                            {notification.title}
                                        </h3>
                                        {/* Priority badge */}
                                        {pConfig?.badge && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${pConfig.badge}`}>
                                                {pConfig.label}
                                            </span>
                                        )}
                                        {!notification.is_read && (
                                            <span className="inline-flex w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMarkRead(notification._id); }}
                                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0"
                                    >
                                        Mark Read
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

