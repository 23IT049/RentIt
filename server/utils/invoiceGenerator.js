const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Calculate GST (Goods and Services Tax) for India
 * @param {Number} amount - Base amount
 * @param {Number} gstRate - GST rate in percentage (default 18%)
 * @returns {Object} - GST breakdown
 */
const calculateGST = (amount, gstRate = 18) => {
    const gstAmount = (amount * gstRate) / 100;
    const cgst = gstAmount / 2; // Central GST
    const sgst = gstAmount / 2; // State GST
    const totalAmount = amount + gstAmount;

    return {
        baseAmount: parseFloat(amount.toFixed(2)),
        gstRate: gstRate,
        cgst: parseFloat(cgst.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2)),
        totalGST: parseFloat(gstAmount.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
    };
};

/**
 * Generate Invoice PDF
 * @param {Object} order - Order object with populated fields
 * @param {Object} settings - System settings for company details
 * @returns {Promise<String>} - Path to generated PDF
 */
const generateInvoicePDF = async (order, settings = {}) => {
    return new Promise((resolve, reject) => {
        try {
            // Ensure invoices directory exists
            const invoicesDir = path.join(__dirname, '..', 'invoices');
            if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir, { recursive: true });
            }

            // Generate invoice number if not exists
            const invoiceNumber = order.invoice?.invoiceNumber || `INV-${Date.now()}`;
            const fileName = `${invoiceNumber}.pdf`;
            const filePath = path.join(invoicesDir, fileName);

            // Create PDF document
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Company Details (Header)
            doc.fontSize(20)
                .fillColor('#0284C7')
                .text(settings.business?.companyName || 'RentIt', 50, 50);

            doc.fontSize(10)
                .fillColor('#666666')
                .text(settings.business?.address?.street || 'Company Address', 50, 80)
                .text(`${settings.business?.address?.city || 'City'}, ${settings.business?.address?.state || 'State'} - ${settings.business?.address?.zipCode || 'ZIP'}`, 50, 95)
                .text(`Email: ${settings.business?.supportEmail || 'support@rentit.com'}`, 50, 110)
                .text(`Phone: ${settings.business?.supportPhone || 'N/A'}`, 50, 125);

            // Invoice Title
            doc.fontSize(24)
                .fillColor('#0284C7')
                .text('TAX INVOICE', 400, 50, { align: 'right' });

            // Invoice Details (Right side)
            doc.fontSize(10)
                .fillColor('#333333')
                .text(`Invoice No: ${invoiceNumber}`, 400, 80, { align: 'right' })
                .text(`Order No: ${order.orderNumber}`, 400, 95, { align: 'right' })
                .text(`Date: ${new Date(order.invoice?.generatedAt || Date.now()).toLocaleDateString('en-IN')}`, 400, 110, { align: 'right' })
                .text(`Due Date: ${new Date(order.invoice?.dueDate || Date.now()).toLocaleDateString('en-IN')}`, 400, 125, { align: 'right' });

            // Horizontal line
            doc.moveTo(50, 150)
                .lineTo(550, 150)
                .strokeColor('#0284C7')
                .lineWidth(2)
                .stroke();

            // Customer Details
            doc.fontSize(12)
                .fillColor('#0284C7')
                .text('Bill To:', 50, 170);

            doc.fontSize(10)
                .fillColor('#333333')
                .text(order.customer?.name || 'Customer Name', 50, 190)
                .text(order.customer?.companyName || '', 50, 205)
                .text(`GSTIN: ${order.customer?.gstNo || 'N/A'}`, 50, 220)
                .text(order.customer?.email || '', 50, 235);

            // Delivery Address (if available)
            if (order.delivery?.address) {
                doc.fontSize(12)
                    .fillColor('#0284C7')
                    .text('Delivery Address:', 320, 170);

                doc.fontSize(10)
                    .fillColor('#333333')
                    .text(order.delivery.address.name || '', 320, 190)
                    .text(order.delivery.address.street || '', 320, 205)
                    .text(`${order.delivery.address.city || ''}, ${order.delivery.address.state || ''}`, 320, 220)
                    .text(order.delivery.address.zipCode || '', 320, 235);
            }

            // Table Header
            const tableTop = 280;
            doc.fontSize(10)
                .fillColor('#FFFFFF')
                .rect(50, tableTop, 500, 25)
                .fill('#0284C7');

            doc.fillColor('#FFFFFF')
                .text('Item', 60, tableTop + 8)
                .text('Rental Period', 220, tableTop + 8)
                .text('Qty', 340, tableTop + 8)
                .text('Rate', 380, tableTop + 8)
                .text('Amount', 470, tableTop + 8, { align: 'right', width: 70 });

            // Table Rows
            let yPosition = tableTop + 35;
            doc.fillColor('#333333');

            order.items.forEach((item, index) => {
                const startDate = new Date(item.rentalStartDate).toLocaleDateString('en-IN');
                const endDate = new Date(item.rentalEndDate).toLocaleDateString('en-IN');
                const rentalPeriod = `${startDate} to ${endDate}`;

                // Alternate row background
                if (index % 2 === 0) {
                    doc.rect(50, yPosition - 5, 500, 25).fill('#F7F9FC');
                }

                doc.fillColor('#333333')
                    .fontSize(9)
                    .text(item.productName || 'Product', 60, yPosition, { width: 150 })
                    .text(rentalPeriod, 220, yPosition, { width: 110 })
                    .text(item.quantity.toString(), 340, yPosition)
                    .text(`₹${item.unitPrice.toFixed(2)}`, 380, yPosition)
                    .text(`₹${item.totalPrice.toFixed(2)}`, 470, yPosition, { align: 'right', width: 70 });

                yPosition += 25;
            });

            // Totals Section
            yPosition += 20;
            const totalsX = 350;

            // Subtotal
            doc.fontSize(10)
                .fillColor('#333333')
                .text('Subtotal:', totalsX, yPosition)
                .text(`₹${order.pricing.subtotal.toFixed(2)}`, 470, yPosition, { align: 'right', width: 70 });

            yPosition += 20;

            // Delivery Charges
            if (order.pricing.deliveryCharges > 0) {
                doc.text('Delivery Charges:', totalsX, yPosition)
                    .text(`₹${order.pricing.deliveryCharges.toFixed(2)}`, 470, yPosition, { align: 'right', width: 70 });
                yPosition += 20;
            }

            // Security Deposit
            if (order.pricing.securityDeposit > 0) {
                doc.text('Security Deposit:', totalsX, yPosition)
                    .text(`₹${order.pricing.securityDeposit.toFixed(2)}`, 470, yPosition, { align: 'right', width: 70 });
                yPosition += 20;
            }

            // Discount
            if (order.pricing.discountAmount > 0) {
                doc.fillColor('#16A34A')
                    .text('Discount:', totalsX, yPosition)
                    .text(`-₹${order.pricing.discountAmount.toFixed(2)}`, 470, yPosition, { align: 'right', width: 70 });
                yPosition += 20;
                doc.fillColor('#333333');
            }

            // Calculate GST
            const baseAmount = order.pricing.subtotal +
                order.pricing.deliveryCharges +
                order.pricing.securityDeposit -
                order.pricing.discountAmount;

            const gstCalculation = calculateGST(baseAmount, settings.payment?.taxRate || 18);

            // CGST
            doc.fontSize(9)
                .text(`CGST (${gstCalculation.gstRate / 2}%):`, totalsX, yPosition)
                .text(`₹${gstCalculation.cgst.toFixed(2)}`, 470, yPosition, { align: 'right', width: 70 });
            yPosition += 18;

            // SGST
            doc.text(`SGST (${gstCalculation.gstRate / 2}%):`, totalsX, yPosition)
                .text(`₹${gstCalculation.sgst.toFixed(2)}`, 470, yPosition, { align: 'right', width: 70 });
            yPosition += 25;

            // Total Amount
            doc.fontSize(12)
                .fillColor('#FFFFFF')
                .rect(350, yPosition - 5, 200, 30)
                .fill('#0284C7');

            doc.fillColor('#FFFFFF')
                .text('Total Amount:', totalsX + 10, yPosition + 5)
                .text(`₹${gstCalculation.totalAmount.toFixed(2)}`, 470, yPosition + 5, { align: 'right', width: 70 });

            yPosition += 40;

            // Payment Status
            doc.fontSize(10)
                .fillColor('#333333')
                .text('Paid Amount:', totalsX, yPosition)
                .text(`₹${order.pricing.paidAmount.toFixed(2)}`, 470, yPosition, { align: 'right', width: 70 });
            yPosition += 20;

            doc.fontSize(11)
                .fillColor(order.pricing.balanceAmount > 0 ? '#DC2626' : '#16A34A')
                .text('Balance Due:', totalsX, yPosition)
                .text(`₹${order.pricing.balanceAmount.toFixed(2)}`, 470, yPosition, { align: 'right', width: 70 });

            // Footer
            const footerY = 720;
            doc.moveTo(50, footerY)
                .lineTo(550, footerY)
                .strokeColor('#CCCCCC')
                .lineWidth(1)
                .stroke();

            doc.fontSize(9)
                .fillColor('#666666')
                .text('Terms & Conditions:', 50, footerY + 10)
                .fontSize(8)
                .text('1. Payment is due within 30 days of invoice date.', 50, footerY + 25)
                .text('2. Late returns will incur additional charges.', 50, footerY + 38)
                .text('3. Security deposit will be refunded after item return and inspection.', 50, footerY + 51);

            doc.fontSize(8)
                .fillColor('#0284C7')
                .text('Thank you for your business!', 50, footerY + 70, { align: 'center', width: 500 });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve({
                    filePath,
                    fileName,
                    invoiceNumber,
                    gstCalculation
                });
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateInvoicePDF,
    calculateGST
};
