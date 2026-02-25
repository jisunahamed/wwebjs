'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiKeysApi } from '@/lib/api';

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<any[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newKey, setNewKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadKeys(); }, []);

    const loadKeys = async () => {
        try {
            const res = await apiKeysApi.list();
            setKeys(res.data.data);
        } catch { toast.error('Failed to load API keys'); }
    };

    const createKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiKeysApi.create({ name: newName });
            setNewKey(res.data.data.key);
            toast.success('API key created!');
            setNewName('');
            loadKeys();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create key');
        } finally { setLoading(false); }
    };

    const revokeKey = async (id: string) => {
        if (!confirm('Revoke this API key?')) return;
        try {
            await apiKeysApi.revoke(id);
            toast.success('API key revoked');
            loadKeys();
        } catch { toast.error('Failed to revoke key'); }
    };

    const deleteKey = async (id: string) => {
        if (!confirm('Permanently delete this API key?')) return;
        try {
            await apiKeysApi.delete(id);
            toast.success('API key deleted');
            loadKeys();
        } catch { toast.error('Failed to delete key'); }
    };

    const copyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="fade-in">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1>Authentication Keys</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Securely manage your programmatic access tokens</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <span style={{ fontSize: '18px' }}>+</span> Provision New Key
                </button>
            </div>

            {keys.length === 0 ? (
                <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center' }}>
                    <div className="empty-state">
                        <div style={{ fontSize: '64px', marginBottom: '24px', filter: 'drop-shadow(0 0 20px var(--accent-glow))' }}>🔑</div>
                        <h2 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '12px' }}>No Security Credentials</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 32px' }}>
                            Provision an API key to securely integrate your external systems with our messaging infrastructure.
                        </p>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ padding: '16px 32px' }}>
                            Generate Your First Key
                        </button>
                    </div>
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '0' }}>
                    <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '32px' }}>Identifier</th>
                                    <th>Status</th>
                                    <th>Last Activity</th>
                                    <th>Issued On</th>
                                    <th style={{ paddingRight: '32px', textAlign: 'right' }}>Security Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.map((key) => (
                                    <tr key={key.id}>
                                        <td style={{ paddingLeft: '32px' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{key.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>UID: {key.id.slice(0, 8)}...</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${key.isActive ? 'badge-success' : 'badge-danger'}`} style={{ borderRadius: '8px' }}>
                                                {key.isActive ? 'ACTIVE' : 'REVOKED'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                            {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never used'}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                            {new Date(key.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ paddingRight: '32px' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                {key.isActive && (
                                                    <button className="btn btn-outline btn-sm" onClick={() => revokeKey(key.id)}
                                                        style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
                                                        Revoke
                                                    </button>
                                                )}
                                                <button className="btn btn-ghost btn-sm" onClick={() => deleteKey(key.id)}
                                                    style={{ color: 'var(--danger)' }}>
                                                    Destroy
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => { setShowCreate(false); setNewKey(null); }}>
                    <div className="modal glass" onClick={(e) => e.stopPropagation()} style={{ padding: '40px' }}>
                        {newKey ? (
                            <div className="fade-in">
                                <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>🔑 Credential Generated</h2>
                                <div style={{
                                    padding: '16px',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    display: 'flex',
                                    gap: '12px'
                                }}>
                                    <span>⚠️</span>
                                    <p style={{ fontSize: '13px', color: '#f59e0b' }}>
                                        For security reasons, we can only show this key <strong>once</strong>. Store it securely in your secrets manager.
                                    </p>
                                </div>
                                <div style={{
                                    padding: '20px',
                                    background: '#0d1117',
                                    borderRadius: '12px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    wordBreak: 'break-all',
                                    border: '1px solid var(--border-strong)',
                                    color: '#79c0ff',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                                    marginBottom: '32px'
                                }}>
                                    {newKey}
                                </div>
                                <div className="modal-footer" style={{ gap: '12px' }}>
                                    <button className="btn btn-primary" onClick={() => copyKey(newKey)} style={{ flex: 1 }}>
                                        📋 Copy to Clipboard
                                    </button>
                                    <button className="btn btn-outline" onClick={() => { setShowCreate(false); setNewKey(null); }} style={{ flex: 1 }}>
                                        I&apos;ve Saved It
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="fade-in">
                                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Provision API Key</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
                                    Assign a descriptive name to track its usage across your integrations.
                                </p>
                                <form onSubmit={createKey}>
                                    <div className="form-group" style={{ marginBottom: '32px' }}>
                                        <label className="form-label" style={{ marginBottom: '12px' }}>Integration Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. ERP Main Hub or Customer Portal"
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
                                            {loading ? 'Provisioning...' : 'Provision Key'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

