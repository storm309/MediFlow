import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector }             from 'react-redux';
import { selectUser, selectInitialized } from './redux/slices/authSlice';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout      from './layouts/AuthLayout';

// Auth Pages
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import SocialCallbackPage from './pages/auth/SocialCallbackPage';

// Dashboard Pages
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminUsersManagement from './pages/admin/AdminUsersManagement';
import DoctorVerificationPage from './pages/admin/DoctorVerificationPage';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import DoctorDashboard  from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientDetail    from './pages/doctor/PatientDetail';
import AlertsPage       from './pages/shared/AlertsPage';
import ReportsPage      from './pages/shared/ReportsPage';
import AppointmentsPage from './pages/shared/AppointmentsPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage      from './pages/shared/ProfilePage';
import NotFoundPage     from './pages/NotFoundPage';
import LandingPage      from './pages/LandingPage';

function PrivateRoute({ children, roles }) {
    const user        = useSelector(selectUser);
    const initialized = useSelector(selectInitialized);

    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Loading MediFlow…</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
    return children;
}

export default function App() {
    const user = useSelector(selectUser);

    return (
        <ErrorBoundary>
            <Routes>
            {/* Public */}
            <Route path="/"                element={<LandingPage />} />
            <Route element={<AuthLayout />}>
                <Route path="/login"           element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage />} />
                <Route path="/register"        element={user ? <Navigate to={`/${user.role}`} replace /> : <RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* OAuth callback — outside AuthLayout, no redirect guard */}
            <Route path="/auth/social" element={<SocialCallbackPage />} />

            {/* Protected */}
            <Route element={<DashboardLayout />}>
                {/* Admin */}
                <Route path="/admin" element={
                    <PrivateRoute roles={['admin']}>
                        <AdminDashboard />
                    </PrivateRoute>
                } />
                <Route path="/admin/users" element={
                    <PrivateRoute roles={['admin']}>
                        <AdminUsersManagement />
                    </PrivateRoute>
                } />
                <Route path="/admin/doctors/verify" element={
                    <PrivateRoute roles={['admin']}>
                        <DoctorVerificationPage />
                    </PrivateRoute>
                } />
                <Route path="/admin/audit-logs" element={
                    <PrivateRoute roles={['admin']}>
                        <AdminAuditLogs />
                    </PrivateRoute>
                } />

                {/* Doctor */}
                <Route path="/doctor" element={
                    <PrivateRoute roles={['doctor']}>
                        <DoctorDashboard />
                    </PrivateRoute>
                } />
                <Route path="/doctor/patients/:id" element={
                    <PrivateRoute roles={['doctor', 'admin']}>
                        <PatientDetail />
                    </PrivateRoute>
                } />

                {/* Patient */}
                <Route path="/patient" element={
                    <PrivateRoute roles={['patient']}>
                        <PatientDashboard />
                    </PrivateRoute>
                } />

                {/* Shared */}
                <Route path="/alerts" element={
                    <PrivateRoute>
                        <AlertsPage />
                    </PrivateRoute>
                } />
                <Route path="/notifications" element={
                    <PrivateRoute>
                        <NotificationsPage />
                    </PrivateRoute>
                } />
                <Route path="/reports" element={
                    <PrivateRoute>
                        <ReportsPage />
                    </PrivateRoute>
                } />
                <Route path="/appointments" element={
                    <PrivateRoute>
                        <AppointmentsPage />
                    </PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute>
                        <ProfilePage />
                    </PrivateRoute>
                } />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </ErrorBoundary>
    );
}
