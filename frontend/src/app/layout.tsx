import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
    title: 'WP Session Provider — WhatsApp API Dashboard',
    description: 'Production-ready WhatsApp Session Provider SaaS platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#16161f',
                                color: '#f0f0f5',
                                border: '1px solid #2a2a3d',
                                borderRadius: '12px',
                            },
                            success: { iconTheme: { primary: '#00d68f', secondary: '#16161f' } },
                            error: { iconTheme: { primary: '#ff4757', secondary: '#16161f' } },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
