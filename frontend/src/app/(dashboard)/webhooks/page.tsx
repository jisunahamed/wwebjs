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
        <div>
            <div className="page-header">
                <div>
                    <h1>Webhooks</h1>
                    <p>Receive real-time event notifications</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + New Webhook
                </button>
            </div>

            {webhooks.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">🔗</div>
                        <h3>No webhooks yet</h3>
                        <p>Create a webhook to receive real-time events (messages, session changes, etc.)</p>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                            Create First Webhook
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid-2">
                    {webhooks.map((wh) => (
                        <div key={wh.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span className={`badge ${wh.isActive ? 'badge-success' : 'badge-danger'}`}>
                                    {wh.isActive ? 'ACTIVE' : 'PAUSED'}
                                </span>
                                <label className="toggle">
                                    <input type="checkbox" checked={wh.isActive} onChange={() => toggleActive(wh.id, wh.isActive)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', wordBreak: 'break-all' }}>
                                {wh.url}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                {wh.events.map((e: string) => (
                                    <span key={e} className="badge badge-info" style={{ fontSize: '10px' }}>{e}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => deleteWebhook(wh.id)}
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
                        <h3>Create New Webhook</h3>
                        <form onSubmit={createWebhook}>
                            <div className="form-group">
                                <label className="form-label">Webhook URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://your-app.com/webhook"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Events</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {EVENT_OPTIONS.map((event) => (
                                        <button
                                            key={event}
                                            type="button"
                                            onClick={() => toggleEvent(event)}
                                            className={`btn btn-sm ${selectedEvents.includes(event) ? 'btn-primary' : 'btn-outline'}`}
                                        >
                                            {event}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Webhook'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
