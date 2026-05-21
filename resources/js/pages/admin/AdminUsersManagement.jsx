import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { selectUser } from '../../redux/slices/authSlice';

const ROLES = [
    { value: 'admin',   label: 'Admin',   color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
    { value: 'doctor',  label: 'Doctor',  color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    { value: 'patient', label: 'Patient', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
];

const SPECIALIZATIONS = [
    'Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology',
    'Gynecology','Oncology','Psychiatry','Radiology','General Surgery',
    'Internal Medicine','Emergency Medicine','Other',
];

/* ── Small helpers ── */
function VerifiedBadge({ status }) {
    if (status === 'verified') return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
            Verified
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
            Pending
        </span>
    );
}

function FormField({ label, required, children, hint }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

export default function AdminUsersManagement() {
    const user = useSelector(selectUser);
    const [users, setUsers]   = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch]   = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Modals
    const [showAssignModal, setShowAssignModal]     = useState(false);
    const [showRoleModal, setShowRoleModal]         = useState(false);
    const [showCreateDoctorModal, setShowCreateDoctorModal] = useState(false);

    // Assign modal state
    const [selectedDoctor, setSelectedDoctor]   = useState('');
    const [selectedPatient, setSelectedPatient] = useState('');
    const [assigning, setAssigning] = useState(false);

    // Role modal state
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    // Create doctor form
    const EMPTY_FORM = { name:'', email:'', password:'', phone:'', medical_license:'', specialization:'', qualifications:'' };
    const [doctorForm, setDoctorForm] = useState(EMPTY_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [creatingDoctor, setCreatingDoctor] = useState(false);

    useEffect(() => { loadUsers(); }, [search, roleFilter]);
    useEffect(() => { loadDoctors(); }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (roleFilter) params.append('role', roleFilter);
            const res = await api.get(`/admin/users?${params}`);
            setUsers(res.data.data.data ?? []);
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    };

    const loadDoctors = async () => {
        try {
            const res = await api.get('/admin/doctors');
            setDoctors(res.data.data ?? []);
        } catch { /* silent */ }
    };

    const loadPatients = async () => {
        try {
            const res = await api.get('/patients?per_page=100');
            setPatients(res.data.data.data ?? []);
        } catch { toast.error('Failed to load patients'); }
    };

    const openAssignModal = () => {
        setShowAssignModal(true);
        loadPatients();
        loadDoctors();
    };

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;
        const userId = selectedUser.id ?? selectedUser._id;
        if (!userId) { toast.error('Cannot identify user — please refresh.'); return; }
        try {
            await api.put(`/admin/users/${userId}`, { role: newRole });
            toast.success(`${selectedUser.name} updated to ${newRole}`);
            setShowRoleModal(false);
            setSelectedUser(null);
            setNewRole('');
            loadUsers();
        } catch (err) { toast.error(err.response?.data?.message ?? 'Update failed'); }
    };

    const handleAssignDoctor = async () => {
        if (!selectedPatient || !selectedDoctor) return;
        setAssigning(true);
        try {
            await api.post('/admin/assign-doctor', { patient_id: selectedPatient, doctor_id: selectedDoctor });
            toast.success('Doctor assigned successfully!');
            setShowAssignModal(false);
            setSelectedDoctor('');
            setSelectedPatient('');
            loadUsers();
        } catch (err) { toast.error(err.response?.data?.message ?? 'Assignment failed'); }
        finally { setAssigning(false); }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success('User deleted');
            loadUsers();
        } catch { toast.error('Delete failed'); }
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        setCreatingDoctor(true);
        try {
            await api.post('/admin/create-doctor', doctorForm);
            toast.success('Doctor account created! Pending verification.');
            setShowCreateDoctorModal(false);
            setDoctorForm(EMPTY_FORM);
            loadDoctors();
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors).flat()[0] : null;
            toast.error(firstError ?? err.response?.data?.message ?? 'Creation failed');
        } finally { setCreatingDoctor(false); }
    };

    const df = (field, val) => setDoctorForm(f => ({ ...f, [field]: val }));

    const getRoleColor = (role) => ROLES.find(r => r.value === role)?.color || 'bg-slate-100';
    const getRoleLabel = (role) => ROLES.find(r => r.value === role)?.label || role;

    const selectedDoctorObj  = doctors.find(d => (d._id ?? d.id) === selectedDoctor);
    const selectedPatientObj = patients.find(p => (p._id ?? p.id) === selectedPatient);

    return (
        <div className="space-y-6 p-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="page-title">Users Management</h1>
                    <p className="page-subtitle">Manage system users, assign roles, and link doctors to patients.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={() => setShowCreateDoctorModal(true)}
                        className="btn btn-secondary flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        Create Doctor
                    </button>
                    <button onClick={openAssignModal}
                        className="btn btn-primary flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Assign Doctor
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-56 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Search users by name or email..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="input-base w-full pl-9" />
                </div>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-base">
                    <option value="">All Roles</option>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                {['Name','Email','Role','Phone','Status','Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                        Loading users...
                                    </div>
                                </td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">No users found</td></tr>
                            ) : users.map(u => (
                                <tr key={u._id ?? u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                                                {u.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white text-sm">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getRoleColor(u.role)}`}>
                                            {getRoleLabel(u.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{u.phone || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${u.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            <button onClick={() => { setSelectedUser(u); setNewRole(u.role); setShowRoleModal(true); }}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">
                                                Edit Role
                                            </button>
                                            <button onClick={() => handleDeleteUser(u.id ?? u._id)}
                                                className="text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 hover:underline">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Assign Doctor Modal ─────────────────────────────────────────────── */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Modal header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Assign Doctor to Patient</h2>
                                    <p className="text-indigo-200 text-sm">Link a doctor to manage a patient's care</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Patient select */}
                            <FormField label="Select Patient" required>
                                <select value={selectedPatient}
                                    onChange={e => setSelectedPatient(e.target.value)}
                                    className="input-base w-full">
                                    <option value="">— Choose patient —</option>
                                    {patients.filter(p => p.user?.name).map(p => (
                                        <option key={p._id ?? p.id} value={p._id ?? p.id}>
                                            {p.user.name} ({p.user.email})
                                        </option>
                                    ))}
                                </select>
                                {patients.length === 0 && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Loading patients…</p>
                                )}
                            </FormField>

                            {/* Doctor select */}
                            <FormField label="Select Doctor" required>
                                <select value={selectedDoctor}
                                    onChange={e => setSelectedDoctor(e.target.value)}
                                    className="input-base w-full">
                                    <option value="">— Choose doctor —</option>
                                    {doctors.map(d => (
                                        <option key={d._id ?? d.id} value={d._id ?? d.id}>
                                            Dr. {d.name}{d.specialization ? ` · ${d.specialization}` : ''}{d.verification_status !== 'verified' ? ' (Pending)' : ''}
                                        </option>
                                    ))}
                                </select>
                                {doctors.length === 0 && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">No active doctors found. Create a doctor first.</p>
                                )}
                            </FormField>

                            {/* Preview cards */}
                            {(selectedPatientObj || selectedDoctorObj) && (
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedPatientObj && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Patient</p>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{selectedPatientObj.user?.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{selectedPatientObj.user?.email}</p>
                                        </div>
                                    )}
                                    {selectedDoctorObj && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1.5">
                                                Doctor <VerifiedBadge status={selectedDoctorObj.verification_status} />
                                            </p>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">Dr. {selectedDoctorObj.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{selectedDoctorObj.specialization || selectedDoctorObj.email}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => { setShowAssignModal(false); setSelectedDoctor(''); setSelectedPatient(''); }}
                                className="flex-1 btn btn-secondary">Cancel</button>
                            <button onClick={handleAssignDoctor}
                                disabled={!selectedDoctor || !selectedPatient || assigning}
                                className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {assigning ? (
                                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Assigning…</>
                                ) : 'Assign Doctor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Role Change Modal ───────────────────────────────────────────────── */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
                            <h2 className="text-lg font-bold">Change User Role</h2>
                            <p className="text-blue-200 text-sm mt-0.5">{selectedUser.name}</p>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {ROLES.map(r => (
                                    <button key={r.value} onClick={() => setNewRole(r.value)}
                                        className={`p-3 rounded-xl border-2 text-center transition-all ${newRole === r.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                        <p className={`text-xs font-bold ${newRole === r.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300'}`}>{r.label}</p>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowRoleModal(false); setSelectedUser(null); setNewRole(''); }}
                                    className="flex-1 btn btn-secondary">Cancel</button>
                                <button onClick={handleUpdateRole}
                                    className="flex-1 btn btn-primary">Update Role</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create Doctor Modal ─────────────────────────────────────────────── */}
            {showCreateDoctorModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Create Doctor Account</h2>
                                    <p className="text-indigo-200 text-sm">New doctor will be added with pending verification</p>
                                </div>
                            </div>
                        </div>

                        {/* Form body */}
                        <form onSubmit={handleCreateDoctor} className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-5">
                                {/* Section: Account */}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-black">1</span>
                                        Account Credentials
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField label="Full Name" required>
                                            <input type="text" required value={doctorForm.name} onChange={e => df('name', e.target.value)}
                                                className="input-base w-full" placeholder="Dr. John Smith" />
                                        </FormField>
                                        <FormField label="Email Address" required>
                                            <input type="email" required value={doctorForm.email} onChange={e => df('email', e.target.value)}
                                                className="input-base w-full" placeholder="doctor@hospital.com" />
                                        </FormField>
                                        <FormField label="Password" required hint="Minimum 8 characters">
                                            <div className="relative">
                                                <input type={showPassword ? 'text' : 'password'} required value={doctorForm.password}
                                                    onChange={e => df('password', e.target.value)}
                                                    className="input-base w-full pr-10" placeholder="••••••••" />
                                                <button type="button" onClick={() => setShowPassword(v => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showPassword
                                                        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    }
                                                </button>
                                            </div>
                                        </FormField>
                                        <FormField label="Phone Number">
                                            <input type="tel" value={doctorForm.phone} onChange={e => df('phone', e.target.value)}
                                                className="input-base w-full" placeholder="+91 98765 43210" />
                                        </FormField>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100 dark:border-slate-800" />

                                {/* Section: Medical */}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] font-black">2</span>
                                        Medical Information
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField label="Medical License" required>
                                            <input type="text" required value={doctorForm.medical_license} onChange={e => df('medical_license', e.target.value)}
                                                className="input-base w-full" placeholder="MCI-123456" />
                                        </FormField>
                                        <FormField label="Specialization" required>
                                            <select required value={doctorForm.specialization} onChange={e => df('specialization', e.target.value)}
                                                className="input-base w-full">
                                                <option value="">Select specialization…</option>
                                                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </FormField>
                                        <div className="sm:col-span-2">
                                            <FormField label="Qualifications & Experience">
                                                <textarea value={doctorForm.qualifications} onChange={e => df('qualifications', e.target.value)}
                                                    className="input-base w-full resize-none" rows={2}
                                                    placeholder="MBBS, MD (Cardiology), 10 years experience…" />
                                            </FormField>
                                        </div>
                                    </div>
                                </div>

                                {/* Notice */}
                                <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800 rounded-2xl">
                                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pending Verification</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Doctor will be created with <strong>verification_status = pending</strong>. Go to <em>Verify Doctors</em> to approve credentials before they can access the system.</p>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex gap-3">
                            <button type="button" onClick={() => { setShowCreateDoctorModal(false); setDoctorForm(EMPTY_FORM); }}
                                disabled={creatingDoctor} className="flex-1 btn btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleCreateDoctor}
                                disabled={creatingDoctor}
                                className="flex-1 btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {creatingDoctor ? (
                                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Creating…</>
                                ) : (
                                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Create Doctor Account</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
