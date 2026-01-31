import api from './api';

const vendorAPI = {
    // Get vendor's customers
    getCustomers: (params) => api.get('/vendor/customers', { params }),
};

export default vendorAPI;
