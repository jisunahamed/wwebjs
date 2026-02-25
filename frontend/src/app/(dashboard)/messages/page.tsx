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
        <div>
            <div className="page-header">
                <div>
                    <h1>Messages</h1>
                    <p>View message history and delivery status</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: '24px' }}>
                {['SENT', 'DELIVERED', 'FAILED', 'QUEUED'].map((status) => (
                    <div key={status} className="stat-card">
                        <div className="stat-label">{status}</div>
                        <div className="stat-value" style={{
                            color: status === 'FAILED' ? 'var(--danger)' :
                                status === 'QUEUED' ? 'var(--info)' : 'var(--success)'
                        }}>
                            {stats[status] || 0}
                        </div>
                    </div>
                ))}
            </div>

            {/* Session Filter */}
            <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Session:</label>
                    <select
                        className="form-input"
                        value={selectedSession}
                        onChange={(e) => { setSelectedSession(e.target.value); setPage(1); }}
                        style={{ maxWidth: '300px' }}
                    >
                        {sessions.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                        ))}
                    </select>
                    <button className="btn btn-outline btn-sm" onClick={loadMessages}>Refresh</button>
                </div>
            </div>

            {/* Messages Table */}
            <div className="card">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📨</div>
                        <h3>No messages</h3>
                        <p>Messages sent through this session will appear here.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>To</th>
                                        <th>Message</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.map((msg) => (
                                        <tr key={msg.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{msg.to}</td>
                                            <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {msg.body}
                                            </td>
                                            <td><span className="badge badge-muted">{msg.type}</span></td>
                                            <td>
                                                <span className={`badge ${msg.status === 'SENT' || msg.status === 'DELIVERED' || msg.status === 'READ' ? 'badge-success' :
                                                        msg.status === 'FAILED' ? 'badge-danger' :
                                                            msg.status === 'QUEUED' ? 'badge-info' : 'badge-warning'
                                                    }`}>
                                                    {msg.status}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {total > 20 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                                <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                    ← Previous
                                </button>
                                <span style={{ padding: '6px 12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                    Page {page} of {Math.ceil(total / 20)}
                                </span>
                                <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
