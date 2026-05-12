import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link }                      from 'react-router-dom';
import api                           from '../../services/api';
import { fetchAlertStats, selectAlertStats } from '../../redux/slices/alertSlice';
import MetricCard from '../../components/ui/MetricCard';
import { selectUser } from '../../redux/slices/authSlice';

export default function AdminDashboard() {
    const dispatch   = useDispatch();
    const stats      = useSelector(selectAlertStats);
    const user       = useSelector(selectUser);
    const [adminStats, setAdminStats] = React.useState(null);

    useEffect(() => {
        dispatch(fetchAlertStats());
        api.get('/admin/dashboard').then(r => setAdminStats(r.data.data)).catch(() => {});
    }, [dispatch]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">System-wide overview for {user?.name}.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Users"    value={adminStats?.total_users}    icon="👥" color="blue"   />
                <MetricCard title="Total Doctors"  value={adminStats?.total_doctors}  icon="🩺" color="green"  />
                <MetricCard title="Total Patients" value={adminStats?.total_patients} icon="🏥" color="cyan"   />
                <MetricCard title="Active Alerts"  value={stats?.total ?? 0}          icon="⚠️" color="red"    />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/alerts" className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                    <div className="text-2xl mb-2">⚠️</div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">Manage Alerts</p>
                    <p className="text-xs text-slate-500 mt-1">Review and resolve patient alerts</p>
                </Link>
                <Link to="/reports" className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                    <div className="text-2xl mb-2">📋</div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">Reports</p>
                    <p className="text-xs text-slate-500 mt-1">Generate and download PDF reports</p>
                </Link>
                <Link to="/appointments" className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                    <div className="text-2xl mb-2">📅</div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">Appointments</p>
                    <p className="text-xs text-slate-500 mt-1">View and manage all appointments</p>
                </Link>
            </div>
        </div>
    );
}
