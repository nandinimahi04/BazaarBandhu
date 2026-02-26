const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5004/api' : '/api');

export const api = {
    async request(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');
        const isFormData = options.body instanceof FormData;

        const headers = {
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {})
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    },

    get(endpoint: string, options: RequestInit = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint: string, body: any, options: RequestInit = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    },

    put(endpoint: string, body: any, options: RequestInit = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    patch(endpoint: string, body: any, options: RequestInit = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint: string, options: RequestInit = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
};
