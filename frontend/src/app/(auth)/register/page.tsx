'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await register(email, password, name || undefined);
            if (result.isFirstUser) {
                toast.success('Admin account created! Please log in.');
                router.push('/login');
            } else {
                setRegistered(true);
                setResultMessage(result.message);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (registered) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="logo">⏳</div>
                    <h1>Registration Complete!</h1>
                    <p className="subtitle" style={{ marginBottom: '24px' }}>{resultMessage}</p>
                    <div style={{
                        background: 'var(--info-soft)',
                        border: '1px solid rgba(38, 198, 218, 0.3)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '24px',
                    }}>
                        <p style={{ color: 'var(--info)', fontSize: '14px', margin: 0 }}>
                            🔔 An admin will review your registration and approve your account.
                            You will be able to log in once approved.
                        </p>
                    </div>
                    <Link href="/login">
                        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                            Go to Login
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="logo">💬</div>
                <h1>Create Account</h1>
                <p className="subtitle">Sign up for WP Session Provider</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Min 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                <div className="auth-footer">
                    Already have an account? <Link href="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
