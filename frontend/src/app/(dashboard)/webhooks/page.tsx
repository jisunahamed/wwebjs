'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { webhooksApi } from '@/lib/api';

const EVENT_OPTIONS = [
    'message.received', 'message.sent', 'message.failed',
    'session.connected', 'session.disconnected', 'session.qr',
];

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadWebhooks(); }, []);

    const loadWebhooks = async () => {
        try {
            const res = await webhooksApi.list();
            setWebhooks(res.data.data);
        } catch { toast.error('Failed to load webhooks'); }
    };

    const toggleEvent = (event: string) => {
        setSelectedEvents((prev) =>
            prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
        );
    };

    const createWebhook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEvents.length === 0) {
            toast.error('Select at least one event');
            return;
        }
        setLoading(true);
        try {
            const res = await webhooksApi.create({ url: newUrl, events: selectedEvents });
            toast.success('Webhook created! Secret: ' + res.data.data.secret.slice(0, 16) + '...');
            setShowCreate(false);
            setNewUrl('');
            setSelectedEvents([]);
            loadWebhooks();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create');
        } finally { setLoading(false); }
    };

    const toggleActive = async (id: string, isActive: boolean) => {
        try {
            await webhooksApi.update(id, { isActive: !isActive });
            toast.success(isActive ? 'Webhook paused' : 'Webhook activated');
            loadWebhooks();
        } catch { toast.error('Failed to update'); }
    };

    const deleteWebhook = async (id: string) => {
        if (!confirm('Delete this webhook?')) return;
        try {
            await webhooksApi.delete(id);
            toast.success('Webhook deleted');
            loadWebhooks();
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div className="fade-in">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1>Event Webhooks</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Configure real-time delivery of platform events to your endpoints</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <span style={{ fontSize: '18px' }}>+</span> Register Endpoint
                </button>
            </div>

            {webhooks.length === 0 ? (
                <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center' }}>
                    <div className="empty-state">
                        <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.6 }}>🔗</div>
                        <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>No Subscriptions Active</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 32px' }}>
                            Stay synchronized by configuring webhooks to receive real-time updates for messages and session states.
                        </p>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ padding: '16px 32px' }}>
                            Create First Subscription
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid-2">
                    {webhooks.map((wh) => (
                        <div key={wh.id} className="glass-card fade-in" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <span className={`badge ${wh.isActive ? 'badge-success' : 'badge-danger'}`} style={{ borderRadius: '8px', padding: '4px 12px' }}>
                                    {wh.isActive ? 'LIVE' : 'HALTED'}
                                </span>
                                <label className="toggle">
                                    <input type="checkbox" checked={wh.isActive} onChange={() => toggleActive(wh.id, wh.isActive)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                marginBottom: '16px',
                                wordBreak: 'break-all',
                                fontWeight: 500,
                                background: 'rgba(0,0,0,0.2)',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-strong)'
                            }}>
                                {wh.url}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                                {wh.events.map((e: string) => (
                                    <span key={e} className="badge badge-info" style={{ fontSize: '11px', borderRadius: '6px', background: 'rgba(108, 92, 231, 0.1)', color: 'var(--accent)', border: '1px solid rgba(108, 92, 231, 0.2)' }}>
                                        {e}
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                    ID: {wh.id.slice(0, 8)}...
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => deleteWebhook(wh.id)}
                                    style={{ marginLeft: 'auto', color: 'var(--danger)', fontWeight: 600 }}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal glass fade-in" onClick={(e) => e.stopPropagation()} style={{ padding: '40px', maxWidth: '600px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>New Event Subscription</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
                            Specify your endpoint and select the events you wish to monitor.
                        </p>
                        <form onSubmit={createWebhook}>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label" style={{ marginBottom: '10px' }}>Endpoint URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://your-domain.com/webhooks/whatsapp"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    required
                                    autoFocus
                                    style={{ height: '52px' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label className="form-label" style={{ marginBottom: '16px' }}>Available Events</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                    {EVENT_OPTIONS.map((event) => (
                                        <button
                                            key={event}
                                            type="button"
                                            onClick={() => toggleEvent(event)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '10px',
                                                border: '1px solid',
                                                borderColor: selectedEvents.includes(event) ? 'var(--accent)' : 'var(--border)',
                                                background: selectedEvents.includes(event) ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
                                                color: selectedEvents.includes(event) ? 'var(--text-primary)' : 'var(--text-muted)',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{ marginRight: '8px' }}>{selectedEvents.includes(event) ? '✅' : '○'}</span>
                                            {event}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '180px' }}>
                                    {loading ? 'Registering...' : 'Register Webhook'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
