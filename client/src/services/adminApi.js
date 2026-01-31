import api from './api';

// Admin API Service
export const adminAPI = {
    // Dashboard Statistics
    getStats: () => api.get('/admin/stats'),

    // User Management
    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Vendor Management
    getVendors: (params) => api.get('/admin/vendors', { params }),
    getPendingVendors: () => api.get('/admin/vendors/pending'),
    approveVendor: (id) => api.put(`/admin/vendors/${id}/approve`),
    rejectVendor: (id, reason) => api.put(`/admin/vendors/${id}/reject`, { reason }),

    // Order Management
    getOrders: (params) => api.get('/admin/orders', { params }),
    updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),

    // System Settings
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (data) => api.put('/admin/settings', data),

    // Reports & Analytics
    getRevenueReport: (params) => api.get('/admin/reports/revenue', { params }),
    getUserReport: () => api.get('/admin/reports/users'),

    // Product Management
    getProducts: (params) => api.get('/admin/products', { params }),
    getPendingProducts: () => api.get('/admin/products/pending'),
    approveProduct: (id) => api.put(`/admin/products/${id}/approve`),
    rejectProduct: (id, reason) => api.put(`/admin/products/${id}/reject`, { reason }),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),

    // Export Functions
    exportUsers: () => {
        const token = localStorage.getItem('token');
        window.open(`${api.defaults.baseURL}/admin/export/users?token=${token}`, '_blank');
    },
    exportOrders: () => {
        const token = localStorage.getItem('token');
        window.open(`${api.defaults.baseURL}/admin/export/orders?token=${token}`, '_blank');
    }
};

export default adminAPI;
