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
 * Invoice API Service
 */
const invoiceAPI = {
    /**
     * Generate invoice for an order
     * @param {String} orderId - Order ID
     * @param {Boolean} sendEmail - Whether to send email (default: true)
     * @returns {Promise}
     */
    generateInvoice: async (orderId, sendEmail = true) => {
        try {
            const response = await api.post(`/invoices/generate/${orderId}`, { sendEmail });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Download invoice PDF
     * @param {String} orderId - Order ID
     * @returns {Promise<Blob>}
     */
    downloadInvoice: async (orderId) => {
        try {
            const response = await api.get(`/invoices/download/${orderId}`, {
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${orderId}.pdf`);
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
     * View invoice PDF in new tab
     * @param {String} orderId - Order ID
     * @returns {Promise}
     */
    viewInvoice: async (orderId) => {
        try {
            const token = getAuthToken();
            const url = `${API_URL}/invoices/view/${orderId}?token=${token}`;
            window.open(url, '_blank');
            return { success: true };
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get invoice details for an order
     * @param {String} orderId - Order ID
     * @returns {Promise}
     */
    getInvoiceDetails: async (orderId) => {
        try {
            const response = await api.get(`/invoices/order/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Resend invoice email
     * @param {String} orderId - Order ID
     * @returns {Promise}
     */
    resendInvoice: async (orderId) => {
        try {
            const response = await api.post(`/invoices/resend/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default invoiceAPI;
