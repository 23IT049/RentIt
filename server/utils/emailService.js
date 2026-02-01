const nodemailer = require('nodemailer');

/**
 * Email Service for sending notifications
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.initialize();
    }

    /**
     * Initialize email transporter
     */
    initialize() {
        // Check if email credentials are configured
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
            console.warn('⚠️  Email service not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env');
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT || 587,
                secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            console.log('✅ Email service initialized');
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
        }
    }

    /**
     * Check if email service is configured
     */
    isConfigured() {
        return this.transporter !== null;
    }

    /**
     * Send email
     * @param {Object} options - Email options
     * @returns {Promise}
     */
    async sendEmail(options) {
        if (!this.isConfigured()) {
            console.warn('Email service not configured. Email not sent.');
            return { success: false, message: 'Email service not configured' };
        }

        try {
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME || 'RentIt'}" <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments || []
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Email sending failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send invoice email to customer
     * @param {Object} order - Order object
     * @param {String} invoicePath - Path to invoice PDF
     * @returns {Promise}
     */
    async sendInvoiceEmail(order, invoicePath) {
        const customerEmail = order.customer?.email;
        const invoiceNumber = order.invoice?.invoiceNumber;
        const orderNumber = order.orderNumber;

        if (!customerEmail) {
            throw new Error('Customer email not found');
        }

        const emailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                    }
                    .content {
                        background: #ffffff;
                        padding: 30px;
                        border: 1px solid #e5e7eb;
                        border-top: none;
                    }
                    .invoice-details {
                        background: #F7F9FC;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .invoice-details p {
                        margin: 8px 0;
                    }
                    .invoice-details strong {
                        color: #0284C7;
                    }
                    .amount {
                        font-size: 24px;
                        color: #0284C7;
                        font-weight: bold;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .button {
                        display: inline-block;
                        background: #0284C7;
                        color: white;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 6px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        background: #F7F9FC;
                        padding: 20px;
                        text-align: center;
                        border-radius: 0 0 10px 10px;
                        font-size: 12px;
                        color: #666;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    .items-table th {
                        background: #0284C7;
                        color: white;
                        padding: 10px;
                        text-align: left;
                    }
                    .items-table td {
                        padding: 10px;
                        border-bottom: 1px solid #e5e7eb;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🧾 Invoice Generated</h1>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${order.customer?.name}</strong>,</p>
                    
                    <p>Thank you for your rental order! Your invoice has been generated and is attached to this email.</p>
                    
                    <div class="invoice-details">
                        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                        <p><strong>Order Number:</strong> ${orderNumber}</p>
                        <p><strong>Invoice Date:</strong> ${new Date(order.invoice?.generatedAt).toLocaleDateString('en-IN')}</p>
                        <p><strong>Due Date:</strong> ${new Date(order.invoice?.dueDate).toLocaleDateString('en-IN')}</p>
                    </div>

                    <h3>Order Summary</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.productName}</td>
                                    <td>${item.quantity}</td>
                                    <td>₹${item.totalPrice.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="amount">
                        Total Amount: ₹${order.pricing.totalAmount.toFixed(2)}
                    </div>

                    ${order.pricing.balanceAmount > 0 ? `
                        <p style="color: #DC2626; text-align: center; font-weight: bold;">
                            Balance Due: ₹${order.pricing.balanceAmount.toFixed(2)}
                        </p>
                    ` : `
                        <p style="color: #16A34A; text-align: center; font-weight: bold;">
                            ✅ Fully Paid
                        </p>
                    `}

                    <p>Please find the detailed invoice attached as a PDF document.</p>
                    
                    <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
                    
                    <p>Best regards,<br>
                    <strong>RentIt Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>© ${new Date().getFullYear()} RentIt. All rights reserved.</p>
                </div>
            </body>
            </html>
        `;

        const emailText = `
            Invoice Generated - ${invoiceNumber}
            
            Dear ${order.customer?.name},
            
            Thank you for your rental order! Your invoice has been generated.
            
            Invoice Number: ${invoiceNumber}
            Order Number: ${orderNumber}
            Invoice Date: ${new Date(order.invoice?.generatedAt).toLocaleDateString('en-IN')}
            Due Date: ${new Date(order.invoice?.dueDate).toLocaleDateString('en-IN')}
            
            Total Amount: ₹${order.pricing.totalAmount.toFixed(2)}
            Balance Due: ₹${order.pricing.balanceAmount.toFixed(2)}
            
            Please find the detailed invoice attached.
            
            Best regards,
            RentIt Team
        `;

        return await this.sendEmail({
            to: customerEmail,
            subject: `Invoice ${invoiceNumber} - Order ${orderNumber}`,
            html: emailHTML,
            text: emailText,
            attachments: [
                {
                    filename: `Invoice-${invoiceNumber}.pdf`,
                    path: invoicePath
                }
            ]
        });
    }

    /**
     * Send order confirmation email
     * @param {Object} order - Order object
     * @returns {Promise}
     */
    async sendOrderConfirmationEmail(order) {
        const customerEmail = order.customer?.email;
        const orderNumber = order.orderNumber;

        if (!customerEmail) {
            throw new Error('Customer email not found');
        }

        const emailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #16A34A 0%, #22C55E 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                    }
                    .content {
                        background: #ffffff;
                        padding: 30px;
                        border: 1px solid #e5e7eb;
                        border-top: none;
                    }
                    .order-details {
                        background: #F7F9FC;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .footer {
                        background: #F7F9FC;
                        padding: 20px;
                        text-align: center;
                        border-radius: 0 0 10px 10px;
                        font-size: 12px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>✅ Order Confirmed!</h1>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${order.customer?.name}</strong>,</p>
                    
                    <p>Your rental order has been confirmed successfully!</p>
                    
                    <div class="order-details">
                        <p><strong>Order Number:</strong> ${orderNumber}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                        <p><strong>Total Amount:</strong> ₹${order.pricing.totalAmount.toFixed(2)}</p>
                    </div>

                    <p>We will send you the invoice shortly.</p>
                    
                    <p>Thank you for choosing RentIt!</p>
                    
                    <p>Best regards,<br>
                    <strong>RentIt Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} RentIt. All rights reserved.</p>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail({
            to: customerEmail,
            subject: `Order Confirmed - ${orderNumber}`,
            html: emailHTML
        });
    }

    /**
     * Send vendor notification email
     * @param {Object} order - Order object
     * @param {String} vendorEmail - Vendor email
     * @returns {Promise}
     */
    async sendVendorNotificationEmail(order, vendorEmail) {
        if (!vendorEmail) {
            throw new Error('Vendor email not found');
        }

        const emailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #ffffff;
                        padding: 30px;
                        border: 1px solid #e5e7eb;
                        border-top: none;
                    }
                    .footer {
                        background: #F7F9FC;
                        padding: 20px;
                        text-align: center;
                        border-radius: 0 0 10px 10px;
                        font-size: 12px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🔔 New Order Received</h1>
                </div>
                
                <div class="content">
                    <p>Hello,</p>
                    
                    <p>You have received a new rental order!</p>
                    
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Customer:</strong> ${order.customer?.name}</p>
                    <p><strong>Total Amount:</strong> ₹${order.pricing.totalAmount.toFixed(2)}</p>
                    
                    <p>Please log in to your vendor dashboard to view the details and process the order.</p>
                    
                    <p>Best regards,<br>
                    <strong>RentIt Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} RentIt. All rights reserved.</p>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail({
            to: vendorEmail,
            subject: `New Order - ${order.orderNumber}`,
            html: emailHTML
        });
    }
}

// Export singleton instance
module.exports = new EmailService();
