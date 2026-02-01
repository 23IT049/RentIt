import { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    Grid,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Receipt,
    Download,
    Email,
    Visibility,
    CheckCircle,
    Warning,
    Error as ErrorIcon
} from '@mui/icons-material';
import invoiceAPI from '../services/invoiceApi';

/**
 * Invoice Card Component
 * Displays invoice information and actions
 */
const InvoiceCard = ({ order, onInvoiceGenerated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [invoiceData, setInvoiceData] = useState(order?.invoice || null);

    const hasInvoice = invoiceData?.generated || order?.invoice?.generated;

    /**
     * Generate invoice
     */
    const handleGenerateInvoice = async (sendEmail = true) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await invoiceAPI.generateInvoice(order._id, sendEmail);
            setInvoiceData(result.invoice);
            setSuccess(
                sendEmail && result.invoice.emailSent
                    ? 'Invoice generated and sent via email!'
                    : 'Invoice generated successfully!'
            );

            if (onInvoiceGenerated) {
                onInvoiceGenerated(result.invoice);
            }
        } catch (err) {
            setError(err.message || 'Failed to generate invoice');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Download invoice
     */
    const handleDownloadInvoice = async () => {
        setLoading(true);
        setError(null);

        try {
            await invoiceAPI.downloadInvoice(order._id);
            setSuccess('Invoice downloaded successfully!');
        } catch (err) {
            setError(err.message || 'Failed to download invoice');
        } finally {
            setLoading(false);
        }
    };

    /**
     * View invoice
     */
    const handleViewInvoice = async () => {
        try {
            await invoiceAPI.viewInvoice(order._id);
        } catch (err) {
            setError(err.message || 'Failed to view invoice');
        }
    };

    /**
     * Resend invoice email
     */
    const handleResendInvoice = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await invoiceAPI.resendInvoice(order._id);
            setSuccess('Invoice email sent successfully!');
        } catch (err) {
            setError(err.message || 'Failed to send invoice email');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get payment status chip
     */
    const getPaymentStatusChip = () => {
        const balanceAmount = invoiceData?.balanceAmount || order?.pricing?.balanceAmount || 0;

        if (balanceAmount === 0) {
            return <Chip icon={<CheckCircle />} label="Fully Paid" color="success" size="small" />;
        } else if (order?.pricing?.paidAmount > 0) {
            return <Chip icon={<Warning />} label="Partially Paid" color="warning" size="small" />;
        } else {
            return <Chip icon={<ErrorIcon />} label="Unpaid" color="error" size="small" />;
        }
    };

    return (
        <Card sx={{ border: '1px solid #BAE6FD', borderRadius: 2 }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Receipt sx={{ color: '#0284C7', fontSize: 28 }} />
                        <Typography variant="h6" sx={{ color: '#0284C7', fontWeight: 600 }}>
                            Invoice
                        </Typography>
                    </Box>
                    {hasInvoice && getPaymentStatusChip()}
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {hasInvoice ? (
                    <>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Invoice Number
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {invoiceData?.invoiceNumber || order?.invoice?.invoiceNumber}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Generated Date
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {new Date(
                                        invoiceData?.generatedAt || order?.invoice?.generatedAt
                                    ).toLocaleDateString('en-IN')}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Due Date
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {new Date(
                                        invoiceData?.dueDate || order?.invoice?.dueDate
                                    ).toLocaleDateString('en-IN')}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Total Amount
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="primary">
                                    ₹{(invoiceData?.totalAmount || order?.pricing?.totalAmount || 0).toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Paid Amount
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="success.main">
                                    ₹{(invoiceData?.paidAmount || order?.pricing?.paidAmount || 0).toFixed(2)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Balance Due
                                </Typography>
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    color={(invoiceData?.balanceAmount || order?.pricing?.balanceAmount || 0) > 0 ? 'error.main' : 'success.main'}
                                >
                                    ₹{(invoiceData?.balanceAmount || order?.pricing?.balanceAmount || 0).toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>

                        {invoiceData?.gstBreakdown && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    GST Breakdown
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={4}>
                                        <Typography variant="caption">CGST</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            ₹{invoiceData.gstBreakdown.cgst.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="caption">SGST</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            ₹{invoiceData.gstBreakdown.sgst.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="caption">Total GST</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            ₹{invoiceData.gstBreakdown.totalGST.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        <Box display="flex" gap={1} mt={3} flexWrap="wrap">
                            <Tooltip title="Download Invoice">
                                <Button
                                    variant="contained"
                                    startIcon={loading ? <CircularProgress size={20} /> : <Download />}
                                    onClick={handleDownloadInvoice}
                                    disabled={loading}
                                    size="small"
                                >
                                    Download
                                </Button>
                            </Tooltip>

                            <Tooltip title="View Invoice">
                                <Button
                                    variant="outlined"
                                    startIcon={<Visibility />}
                                    onClick={handleViewInvoice}
                                    size="small"
                                >
                                    View
                                </Button>
                            </Tooltip>

                            <Tooltip title="Resend Email">
                                <Button
                                    variant="outlined"
                                    startIcon={loading ? <CircularProgress size={20} /> : <Email />}
                                    onClick={handleResendInvoice}
                                    disabled={loading}
                                    size="small"
                                >
                                    Resend
                                </Button>
                            </Tooltip>
                        </Box>
                    </>
                ) : (
                    <Box textAlign="center" py={3}>
                        <Receipt sx={{ fontSize: 64, color: '#BAE6FD', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            No invoice generated yet for this order
                        </Typography>
                        <Box display="flex" gap={1} justifyContent="center">
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} /> : <Receipt />}
                                onClick={() => handleGenerateInvoice(true)}
                                disabled={loading || order?.status === 'draft' || order?.status === 'cancelled'}
                            >
                                Generate & Send Invoice
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={loading ? <CircularProgress size={20} /> : <Receipt />}
                                onClick={() => handleGenerateInvoice(false)}
                                disabled={loading || order?.status === 'draft' || order?.status === 'cancelled'}
                            >
                                Generate Only
                            </Button>
                        </Box>
                        {(order?.status === 'draft' || order?.status === 'cancelled') && (
                            <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
                                Invoice can only be generated for confirmed orders
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default InvoiceCard;
