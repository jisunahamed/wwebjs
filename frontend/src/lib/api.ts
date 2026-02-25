import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle 401 responses — redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// ─── Auth API ────────────────────────────────────────────────────────────
export const authApi = {
    register: (data: { email: string; password: string; name?: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
};

// ─── Sessions API ────────────────────────────────────────────────────────
export const sessionsApi = {
    list: () => api.get('/sessions'),
    create: (name: string) => api.post('/sessions', { name }),
    getById: (id: string) => api.get(`/sessions/${id}`),
    getQr: (id: string) => api.get(`/sessions/${id}/qr`),
    delete: (id: string) => api.delete(`/sessions/${id}`),
    reconnect: (id: string) => api.post(`/sessions/${id}/reconnect`),
};

// ─── API Keys API ────────────────────────────────────────────────────────
export const apiKeysApi = {
    list: () => api.get('/api-keys'),
    create: (data: { name: string; expiresAt?: string }) => api.post('/api-keys', data),
    revoke: (id: string) => api.patch(`/api-keys/${id}/revoke`),
    delete: (id: string) => api.delete(`/api-keys/${id}`),
};

// ─── Messages API ────────────────────────────────────────────────────────
export const messagesApi = {
    listBySession: (sessionId: string, params?: { page?: number; limit?: number; status?: string }) =>
        api.get(`/messages/session/${sessionId}`, { params }),
    getById: (id: string) => api.get(`/messages/${id}`),
    getStats: () => api.get('/messages/stats'),
};

// ─── Webhooks API ────────────────────────────────────────────────────────
export const webhooksApi = {
    list: () => api.get('/webhooks'),
    create: (data: { url: string; events: string[] }) => api.post('/webhooks', data),
    getById: (id: string) => api.get(`/webhooks/${id}`),
    update: (id: string, data: any) => api.patch(`/webhooks/${id}`, data),
    delete: (id: string) => api.delete(`/webhooks/${id}`),
    regenerateSecret: (id: string) => api.post(`/webhooks/${id}/regenerate-secret`),
};

// ─── Settings API ────────────────────────────────────────────────────────
export const settingsApi = {
    get: () => api.get('/settings'),
    update: (data: any) => api.patch('/settings', data),
    reset: () => api.post('/settings/reset'),
    getDefaults: () => api.get('/settings/defaults'),
};

// ─── Admin API ───────────────────────────────────────────────────────────
export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    listUsers: (params?: { status?: string; search?: string }) =>
        api.get('/admin/users', { params }),
    approveUser: (id: string) => api.post(`/admin/users/${id}/approve`),
    rejectUser: (id: string) => api.delete(`/admin/users/${id}/reject`),
    toggleUserActive: (id: string) => api.patch(`/admin/users/${id}/toggle-active`),
    updateUserPlan: (id: string, data: { plan: string; maxSessions?: number }) =>
        api.patch(`/admin/users/${id}/plan`, data),
};
