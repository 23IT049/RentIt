import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token (same method as main api.js)
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Create axios instance with auth
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Quotation API Service
 */
const quotationAPI = {
    /**
     * Create new quotation
     * @param {Object} quotationData - Quotation data
     * @returns {Promise}
     */
    createQuotation: async (quotationData) => {
        try {
            const response = await api.post('/quotations', quotationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get all quotations
     * @param {Object} params - Query parameters (page, limit, status, etc.)
     * @returns {Promise}
     */
    getQuotations: async (params = {}) => {
        try {
            const response = await api.get('/quotations', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get single quotation by ID
     * @param {String} id - Quotation ID
     * @returns {Promise}
     */
    getQuotation: async (id) => {
        try {
            const response = await api.get(`/quotations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update quotation
     * @param {String} id - Quotation ID
     * @param {Object} quotationData - Updated quotation data
     * @returns {Promise}
     */
    updateQuotation: async (id, quotationData) => {
        try {
            const response = await api.put(`/quotations/${id}`, quotationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Send quotation to customer
     * @param {String} id - Quotation ID
     * @returns {Promise}
     */
    sendQuotation: async (id) => {
        try {
            const response = await api.post(`/quotations/${id}/send`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Confirm quotation (convert to sale order)
     * @param {String} id - Quotation ID
     * @returns {Promise}
     */
    confirmQuotation: async (id) => {
        try {
            const response = await api.post(`/quotations/${id}/confirm`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Print quotation (generate PDF)
     * @param {String} id - Quotation ID
     * @returns {Promise}
     */
    printQuotation: async (id) => {
        try {
            const response = await api.get(`/quotations/${id}/print`, {
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Quotation-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create invoice from quotation
     * @param {String} id - Quotation ID
     * @returns {Promise}
     */
    createInvoice: async (id) => {
        try {
            const response = await api.post(`/quotations/${id}/create-invoice`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete quotation
     * @param {String} id - Quotation ID
     * @returns {Promise}
     */
    deleteQuotation: async (id) => {
        try {
            const response = await api.delete(`/quotations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create quotation from cart
     * @param {Object} cartData - Cart data
     * @returns {Promise}
     */
    createFromCart: async (cartData) => {
        try {
            const response = await api.post('/quotations/from-cart', cartData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default quotationAPI;
