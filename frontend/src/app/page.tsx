'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
    const router = useRouter();
    const { token, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (token) {
                router.push('/dashboard');
            } else {
                router.push('/login');
            }
        }
    }, [token, isLoading, router]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                <h1 style={{ fontSize: '24px', fontWeight: 700 }}>WP Session Provider</h1>
                <p style={{ color: '#8888a0', marginTop: '8px' }}>Loading...</p>
            </div>
        </div>
    );
}
