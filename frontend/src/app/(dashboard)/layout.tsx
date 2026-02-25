'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/sessions', label: 'Sessions', icon: '💬' },
    { href: '/api-keys', label: 'API Keys', icon: '🔑' },
    { href: '/messages', label: 'Messages', icon: '📨' },
    { href: '/webhooks', label: 'Webhooks', icon: '🔗' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading, token } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [isLoading, token, router]);

    if (isLoading || !token) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#8888a0' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 100,
            }}>
                {/* Logo */}
                <div style={{
                    padding: '24px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <span style={{ fontSize: '28px' }}>💬</span>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>WP Provider</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Session Manager</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: '14px',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--accent-soft)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent)',
                            fontWeight: 700,
                            fontSize: '14px',
                        }}>
                            {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {user?.name || user?.email?.split('@')[0]}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {user?.plan} plan
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: '260px',
                padding: '32px 40px',
                background: 'var(--bg-primary)',
                minHeight: '100vh',
            }}>
                {children}
            </main>
        </div>
    );
}
