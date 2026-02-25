'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { sessionsApi } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';

export default function SessionsPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedQr, setSelectedQr] = useState<any>(null);

    useEffect(() => { loadSessions(); }, []);

    const loadSessions = async () => {
        try {
            const res = await sessionsApi.list();
            setSessions(res.data.data);
        } catch { toast.error('Failed to load sessions'); }
    };

    const createSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sessionsApi.create(newName);
            toast.success('Session created! Waiting for QR...');
            setShowCreate(false);
            setNewName('');
            setTimeout(loadSessions, 2000);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create session');
        } finally { setLoading(false); }
    };

    const deleteSession = async (id: string) => {
        if (!confirm('Delete this session? This action cannot be undone.')) return;
        try {
            await sessionsApi.delete(id);
            toast.success('Session deleted');
            loadSessions();
        } catch { toast.error('Failed to delete session'); }
    };

    const reconnect = async (id: string) => {
        try {
            await sessionsApi.reconnect(id);
            toast.success('Reconnect initiated');
            setTimeout(loadSessions, 3000);
        } catch { toast.error('Reconnect failed'); }
    };

    const showQr = async (id: string) => {
        try {
            const res = await sessionsApi.getQr(id);
            setSelectedQr(res.data.data);
        } catch { toast.error('Failed to get QR code'); }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Sessions</h1>
                    <p>Manage your WhatsApp sessions</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + New Session
                </button>
            </div>

            {sessions.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">💬</div>
                        <h3>No sessions yet</h3>
                        <p>Create a new session and scan the QR code with your WhatsApp app.</p>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                            Create First Session
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid-2">
                    {sessions.map((session) => (
                        <div key={session.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{session.name}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                        {session.phone || 'Not connected'}
                                    </div>
                                </div>
                                <span className={`badge ${session.status === 'CONNECTED' ? 'badge-success' :
                                        session.status === 'QR_READY' ? 'badge-info' :
                                            session.status === 'FAILED' ? 'badge-danger' :
                                                session.status === 'DISCONNECTED' ? 'badge-warning' :
                                                    'badge-muted'
                                    }`}>
                                    {session.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                <span>Messages: {session._count?.messages || 0}</span>
                                <span>Retries: {session.retryCount}</span>
                            </div>

                            {session.errorMessage && (
                                <div style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '12px', padding: '8px', background: 'var(--danger-soft)', borderRadius: '6px' }}>
                                    {session.errorMessage}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '8px' }}>
                                {session.status === 'QR_READY' && (
                                    <button className="btn btn-outline btn-sm" onClick={() => showQr(session.id)}>
                                        📱 Show QR
                                    </button>
                                )}
                                {(session.status === 'DISCONNECTED' || session.status === 'FAILED') && (
                                    <button className="btn btn-outline btn-sm" onClick={() => reconnect(session.id)}>
                                        🔄 Reconnect
                                    </button>
                                )}
                                <button className="btn btn-ghost btn-sm" onClick={() => deleteSession(session.id)}
                                    style={{ marginLeft: 'auto', color: 'var(--danger)' }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Create New Session</h3>
                        <form onSubmit={createSession}>
                            <div className="form-group">
                                <label className="form-label">Session Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Business Line"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {selectedQr && (
                <div className="modal-overlay" onClick={() => setSelectedQr(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <h3>Scan QR Code</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                            Open WhatsApp → Settings → Linked Devices → Link a Device
                        </p>
                        {selectedQr.qrCode ? (
                            <div className="qr-container">
                                <QRCodeSVG value={selectedQr.qrCode} size={256} />
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>
                                Status: {selectedQr.status}. QR not available yet.
                            </p>
                        )}
                        <div className="modal-footer" style={{ justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setSelectedQr(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
