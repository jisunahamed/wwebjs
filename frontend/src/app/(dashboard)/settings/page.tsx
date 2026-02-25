'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { settingsApi } from '@/lib/api';

interface SettingsData {
    minDelayBetweenMsgs: number;
    maxDelayBetweenMsgs: number;
    maxMsgsPerMinute: number;
    maxMsgsPerHour: number;
    maxMsgsPerDay: number;
    typingDelay: boolean;
    typingDurationMs: number;
    onlinePresence: boolean;
    readReceipts: boolean;
    maxNewChatsPerDay: number;
    cooldownAfterBurst: number;
    burstThreshold: number;
    autoReconnect: boolean;
    maxReconnectAttempts: number;
    riskAcknowledged: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [defaults, setDefaults] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [warnings, setWarnings] = useState<string[]>([]);

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        try {
            const res = await settingsApi.get();
            setSettings(res.data.data.settings);
            setDefaults(res.data.data.defaults);
        } catch { toast.error('Failed to load settings'); }
    };

    const updateField = (key: string, value: any) => {
        setSettings((prev) => prev ? { ...prev, [key]: value } : null);
    };

    const saveSettings = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const res = await settingsApi.update(settings);
            if (res.data.success && res.data.data.updated) {
                toast.success('Settings saved!');
                setWarnings([]);
            } else if (res.data.warnings) {
                setWarnings(res.data.warnings);
                toast.error('Risky settings detected');
            }
        } catch (err: any) {
            if (err.response?.data?.warnings) {
                setWarnings(err.response.data.warnings);
                toast.error('Acknowledge risk to save');
            } else {
                toast.error('Failed to save');
            }
        } finally { setSaving(false); }
    };

    const resetDefaults = async () => {
        try {
            await settingsApi.reset();
            toast.success('Settings reset to defaults');
            setWarnings([]);
            loadSettings();
        } catch { toast.error('Failed to reset'); }
    };

    if (!settings) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Anti-Block Settings</h1>
                    <p>Configure message throttling and human simulation</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={resetDefaults}>Reset to Defaults</button>
                    <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="warning-box" style={{ marginBottom: '24px' }}>
                    <span className="icon">⚠️</span>
                    <div>
                        <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '8px' }}>
                            Risky Settings Detected
                        </strong>
                        {warnings.map((w, i) => (
                            <p key={i} style={{ marginBottom: '4px' }}>{w}</p>
                        ))}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.riskAcknowledged}
                                onChange={(e) => updateField('riskAcknowledged', e.target.checked)}
                            />
                            <span style={{ fontSize: '13px', color: 'var(--warning)' }}>
                                I understand the risks and want to proceed
                            </span>
                        </label>
                    </div>
                </div>
            )}

            <div className="grid-2">
                {/* Message Throttling */}
                <div className="card">
                    <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>⏱️ Message Throttling</h2>

                    <div className="form-group">
                        <label className="form-label">Min Delay Between Messages (ms)</label>
                        <input type="number" className="form-input" value={settings.minDelayBetweenMsgs}
                            onChange={(e) => updateField('minDelayBetweenMsgs', parseInt(e.target.value))} min={500} max={30000} />
                        <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Default: {defaults?.minDelayBetweenMsgs}ms</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Max Delay Between Messages (ms)</label>
                        <input type="number" className="form-input" value={settings.maxDelayBetweenMsgs}
                            onChange={(e) => updateField('maxDelayBetweenMsgs', parseInt(e.target.value))} min={1000} max={60000} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Max Messages / Minute</label>
                        <input type="number" className="form-input" value={settings.maxMsgsPerMinute}
                            onChange={(e) => updateField('maxMsgsPerMinute', parseInt(e.target.value))} min={1} max={100} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Max Messages / Hour</label>
                        <input type="number" className="form-input" value={settings.maxMsgsPerHour}
                            onChange={(e) => updateField('maxMsgsPerHour', parseInt(e.target.value))} min={10} max={2000} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Max Messages / Day</label>
                        <input type="number" className="form-input" value={settings.maxMsgsPerDay}
                            onChange={(e) => updateField('maxMsgsPerDay', parseInt(e.target.value))} min={50} max={10000} />
                    </div>
                </div>

                {/* Human Simulation */}
                <div className="card">
                    <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>🤖 Human Simulation</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>Typing Indicator</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Show "typing..." before messages</div>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" checked={settings.typingDelay} onChange={(e) => updateField('typingDelay', e.target.checked)} />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {settings.typingDelay && (
                        <div className="form-group">
                            <label className="form-label">Typing Duration (ms)</label>
                            <input type="number" className="form-input" value={settings.typingDurationMs}
                                onChange={(e) => updateField('typingDurationMs', parseInt(e.target.value))} min={500} max={10000} />
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>Online Presence</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Show as "Online" when sending</div>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" checked={settings.onlinePresence} onChange={(e) => updateField('onlinePresence', e.target.checked)} />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>Read Receipts</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Send read receipts</div>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" checked={settings.readReceipts} onChange={(e) => updateField('readReceipts', e.target.checked)} />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                {/* Session Safety */}
                <div className="card">
                    <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>🛡️ Session Safety</h2>

                    <div className="form-group">
                        <label className="form-label">Max New Chats / Day</label>
                        <input type="number" className="form-input" value={settings.maxNewChatsPerDay}
                            onChange={(e) => updateField('maxNewChatsPerDay', parseInt(e.target.value))} min={5} max={500} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Burst Threshold</label>
                        <input type="number" className="form-input" value={settings.burstThreshold}
                            onChange={(e) => updateField('burstThreshold', parseInt(e.target.value))} min={3} max={50} />
                        <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Consecutive messages before cooldown</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Cooldown After Burst (ms)</label>
                        <input type="number" className="form-input" value={settings.cooldownAfterBurst}
                            onChange={(e) => updateField('cooldownAfterBurst', parseInt(e.target.value))} min={0} max={120000} />
                    </div>
                </div>

                {/* Auto Reconnect */}
                <div className="card">
                    <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>🔄 Auto Reconnect</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>Auto Reconnect</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Automatically reconnect on disconnect</div>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" checked={settings.autoReconnect} onChange={(e) => updateField('autoReconnect', e.target.checked)} />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {settings.autoReconnect && (
                        <div className="form-group">
                            <label className="form-label">Max Reconnect Attempts</label>
                            <input type="number" className="form-input" value={settings.maxReconnectAttempts}
                                onChange={(e) => updateField('maxReconnectAttempts', parseInt(e.target.value))} min={1} max={20} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
