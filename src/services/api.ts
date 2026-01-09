/**
 * API Service Layer
 * Handles all communication with Flask backend
 * Uses HttpOnly cookies for JWT + CSRF tokens for security
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_PREFIX = '/api/v1';

// CSRF Token management
let csrfToken: string | null = null;

const fetchCSRFToken = async (): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/csrf-token`, {
        credentials: 'include'  // Include cookies
    });

    if (!response.ok) throw new Error('Failed to fetch CSRF token');

    const data = await response.json();
    csrfToken = data.csrf_token;
    return csrfToken;
};

// Request helper with CSRF protection
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // For state-changing requests, include CSRF token
    if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method)) {
        if (!csrfToken) {
            await fetchCSRFToken();
        }
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }
    }

    const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',  // Include HttpOnly cookies
    });

    if (!response.ok) {
        // On 401, clear CSRF token (user likely logged out)
        if (response.status === 401) {
            csrfToken = null;
        }
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    // If response includes new CSRF token, save it
    const data = await response.json();
    if (data.csrf_token) {
        csrfToken = data.csrf_token;
    }

    return data;
}

// Auth API
export const authAPI = {
    login: async (email: string, password: string) => {
        const data = await apiRequest<{ csrf_token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        // JWT is now in HttpOnly cookie, CSRF token in response
        csrfToken = data.csrf_token;
        return data;
    },

    register: async (email: string, password: string, name: string, extras?: any) => {
        const payload: any = { email, password, name };

        // Add optional payment data and other extras
        if (extras) {
            Object.assign(payload, extras);
        }

        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    logout: async () => {
        await apiRequest('/auth/logout', { method: 'POST' });
        csrfToken = null;  // Clear CSRF token
    },

    getCurrentUser: async () => {
        return apiRequest<{ email: string; name: string; role: string }>('/auth/me');
    },
};

// Alerts API
export const alertsAPI = {
    getAlerts: async (params?: { page?: number; per_page?: number; severity?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<{ alerts: any[]; pagination: any }>(`/alerts?${query}`);
    },

    getStats: async () => {
        return apiRequest<any>('/alerts/stats');
    },

    getRecent: async (limit = 5) => {
        return apiRequest<{ recent_alerts: any[] }>(`/alerts/recent?limit=${limit}`);
    },

    acknowledge: async (id: number) => {
        return apiRequest(`/alerts/${id}/acknowledge`, { method: 'PUT' });
    },
};

// Blocklist API
export const blocklistAPI = {
    getBlocklist: async (params?: { page?: number; per_page?: number; search?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<{ blocked_ips: any[]; pagination: any }>(`/blocklist?${query}`);
    },

    blockIP: async (ip: string, reason: string) => {
        return apiRequest('/blocklist', {
            method: 'POST',
            body: JSON.stringify({ ip_address: ip, reason }),
        });
    },

    unblockIP: async (id: number) => {
        return apiRequest(`/blocklist/${id}`, { method: 'DELETE' });
    },
};

// Whitelist API
export const whitelistAPI = {
    getWhitelist: async (params?: { page?: number; per_page?: number; search?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<{ whitelisted_ips: any[]; pagination: any }>(`/whitelist?${query}`);
    },

    addIP: async (ip: string, description: string) => {
        return apiRequest('/whitelist', {
            method: 'POST',
            body: JSON.stringify({ ip_address: ip, description }),
        });
    },

    removeIP: async (id: number) => {
        return apiRequest(`/whitelist/${id}`, { method: 'DELETE' });
    },
};

// Notifications API
export const notificationsAPI = {
    getNotifications: async () => {
        return apiRequest<{ notifications: any[] }>('/notifications');
    },

    markAsRead: async (id: string) => {
        return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
    },

    markAllAsRead: async () => {
        return apiRequest('/notifications/read-all', { method: 'PUT' });
    },
};

// Settings API
export const settingsAPI = {
    getSettings: async () => {
        return apiRequest<any>('/settings');
    },

    updateSettings: async (settings: any) => {
        return apiRequest('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },

    runBackup: async () => {
        return apiRequest('/settings/backup/run', { method: 'POST' });
    },
};

// API Tokens
export const tokensAPI = {
    getTokens: async () => {
        return apiRequest<{ tokens: any[] }>('/tokens');
    },

    generateToken: async (name: string) => {
        return apiRequest<{ token: string; api_token: any }>('/tokens/generate', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    revokeToken: async (id: number) => {
        return apiRequest(`/tokens/${id}`, { method: 'DELETE' });
    },
};

// Reports API
export const reportsAPI = {
    preview: async (startDate: string, endDate: string) => {
        return apiRequest<{ preview: any }>('/reports/preview', {
            method: 'POST',
            body: JSON.stringify({ start_date: startDate, end_date: endDate }),
        });
    },

    generate: async (startDate: string, endDate: string) => {
        const url = `${API_BASE_URL}${API_PREFIX}/reports`;

        // Ensure we have CSRF token for POST request
        if (!csrfToken) {
            await fetchCSRFToken();
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken || '',
            },
            credentials: 'include',  // Include HttpOnly cookies
            body: JSON.stringify({ start_date: startDate, end_date: endDate }),
        });

        if (!response.ok) throw new Error('Report generation failed');

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `SecureCore_Report_${startDate}_${endDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    },
};

// Admin API
export const adminAPI = {
    getUsers: async (params?: { page?: number; per_page?: number }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<{ users: any[]; pagination: any }>(`/admin/users?${query}`);
    },

    suspendUser: async (userId: number) => {
        return apiRequest(`/admin/users/${userId}/suspend`, { method: 'PUT' });
    },

    activateUser: async (userId: number) => {
        return apiRequest(`/admin/users/${userId}/activate`, { method: 'PUT' });
    },

    getStats: async () => {
        return apiRequest<any>('/admin/stats');
    },

    getHealth: async () => {
        return apiRequest<any>('/admin/health');
    },
};

// Subscription API
export const subscriptionAPI = {
    getSubscription: async () => {
        return apiRequest<any>('/subscription');
    },
};

// Payment Methods API
export const paymentMethodsAPI = {
    getPaymentMethods: async () => {
        return apiRequest<{ payment_methods: any[] }>('/payment-methods');
    },

    addPaymentMethod: async (data: {
        card_number: string;
        card_holder_name: string;
        expiry_month: string;
        expiry_year: string;
        billing_address?: string;
        city?: string;
        zip_code?: string;
        country?: string;
    }) => {
        return apiRequest<{ payment_method: any }>('/payment-methods', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    deletePaymentMethod: async (id: number) => {
        return apiRequest(`/payment-methods/${id}`, {
            method: 'DELETE',
        });
    },

    setDefaultPaymentMethod: async (id: number) => {
        return apiRequest(`/payment-methods/${id}/default`, {
            method: 'PUT',
        });
    },
};
