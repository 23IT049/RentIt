/**
 * Order Adapter Utility
 * Converts Booking objects to Order-like structure for invoice generation
 */

/**
 * Convert a Booking to Order format for invoice generation
 * @param {Object} booking - Booking object from database
 * @returns {Object} Order-like object
 */
const adaptBookingToOrder = (booking) => {
    if (!booking) return null;

    // If it's already an Order (has orderNumber), return as is
    if (booking.orderNumber) {
        return booking;
    }

    // Convert Booking to Order format
    const adaptedOrder = {
        _id: booking._id,
        orderNumber: `ORD-${booking._id.toString().slice(-8).toUpperCase()}`,
        customer: booking.renter || booking.customer,
        vendor: booking.vendor,

        // Convert single item to items array
        items: [{
            product: booking.item,
            productName: booking.item?.title || 'Rental Item',
            quantity: 1,
            rentalStartDate: booking.startDate,
            rentalEndDate: booking.endDate,
            pricingType: 'daily',
            unitPrice: booking.item?.price || 0,
            totalPrice: booking.totalAmount || 0
        }],

        // Pricing information
        pricing: {
            subtotal: booking.totalAmount || 0,
            deliveryCharges: 0,
            securityDeposit: booking.item?.deposit || 0,
            discountAmount: 0,
            totalAmount: booking.totalAmount || 0,
            paidAmount: 0,
            balanceAmount: booking.totalAmount || 0
        },

        // Status
        status: booking.status,
        paymentStatus: 'pending',

        // Delivery information
        delivery: {
            type: 'pickup',
            address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'India'
            }
        },

        // Invoice information
        invoice: {
            generated: false,
            invoiceNumber: null,
            invoiceUrl: null,
            generatedAt: null,
            dueDate: null
        },

        // Dates
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
    };

    return adaptedOrder;
};

/**
 * Prepare order data for invoice generation
 * Ensures all required fields are populated
 * @param {Object} order - Order or Booking object
 * @returns {Object} Prepared order object
 */
const prepareOrderForInvoice = async (order) => {
    // Adapt if it's a booking
    const adaptedOrder = adaptBookingToOrder(order);

    if (!adaptedOrder) {
        throw new Error('Invalid order data');
    }

    // Ensure customer has required fields
    if (!adaptedOrder.customer) {
        throw new Error('Order must have a customer');
    }

    // Set default values for missing fields
    if (!adaptedOrder.delivery) {
        adaptedOrder.delivery = {
            type: 'pickup',
            address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'India'
            }
        };
    }

    // Ensure pricing has all required fields
    if (!adaptedOrder.pricing) {
        adaptedOrder.pricing = {
            subtotal: 0,
            deliveryCharges: 0,
            securityDeposit: 0,
            discountAmount: 0,
            totalAmount: 0,
            paidAmount: 0,
            balanceAmount: 0
        };
    }

    // Ensure invoice object exists
    if (!adaptedOrder.invoice) {
        adaptedOrder.invoice = {
            generated: false,
            invoiceNumber: null,
            invoiceUrl: null,
            generatedAt: null,
            dueDate: null
        };
    }

    return adaptedOrder;
};

module.exports = {
    adaptBookingToOrder,
    prepareOrderForInvoice
};
