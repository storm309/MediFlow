import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept':        'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

// Attach stored token on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('mediflow_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('mediflow_token');
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
