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
        <div>
            <div className="page-header">
                <div>
                    <h1>API Keys</h1>
                    <p>Manage API keys for external integrations</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + New API Key
                </button>
            </div>

            {keys.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">🔑</div>
                        <h3>No API keys yet</h3>
                        <p>Create an API key to send messages from your external applications.</p>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                            Create First Key
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Last Used</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.map((key) => (
                                    <tr key={key.id}>
                                        <td style={{ fontWeight: 600 }}>{key.name}</td>
                                        <td>
                                            <span className={`badge ${key.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {key.isActive ? 'ACTIVE' : 'REVOKED'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                            {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                            {new Date(key.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {key.isActive && (
                                                    <button className="btn btn-ghost btn-sm" onClick={() => revokeKey(key.id)}
                                                        style={{ color: 'var(--warning)' }}>
                                                        Revoke
                                                    </button>
                                                )}
                                                <button className="btn btn-ghost btn-sm" onClick={() => deleteKey(key.id)}
                                                    style={{ color: 'var(--danger)' }}>
                                                    Delete
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
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        {newKey ? (
                            <>
                                <h3>🔑 Save Your API Key</h3>
                                <div className="warning-box">
                                    <span className="icon">⚠️</span>
                                    <p>Copy this key now. It won&apos;t be shown again!</p>
                                </div>
                                <div style={{
                                    padding: '14px',
                                    background: 'var(--bg-primary)',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    wordBreak: 'break-all',
                                    border: '1px solid var(--border)',
                                }}>
                                    {newKey}
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-primary" onClick={() => copyKey(newKey)}>
                                        📋 Copy Key
                                    </button>
                                    <button className="btn btn-outline" onClick={() => { setShowCreate(false); setNewKey(null); }}>
                                        Done
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Create New API Key</h3>
                                <form onSubmit={createKey}>
                                    <div className="form-group">
                                        <label className="form-label">Key Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. Production Integration"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? 'Creating...' : 'Create Key'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
