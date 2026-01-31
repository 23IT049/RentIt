import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me')
};

// Items API
export const itemsAPI = {
    getAll: (params) => api.get('/items', { params }),
    getOne: (id) => api.get(`/items/${id}`),
    create: (data) => api.post('/items', data),
    update: (id, data) => api.put(`/items/${id}`, data),
    delete: (id) => api.delete(`/items/${id}`),
    getMyItems: () => api.get('/items/vendor/me')
};

// Bookings API
export const bookingsAPI = {
    create: (data) => api.post('/bookings', data),
    getAll: (params) => api.get('/bookings', { params }),
    getOne: (id) => api.get(`/bookings/${id}`),
    confirm: (id) => api.put(`/bookings/${id}/confirm`),
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
    complete: (id) => api.put(`/bookings/${id}/complete`)
};

export default api;
