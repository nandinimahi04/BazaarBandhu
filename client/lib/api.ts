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

        if (response.status >= 400) {
            const errorData = await response.json();
            const errorMessage = errorData.error || 'Request failed';
            const errorDetails = errorData.details ? `: ${errorData.details}` : '';
            throw new Error(`${errorMessage}${errorDetails}`);
        }

        const data = await response.json();

        // The previous error check `if (!response.ok)` is now covered by `if (response.status >= 400)`
        // and the error message is more detailed.
        // This block is now only reached for successful responses (status < 400).

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
