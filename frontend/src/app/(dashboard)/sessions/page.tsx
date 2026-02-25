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
        <div className="fade-in">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1>WhatsApp Sessions</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
                        Connected channels: <strong style={{ color: 'var(--text-primary)' }}>{sessions.length}</strong>
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <span style={{ fontSize: '18px' }}>+</span> Create New Session
                </button>
            </div>

            {sessions.length === 0 ? (
                <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center' }}>
                    <div className="empty-state">
                        <div style={{
                            fontSize: '64px',
                            marginBottom: '24px',
                            filter: 'drop-shadow(0 0 20px var(--accent-glow))'
                        }}>📱</div>
                        <h2 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '12px' }}>No Active Channels</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 32px', fontSize: '15px' }}>
                            Start by creating a session and scanning the QR code to link your WhatsApp account with our provider.
                        </p>
                        <button className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)} style={{ padding: '16px 32px' }}>
                            Provision Your First Channel
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
                    {sessions.map((session) => (
                        <div key={session.id} className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: 'var(--bg-hover)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '22px',
                                        border: '1px solid var(--border)'
                                    }}>
                                        {session.status === 'CONNECTED' ? '✅' : '🔗'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{session.name}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {session.phone || 'Offline / Metadata Pending'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <span className={`badge ${session.status === 'CONNECTED' ? 'badge-success' :
                                        session.status === 'QR_READY' ? 'badge-info' :
                                            session.status === 'FAILED' ? 'badge-danger' :
                                                session.status === 'DISCONNECTED' ? 'badge-warning' :
                                                    'badge-muted'
                                        }`} style={{ borderRadius: '8px', padding: '4px 10px' }}>
                                        <span style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: 'currentColor',
                                            marginRight: '6px',
                                            boxShadow: '0 0 8px currentColor'
                                        }}></span>
                                        {session.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginBottom: '24px',
                                padding: '12px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '12px',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Traffic</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{session._count?.messages || 0}</div>
                                </div>
                                <div style={{ width: '1px', background: 'var(--border)' }}></div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Retries</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{session.retryCount || 0}</div>
                                </div>
                            </div>

                            {session.errorMessage && (
                                <div style={{
                                    fontSize: '12px',
                                    color: 'var(--danger)',
                                    marginBottom: '20px',
                                    padding: '10px 14px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    display: 'flex',
                                    gap: '10px'
                                }}>
                                    <span>⚠️</span>
                                    <span style={{ flex: 1 }}>{session.errorMessage}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px' }}>
                                {session.status === 'QR_READY' && (
                                    <button className="btn btn-primary btn-sm" onClick={() => showQr(session.id)} style={{ flex: 1 }}>
                                        📱 Link WhatsApp
                                    </button>
                                )}
                                {(session.status === 'DISCONNECTED' || session.status === 'FAILED') && (
                                    <button className="btn btn-outline btn-sm" onClick={() => reconnect(session.id)} style={{ flex: 1 }}>
                                        🔄 Resume Channel
                                    </button>
                                )}
                                <button className="btn btn-ghost btn-sm" onClick={() => deleteSession(session.id)}
                                    style={{ color: 'var(--danger)', fontSize: '13px' }}>
                                    Terminate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal glass" onClick={(e) => e.stopPropagation()} style={{ padding: '40px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Provision Channel</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
                            Give your session a name to easily identify it in your multi-channel router.
                        </p>
                        <form onSubmit={createSession}>
                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label className="form-label" style={{ marginBottom: '12px' }}>Channel Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Sales WhatsApp or Customer Support"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                    autoFocus
                                    style={{ height: '52px', fontSize: '16px' }}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Dismiss</button>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '160px' }}>
                                    {loading ? 'Provisioning...' : 'Provision Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {selectedQr && (
                <div className="modal-overlay" onClick={() => setSelectedQr(null)}>
                    <div className="modal glass" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '40px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Link Mobile Device</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px' }}>
                            Open WhatsApp → <strong style={{ color: 'var(--text-primary)' }}>Linked Devices</strong> → Scan the code below.
                        </p>
                        {selectedQr.qrCode ? (
                            <div className="qr-container" style={{
                                padding: '24px',
                                background: 'white',
                                borderRadius: '24px',
                                border: '8px solid rgba(255,255,255,0.1)',
                                display: 'inline-block',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                            }}>
                                <QRCodeSVG value={selectedQr.qrCode} size={256} />
                            </div>
                        ) : (
                            <div style={{ padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⌛</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    Status: <strong style={{ color: 'var(--accent)' }}>{selectedQr.status}</strong>
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>QR token is being generated... usually takes 5-10s.</p>
                            </div>
                        )}
                        <div className="modal-footer" style={{ justifyContent: 'center', marginTop: '40px' }}>
                            <button className="btn btn-outline" onClick={() => setSelectedQr(null)} style={{ minWidth: '140px' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

