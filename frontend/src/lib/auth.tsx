'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from './api';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    plan: string;
    maxSessions: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<{ isFirstUser: boolean; message: string }>;
    logout: () => void;
    isLoading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await authApi.login({ email, password });
        const { user: userData, token: tokenData } = res.data.data;
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const register = async (email: string, password: string, name?: string) => {
        const res = await authApi.register({ email, password, name });
        const { user: userData, isFirstUser, message } = res.data.data;

        // Only auto-login if first user (admin)
        if (isFirstUser) {
            // First user gets a token (auto-approved admin) — need to login separately
            // Actually, the register endpoint doesn't return a token anymore
            // So we just return the result
        }

        return { isFirstUser, message };
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
