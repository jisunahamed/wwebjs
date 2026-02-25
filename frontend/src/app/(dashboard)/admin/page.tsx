'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>({});
    const [users, setUsers] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.push('/dashboard');
            return;
        }
        if (isAdmin) {
            loadStats();
            loadUsers();
        }
    }, [isAdmin, isLoading]);

    useEffect(() => {
        if (isAdmin) loadUsers();
    }, [filter]);

    const loadStats = async () => {
        try {
            const res = await adminApi.getStats();
            setStats(res.data.data);
        } catch { }
    };

    const loadUsers = async () => {
        try {
            const params: any = {};
            if (filter !== 'all') params.status = filter;
            if (search) params.search = search;
            const res = await adminApi.listUsers(params);
            setUsers(res.data.data);
        } catch { toast.error('Failed to load users'); }
    };

    const approveUser = async (id: string) => {
        try {
            await adminApi.approveUser(id);
            toast.success('User approved! ✅');
            loadStats();
            loadUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to approve');
        }
    };

    const rejectUser = async (id: string) => {
        if (!confirm('Reject and remove this user? This cannot be undone.')) return;
        try {
            await adminApi.rejectUser(id);
            toast.success('User rejected');
            loadStats();
            loadUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to reject');
        }
    };

    const toggleActive = async (id: string) => {
        try {
            await adminApi.toggleUserActive(id);
            toast.success('User status updated');
            loadUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to toggle');
        }
    };

    const updatePlan = async (id: string, plan: string) => {
        try {
            await adminApi.updateUserPlan(id, { plan });
            toast.success('Plan updated');
            loadUsers();
        } catch { toast.error('Failed to update plan'); }
    };

    if (isLoading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>;
    if (!isAdmin) return null;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>👑 Admin Panel</h1>
                    <p>Manage users, approvals, and plans</p>
                </div>
                <button className="btn btn-outline" onClick={() => { loadStats(); loadUsers(); }}>
                    🔄 Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid-4">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{stats.totalUsers || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>⏳</div>
                    <div className="stat-label">Pending Approval</div>
                    <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pendingUsers || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>✅</div>
                    <div className="stat-label">Approved Users</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.approvedUsers || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-label">Active Sessions</div>
                    <div className="stat-value">{stats.activeSessions || 0}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                        { key: 'all', label: 'All Users' },
                        { key: 'pending', label: '⏳ Pending' },
                        { key: 'approved', label: '✅ Approved' },
                        { key: 'inactive', label: '🚫 Inactive' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                    <div style={{ flex: 1 }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                        style={{ maxWidth: '280px' }}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                {users.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">👥</div>
                        <h3>No users found</h3>
                        <p>No users match the current filter.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Plan</th>
                                    <th>Sessions</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{u.name || '—'}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-info'}`}>
                                                {u.role === 'ADMIN' ? '👑 ADMIN' : 'USER'}
                                            </span>
                                        </td>
                                        <td>
                                            {!u.isApproved ? (
                                                <span className="badge badge-warning">⏳ PENDING</span>
                                            ) : !u.isActive ? (
                                                <span className="badge badge-danger">🚫 INACTIVE</span>
                                            ) : (
                                                <span className="badge badge-success">✅ ACTIVE</span>
                                            )}
                                        </td>
                                        <td>
                                            {u.role !== 'ADMIN' ? (
                                                <select
                                                    className="form-input"
                                                    value={u.plan}
                                                    onChange={(e) => updatePlan(u.id, e.target.value)}
                                                    style={{ padding: '4px 8px', fontSize: '12px', maxWidth: '120px' }}
                                                >
                                                    <option value="FREE">Free</option>
                                                    <option value="STARTER">Starter</option>
                                                    <option value="PRO">Pro</option>
                                                    <option value="ENTERPRISE">Enterprise</option>
                                                </select>
                                            ) : (
                                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.plan}</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{u._count?.sessions || 0}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            {u.role !== 'ADMIN' && (
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {!u.isApproved && (
                                                        <>
                                                            <button className="btn btn-primary btn-sm" onClick={() => approveUser(u.id)}>
                                                                ✅ Approve
                                                            </button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => rejectUser(u.id)}>
                                                                ✕ Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {u.isApproved && (
                                                        <button
                                                            className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-primary'}`}
                                                            onClick={() => toggleActive(u.id)}
                                                            style={u.isActive ? { color: 'var(--danger)' } : {}}
                                                        >
                                                            {u.isActive ? '🚫 Deactivate' : '✅ Activate'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
