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
        <div className="fade-in">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1>System Overview</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
                        Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.name || user?.email?.split('@')[0]}</span> 👋
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="glass-card stat-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Session</div>
                        <div style={{ fontSize: '20px' }}>🔋</div>
                    </div>
                    <div className="stat-value">{stats.activeSessions || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '8px', fontWeight: 600 }}>● Live monitoring active</div>
                </div>
                <div className="glass-card stat-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Channels</div>
                        <div style={{ fontSize: '20px' }}>📈</div>
                    </div>
                    <div className="stat-value">{stats.totalSessions || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>Provisioned accounts</div>
                </div>
                <div className="glass-card stat-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lifetime Traffic</div>
                        <div style={{ fontSize: '20px' }}>🚀</div>
                    </div>
                    <div className="stat-value">{totalMessages.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: 'var(--info)', marginTop: '8px', fontWeight: 600 }}>Processed events</div>
                </div>
                <div className="glass-card stat-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>API Integrations</div>
                        <div style={{ fontSize: '20px' }}>⚡</div>
                    </div>
                    <div className="stat-value">{stats.apiKeys || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>Authorized keys</div>
                </div>
            </div>

            {/* Message Status Breakdown */}
            <div className="glass-card" style={{ marginBottom: '32px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontFamily: 'Outfit' }}>Processing Status</h2>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>Real-time stats</div>
                </div>
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                    {['SENT', 'DELIVERED', 'READ', 'QUEUED', 'PROCESSING', 'FAILED'].map((status) => (
                        <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: status === 'SENT' || status === 'DELIVERED' || status === 'READ' ? 'var(--success)' :
                                        status === 'FAILED' ? 'var(--danger)' :
                                            status === 'QUEUED' ? 'var(--info)' : 'var(--warning)',
                                    boxShadow: `0 0 10px ${status === 'SENT' || status === 'DELIVERED' || status === 'READ' ? 'var(--success)' :
                                        status === 'FAILED' ? 'var(--danger)' :
                                            status === 'QUEUED' ? 'var(--info)' : 'var(--warning)'}`
                                }}></span>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{status}</span>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '28px', fontFamily: 'Outfit', paddingLeft: '16px' }}>{msgStats[status] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Sessions */}
            <div className="glass-card" style={{ padding: '0' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '18px', fontFamily: 'Outfit' }}>Recent Network Activity</h2>
                </div>
                {sessions.length === 0 ? (
                    <div className="empty-state" style={{ padding: '60px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
                        <h3 style={{ color: 'var(--text-secondary)' }}>Awaiting Connections</h3>
                        <p style={{ fontSize: '14px' }}>Connect a WhatsApp device to see activity logs.</p>
                    </div>
                ) : (
                    <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '32px' }}>Channel Name</th>
                                    <th>Linked Phone</th>
                                    <th>Status</th>
                                    <th>Traffic</th>
                                    <th style={{ paddingRight: '32px' }}>Auto Reconnect</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.slice(0, 5).map((session: any) => (
                                    <tr key={session.id}>
                                        <td style={{ paddingLeft: '32px' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{session.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {session.id.slice(0, 8)}...</div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{session.phone || '—'}</td>
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
                                        <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{session._count?.messages || 0}</td>
                                        <td style={{ paddingRight: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                            {session.lastActive ? new Date(session.lastActive).toLocaleTimeString() : 'Never'}
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
