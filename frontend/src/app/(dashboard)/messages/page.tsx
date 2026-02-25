'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { messagesApi, sessionsApi } from '@/lib/api';

export default function MessagesPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadSessions();
        loadStats();
    }, []);

    useEffect(() => {
        if (selectedSession) loadMessages();
    }, [selectedSession, page]);

    const loadSessions = async () => {
        try {
            const res = await sessionsApi.list();
            setSessions(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedSession(res.data.data[0].id);
            }
        } catch { }
    };

    const loadStats = async () => {
        try {
            const res = await messagesApi.getStats();
            setStats(res.data.data);
        } catch { }
    };

    const loadMessages = async () => {
        try {
            const res = await messagesApi.listBySession(selectedSession, { page, limit: 20 });
            setMessages(res.data.data);
            setTotal(res.data.meta?.total || 0);
        } catch { toast.error('Failed to load messages'); }
    };

    return (
        <div className="fade-in">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1>Traffic Audit</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Detailed history of all inbound and outbound messaging traffic</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: '32px' }}>
                {['SENT', 'DELIVERED', 'FAILED', 'QUEUED'].map((status) => (
                    <div key={status} className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            fontSize: '40px',
                            opacity: '0.05',
                            userSelect: 'none'
                        }}>
                            {status === 'SENT' ? '📤' : status === 'DELIVERED' ? '✅' : status === 'FAILED' ? '❌' : '⏳'}
                        </div>
                        <div className="stat-label" style={{ fontWeight: 600, fontSize: '12px', letterSpacing: '0.05em' }}>{status}</div>
                        <div className="stat-value" style={{
                            fontSize: '32px',
                            fontFamily: 'Outfit',
                            marginTop: '8px',
                            color: status === 'FAILED' ? 'var(--danger)' :
                                status === 'QUEUED' ? 'var(--info)' : 'var(--success)'
                        }}>
                            {stats[status] || 0}
                        </div>
                    </div>
                ))}
            </div>

            {/* Session Filter */}
            <div className="glass-card" style={{ marginBottom: '32px', padding: '16px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '18px' }}>🔍</span>
                        <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap', fontWeight: 600 }}>Filter by Instance:</label>
                    </div>
                    <select
                        className="form-input"
                        value={selectedSession}
                        onChange={(e) => { setSelectedSession(e.target.value); setPage(1); }}
                        style={{ maxWidth: '320px', height: '44px', background: 'rgba(0,0,0,0.2)' }}
                    >
                        {sessions.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                        ))}
                    </select>
                    <button className="btn btn-outline btn-sm" onClick={loadMessages} style={{ height: '44px', padding: '0 20px' }}>
                        🔄 Refresh Data
                    </button>
                </div>
            </div>

            {/* Messages Table */}
            <div className="glass-card" style={{ padding: '0' }}>
                {messages.length === 0 ? (
                    <div style={{ padding: '100px 40px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.5 }}>📨</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Activity Found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Messages associated with this instance will appear here once traffic starts.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '24px' }}>Recipient</th>
                                        <th>Payload Preview</th>
                                        <th>Type</th>
                                        <th>Delivery Status</th>
                                        <th style={{ paddingRight: '24px' }}>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.map((msg) => (
                                        <tr key={msg.id}>
                                            <td style={{ paddingLeft: '24px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--accent)' }}>
                                                {msg.to}
                                            </td>
                                            <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                                                {msg.body}
                                            </td>
                                            <td><span className="badge badge-muted" style={{ borderRadius: '6px' }}>{msg.type}</span></td>
                                            <td>
                                                <span className={`badge ${msg.status === 'SENT' || msg.status === 'DELIVERED' || msg.status === 'READ' ? 'badge-success' :
                                                    msg.status === 'FAILED' ? 'badge-danger' :
                                                        msg.status === 'QUEUED' ? 'badge-info' : 'badge-warning'
                                                    }`} style={{ borderRadius: '8px' }}>
                                                    {msg.status}
                                                </span>
                                            </td>
                                            <td style={{ paddingRight: '24px', color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {total > 20 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '24px', borderTop: '1px solid var(--border)' }}>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px' }}
                                >
                                    ←
                                </button>
                                <div className="glass" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}>
                                    {page} <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span> {Math.ceil(total / 20)}
                                </div>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= Math.ceil(total / 20)}
                                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px' }}
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

