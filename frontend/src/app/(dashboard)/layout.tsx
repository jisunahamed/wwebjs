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
    { href: '/docs', label: 'Docs', icon: '📚' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
];

const adminNavItems = [
    { href: '/admin', label: 'Admin Panel', icon: '👑' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading, token, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [isLoading, token, router]);

    if (isLoading || !token) {
        return (
            <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <div style={{ color: 'var(--text-muted)', fontFamily: 'Outfit' }}>Loading Workspace...</div>
            </div>
        );
    }

    const allNavItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar with Glassmorphism */}
            <aside className="glass" style={{
                width: '280px',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 100,
            }}>
                {/* Brand Logo */}
                <div style={{
                    padding: '32px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--accent)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        boxShadow: '0 8px 16px -4px var(--accent-glow)'
                    }}>💬</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'Outfit', letterSpacing: '-0.02em' }}>WP Provider</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SaaS Platform</div>
                    </div>
                </div>

                {/* Navigation Section */}
                <div style={{ padding: '0 24px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', paddingLeft: '12px' }}>Menu</div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {allNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={isActive ? 'fade-in' : ''}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        background: isActive ? 'var(--bg-hover)' : 'transparent',
                                        border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '14px',
                                        transition: 'all var(--transition)',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '18px',
                                        filter: isActive ? 'drop-shadow(0 0 8px var(--accent-glow))' : 'none',
                                        opacity: isActive ? 1 : 0.7
                                    }}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer User Profile */}
                <div style={{
                    marginTop: 'auto',
                    padding: '24px',
                    borderTop: '1px solid var(--border)',
                }}>
                    <div className="glass-card" style={{ padding: '16px', border: '1px solid var(--border-strong)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: isAdmin ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #6c5ce7, #4834d4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 800,
                                fontSize: '16px',
                                boxShadow: isAdmin ? '0 4px 12px rgba(245, 158, 11, 0.3)' : '0 4px 12px rgba(108, 92, 231, 0.3)',
                                fontFamily: 'Outfit'
                            }}>
                                {isAdmin ? '👑' : (user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U')}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Outfit' }}>
                                    {user?.name || user?.email?.split('@')[0]}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {isAdmin ? 'PLATFORM ADMIN' : `${user?.plan} PLAN`}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-outline btn-sm"
                            style={{ width: '100%', borderRadius: '10px' }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: '280px',
                padding: '48px 60px',
                background: 'var(--bg-primary)',
                minHeight: '100vh',
            }}>
                <div className="fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}

