'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { sessionsApi, messagesApi, apiKeysApi } from '@/lib/api';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>({});
    const [sessions, setSessions] = useState<any[]>([]);
    const [msgStats, setMsgStats] = useState<Record<string, number>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sessRes, msgRes, keyRes] = await Promise.all([
                sessionsApi.list(),
                messagesApi.getStats(),
                apiKeysApi.list(),
            ]);
            setSessions(sessRes.data.data);
            setMsgStats(msgRes.data.data);
            setStats({
                totalSessions: sessRes.data.data.length,
                activeSessions: sessRes.data.data.filter((s: any) => s.status === 'CONNECTED').length,
                apiKeys: keyRes.data.data.length,
            });
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        }
    };

    const totalMessages = Object.values(msgStats).reduce((a: number, b: any) => a + (b || 0), 0);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back, {user?.name || user?.email?.split('@')[0]} 👋</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid-4">
                <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-label">Active Sessions</div>
                    <div className="stat-value">{stats.activeSessions || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-label">Total Sessions</div>
                    <div className="stat-value">{stats.totalSessions || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📨</div>
                    <div className="stat-label">Total Messages</div>
                    <div className="stat-value">{totalMessages}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔑</div>
                    <div className="stat-label">API Keys</div>
                    <div className="stat-value">{stats.apiKeys || 0}</div>
                </div>
            </div>

            {/* Message Status Breakdown */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <h2>Message Status Overview</h2>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {['SENT', 'DELIVERED', 'READ', 'QUEUED', 'PROCESSING', 'FAILED'].map((status) => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`badge ${status === 'SENT' || status === 'DELIVERED' || status === 'READ' ? 'badge-success' :
                                    status === 'FAILED' ? 'badge-danger' :
                                        status === 'QUEUED' ? 'badge-info' : 'badge-warning'
                                }`}>
                                {status}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '18px' }}>{msgStats[status] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Sessions */}
            <div className="card">
                <div className="card-header">
                    <h2>Recent Sessions</h2>
                </div>
                {sessions.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">💬</div>
                        <h3>No sessions yet</h3>
                        <p>Create your first WhatsApp session to get started.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Messages</th>
                                    <th>Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.slice(0, 5).map((session: any) => (
                                    <tr key={session.id}>
                                        <td style={{ fontWeight: 600 }}>{session.name}</td>
                                        <td>{session.phone || '—'}</td>
                                        <td>
                                            <span className={`badge ${session.status === 'CONNECTED' ? 'badge-success' :
                                                    session.status === 'QR_READY' ? 'badge-info' :
                                                        session.status === 'FAILED' ? 'badge-danger' :
                                                            session.status === 'DISCONNECTED' ? 'badge-warning' :
                                                                'badge-muted'
                                                }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td>{session._count?.messages || 0}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                            {session.lastActive ? new Date(session.lastActive).toLocaleString() : '—'}
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
