import React, { useEffect } from 'react';
import { Outlet, useNavigate }  from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectInitialized } from '../redux/slices/authSlice';
import { selectSidebarOpen, toggleSidebar } from '../redux/slices/uiSlice';
import Sidebar from '../components/layout/Sidebar';
import Topbar  from '../components/layout/Topbar';
import AiChatWidget from '../components/ui/AiChatWidget';
import { useAlertsChannel } from '../hooks/useRealtimeChannels';
import { fetchAlertStats }  from '../redux/slices/alertSlice';
import { fetchNotifications } from '../redux/slices/notificationSlice';

export default function DashboardLayout() {
    const navigate    = useNavigate();
    const dispatch    = useDispatch();
    const user        = useSelector(selectUser);
    const initialized = useSelector(selectInitialized);
    const sidebarOpen = useSelector(selectSidebarOpen);

    // Subscribe to global alerts channel
    useAlertsChannel();

    useEffect(() => {
        if (initialized && !user) navigate('/login', { replace: true });
    }, [initialized, user, navigate]);

    useEffect(() => {
        if (user) {
            dispatch(fetchAlertStats());
            dispatch(fetchNotifications());
        }
    }, [user, dispatch]);

    if (!user) return null;

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--page-bg)' }}>
            <Sidebar open={sidebarOpen} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar onToggleSidebar={() => dispatch(toggleSidebar())} />
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
            {/* AI Chat Widget — only for doctor & patient */}
            {(user?.role === 'doctor' || user?.role === 'patient') && <AiChatWidget />}
        </div>
    );
}
