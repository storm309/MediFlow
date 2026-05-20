import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { selectUser } from '../../redux/slices/authSlice';

const ROLES = [
    { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
    { value: 'doctor', label: 'Doctor', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    { value: 'patient', label: 'Patient', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
];

export default function AdminUsersManagement() {
    const user = useSelector(selectUser);
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [assigningDoctor, setAssigningDoctor] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [patients, setPatients] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showCreateDoctorModal, setShowCreateDoctorModal] = useState(false);
    const [doctorForm, setDoctorForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        medical_license: '',
        specialization: '',
        qualifications: '',
    });
    const [creatingDoctor, setCreatingDoctor] = useState(false);

    useEffect(() => {
        loadUsers();
        loadDoctors();
    }, [search, roleFilter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (roleFilter) params.append('role', roleFilter);
            const res = await api.get(`/admin/users?${params}`);
            setUsers(res.data.data.data ?? []);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const loadDoctors = async () => {
        try {
            const res = await api.get('/admin/doctors');
            setDoctors(res.data.data ?? []);
        } catch (err) {
            console.log('Failed to load doctors');
        }
    };

    const loadPatients = async () => {
        try {
            const res = await api.get('/patients?per_page=100');
            setPatients(res.data.data.data ?? []);
        } catch (err) {
            toast.error('Failed to load patients');
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;
        // MongoDB models may serialize primary key as `id` or `_id`
        const userId = selectedUser.id ?? selectedUser._id;
        if (!userId) { toast.error('Cannot identify user — please refresh.'); return; }
        try {
            await api.put(`/admin/users/${userId}`, { role: newRole });
            toast.success(`${selectedUser.name} role updated to ${newRole}`);
            setShowRoleModal(false);
            setSelectedUser(null);
            setNewRole('');
            loadUsers();
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Update failed');
        }
    };

    const handleAssignDoctor = async () => {
        if (!selectedPatient || !selectedDoctor) return;
        try {
            await api.post('/admin/assign-doctor', {
                patient_id: selectedPatient._id,
                doctor_id: selectedDoctor._id,
            });
            toast.success(`Doctor assigned to patient successfully!`);
            setShowAssignModal(false);
            setSelectedDoctor(null);
            setSelectedPatient(null);
            loadUsers();
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Assignment failed');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success('User deleted');
            loadUsers();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        if (!doctorForm.medical_license || !doctorForm.specialization || !doctorForm.name || !doctorForm.email || !doctorForm.password) {
            toast.error('Please fill all required fields');
            return;
        }
        setCreatingDoctor(true);
        try {
            const res = await api.post('/admin/create-doctor', doctorForm);
            toast.success('Doctor account created successfully! (Verification pending)');
            setShowCreateDoctorModal(false);
            setDoctorForm({
                name: '',
                email: '',
                password: '',
                phone: '',
                medical_license: '',
                specialization: '',
                qualifications: '',
            });
            loadDoctors();
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors).flat()[0] : null;
            toast.error(firstError ?? err.response?.data?.message ?? 'Creation failed');
        } finally {
            setCreatingDoctor(false);
        }
    };

    const getRoleColor = (role) => ROLES.find(r => r.value === role)?.color || 'bg-slate-100';
    const getRoleLabel = (role) => ROLES.find(r => r.value === role)?.label || role;

    return (
        <div className="space-y-6 p-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title">Users Management</h1>
                    <p className="page-subtitle">Manage system users, assign roles, and link doctors to patients.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCreateDoctorModal(true)}
                        className="btn btn-secondary"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Create Doctor
                    </button>
                    <button
                        onClick={() => {
                            setShowAssignModal(true);
                            loadPatients();
                        }}
                        className="btn btn-primary"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Assign Doctor to Patient
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-xs">
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-base w-full"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input-base"
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No users found</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getRoleColor(u.role)}`}>
                                                {getRoleLabel(u.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{u.phone || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                                                {u.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setNewRole(u.role);
                                                        setShowRoleModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Edit Role
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id ?? u._id)}
                                                    className="text-red-600 hover:text-red-700 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Doctor Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Assign Doctor to Patient</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Select Patient</label>
                                <select
                                    value={selectedPatient?._id ?? ''}
                                    onChange={(e) => setSelectedPatient(patients.find(p => p._id === e.target.value))}
                                    className="input-base w-full"
                                >
                                    <option value="">Choose patient...</option>
                                    {patients.filter(p => p.user?.name).map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.user.name} ({p.user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Select Doctor</label>
                                <select
                                    value={selectedDoctor?._id ?? ''}
                                    onChange={(e) => setSelectedDoctor(doctors.find(d => d._id === e.target.value))}
                                    className="input-base w-full"
                                >
                                    <option value="">Choose doctor...</option>
                                    {doctors.map(d => (
                                        <option key={d._id} value={d._id}>
                                            Dr. {d.name} ({d.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setSelectedDoctor(null);
                                    setSelectedPatient(null);
                                }}
                                className="flex-1 btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignDoctor}
                                disabled={!selectedDoctor || !selectedPatient}
                                className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Change Role</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">User: <strong>{selectedUser.name}</strong></p>

                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="input-base w-full mb-6"
                        >
                            {ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRoleModal(false);
                                    setSelectedUser(null);
                                    setNewRole('');
                                }}
                                className="flex-1 btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateRole}
                                className="flex-1 btn btn-primary"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Doctor Modal */}
            {showCreateDoctorModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create Doctor Account</h2>

                        <form onSubmit={handleCreateDoctor} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={doctorForm.name}
                                        onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})}
                                        className="input-base w-full"
                                        placeholder="Dr. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={doctorForm.email}
                                        onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                                        className="input-base w-full"
                                        placeholder="doctor@hospital.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={doctorForm.password}
                                        onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})}
                                        className="input-base w-full"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={doctorForm.phone}
                                        onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})}
                                        className="input-base w-full"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Medical License *</label>
                                    <input
                                        type="text"
                                        required
                                        value={doctorForm.medical_license}
                                        onChange={(e) => setDoctorForm({...doctorForm, medical_license: e.target.value})}
                                        className="input-base w-full"
                                        placeholder="LICENSE123456"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Specialization *</label>
                                    <input
                                        type="text"
                                        required
                                        value={doctorForm.specialization}
                                        onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                                        className="input-base w-full"
                                        placeholder="Cardiology"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Qualifications</label>
                                <textarea
                                    value={doctorForm.qualifications}
                                    onChange={(e) => setDoctorForm({...doctorForm, qualifications: e.target.value})}
                                    className="input-base w-full resize-none"
                                    placeholder="MD, Board Certified in Cardiology..."
                                    rows={2}
                                />
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                                <p className="text-sm text-blue-900 dark:text-blue-200">
                                    <strong>Status:</strong> Doctor will be created with <code className="text-xs bg-blue-200 dark:bg-blue-800 px-1 rounded">verification_status = pending</code>
                                </p>
                                <p className="text-sm text-blue-900 dark:text-blue-200 mt-1">
                                    Admin must verify credentials before doctor can access the system.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateDoctorModal(false)}
                                    className="flex-1 btn btn-secondary"
                                    disabled={creatingDoctor}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn btn-primary"
                                    disabled={creatingDoctor}
                                >
                                    {creatingDoctor ? 'Creating...' : 'Create Doctor Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
