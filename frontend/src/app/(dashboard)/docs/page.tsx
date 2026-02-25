'use client';

import { useState } from 'react';

export default function DocsPage() {
    const [activeTab, setActiveTab] = useState('auth');

    const baseUrl = 'http://localhost:4000/api/v1';

    const renderAuth = () => (
        <div className="glass-card fade-in" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontFamily: 'Outfit', marginBottom: '12px' }}>Authentication</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>You can authenticate with the API using either a <strong>JWT Token</strong> (for frontend apps) or an <strong>API Key</strong> (for server-to-server integration).</p>

            <div style={{ marginBottom: '32px', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--accent)', marginBottom: '12px', fontFamily: 'Outfit' }}>Option 1: API Key (Modern Standard)</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Include your API key in the <code>x-api-key</code> header of every request.</p>
                <div style={{ background: '#0d1117', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-strong)', fontFamily: 'monospace', fontSize: '13px', color: '#79c0ff' }}>
                    x-api-key: your-api-key-here
                </div>
            </div>

            <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--accent)', marginBottom: '12px', fontFamily: 'Outfit' }}>Option 2: Bearer Token</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Include your JWT token in the <code>Authorization</code> header.</p>
                <div style={{ background: '#0d1117', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-strong)', fontFamily: 'monospace', fontSize: '13px', color: '#79c0ff' }}>
                    Authorization: Bearer your-jwt-token
                </div>
            </div>
        </div>
    );

    const renderMessaging = () => (
        <div className="glass-card fade-in" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontFamily: 'Outfit', marginBottom: '12px' }}>Messaging API</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>To send a message, you need the <code>sessionId</code> of a connected WhatsApp account.</p>

            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span className="badge badge-success" style={{ padding: '4px 12px', borderRadius: '6px' }}>POST</span>
                    <code style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>/sessions/:sessionId/messages</code>
                </div>

                <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Schema Definition</h4>
                <div style={{ background: '#0d1117', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-strong)', fontFamily: 'monospace', fontSize: '13px', color: '#c9d1d9' }}>
                    {`{
  "to": "88017XXXXXXXX",
  "body": "Hello World!",
  "type": "TEXT" 
}`}
                </div>

                <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '24px', marginBottom: '12px' }}>Integration Example (Node.js)</h4>
                <div style={{ background: '#0d1117', color: '#d1d5db', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-strong)', fontFamily: 'monospace', fontSize: '13px', overflowX: 'auto', lineHeight: '1.6' }}>
                    {`curl -X POST "${baseUrl}/sessions/ID/messages" \\
     -H "Content-Type: application/json" \\
     -H "x-api-key: YOUR_API_KEY" \\
     -d '{
       "to": "88017XXXXXXXX",
       "body": "Hi from WP Provider!"
     }'`}
                </div>
            </div>
        </div>
    );

    const renderWebhooks = () => (
        <div className="glass-card fade-in" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontFamily: 'Outfit', marginBottom: '12px' }}>Webhooks Integration</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Subscribe to real-time events like incoming messages or status changes.</p>

            <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Payload Structure</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>When a message is received, your webhook URL will receive a POST request:</p>
                <div style={{ background: '#0d1117', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-strong)', fontFamily: 'monospace', fontSize: '13px', color: '#c9d1d9', lineHeight: '1.6' }}>
                    {`{
  "event": "message.received",
  "sessionId": "4f92-a1b2-...",
  "data": {
    "from": "88017XXXXXXXX@c.us",
    "body": "Is this working?",
    "timestamp": 1677435000
  }
}`}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fade-in">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1>Developer Portal</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Everything you need to integrate WhatsApp into your workflows.</p>
                </div>
                <div className="glass" style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px' }}>
                    API Hub: <code style={{ color: 'var(--accent)', fontWeight: 700 }}>{baseUrl}</code>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                {[
                    { id: 'auth', label: 'Security', icon: '🔐' },
                    { id: 'messages', label: 'Messaging', icon: '📩' },
                    { id: 'webhooks', label: 'Webhooks', icon: '🔗' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={activeTab === tab.id ? 'fade-in' : ''}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '10px',
                            background: activeTab === tab.id ? 'var(--bg-hover)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all var(--transition)',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                            border: activeTab === tab.id ? '1px solid var(--border-strong)' : '1px solid transparent'
                        }}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            <div className="fade-in" style={{ marginBottom: '40px' }}>
                {activeTab === 'auth' && renderAuth()}
                {activeTab === 'messages' && renderMessaging()}
                {activeTab === 'webhooks' && renderWebhooks()}
            </div>

            <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent)', background: 'linear-gradient(90deg, rgba(108, 92, 231, 0.05) 0%, transparent 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>⚡</span>
                    <div>
                        <h4 style={{ fontSize: '16px', fontFamily: 'Outfit' }}>Interactive API Console</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Visit our <a href="http://localhost:4000/api-docs" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Swagger UI</a> to test endpoints in real-time and view full schema definitions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

