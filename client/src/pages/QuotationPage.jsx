import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Button,
    TextField,
    Divider,
    IconButton,
    InputAdornment,
    CircularProgress,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Send as SendIcon,
    Print as PrintIcon,
    Receipt as InvoiceIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import VendorNavbar from '../components/VendorNavbar';
import quotationAPI from '../services/quotationApi';
import { itemsAPI } from '../services/api';
import vendorAPI from '../services/vendorApi';
import { toast } from 'react-toastify';

const QuotationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);

    // Quotation State
    const [quotation, setQuotation] = useState({
        quotationNumber: 'Draft',
        customer: null,
        status: 'quotation',
        orderDate: dayjs(),
        validUntil: dayjs().add(7, 'day'),
        invoiceAddress: { name: '', street: '', city: '', state: '', zipCode: '' },
        deliveryAddress: { name: '', street: '', city: '', state: '', zipCode: '' },
        rentalPeriod: { startDate: null, endDate: null },
        items: [],
        downpayment: { enabled: false, amount: 0, percentage: 0 },
        pricing: { subtotal: 0, taxes: 0, discount: 0, total: 0 },
        termsAndConditions: 'http://rentit.com/terms',
        notes: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
        if (isEditMode) {
            fetchQuotation(id);
        }
    }, [id]);

    const fetchCustomers = async () => {
        try {
            const response = await vendorAPI.getCustomers({ limit: 100 });
            if (response.data.success) {
                setCustomers(response.data.customers);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await itemsAPI.getMyItems();
            if (response.data.success) {
                setProducts(response.data.items || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchQuotation = async (quotationId) => {
        setLoading(true);
        try {
            const response = await quotationAPI.getQuotation(quotationId);
            let data = null; // Declare data here
            if (response.success && response.data) {
                data = response.data; // Assign data here
                // Convert strings to dayjs objects
                data.orderDate = dayjs(data.orderDate);
                data.validUntil = dayjs(data.validUntil);
                if (data.rentalPeriod) {
                    data.rentalPeriod.startDate = data.rentalPeriod.startDate ? dayjs(data.rentalPeriod.startDate) : null;
                    data.rentalPeriod.endDate = data.rentalPeriod.endDate ? dayjs(data.rentalPeriod.endDate) : null;
                }
                setQuotation(data);
            }

            if (data && data.status === 'quotation') setActiveTab(0);
            else if (data && data.status === 'quotation_sent') setActiveTab(1);
            else if (data && data.status === 'sale_order') setActiveTab(2);
        } catch (error) {
            toast.error('Failed to load quotation');
            navigate('/vendor-dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!quotation.customer) {
            toast.error('Please select a customer');
            return;
        }

        setSaving(true);
        try {
            // Prepare payload with IDs instead of objects
            const payload = {
                ...quotation,
                customer: quotation.customer._id,
                items: quotation.items.map(item => ({
                    ...item,
                    product: item.product ? item.product._id : null
                }))
            };

            // Let backend generate unique number if it's currently Draft
            if (payload.quotationNumber === 'Draft') {
                delete payload.quotationNumber;
            }

            if (isEditMode) {
                await quotationAPI.updateQuotation(id, payload);
                toast.success('Quotation updated successfully');
            } else {
                const newQuotation = await quotationAPI.createQuotation(payload);
                toast.success('Quotation created successfully');
                navigate(`/quotations/${newQuotation.data._id}`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to save quotation');
        } finally {
            setSaving(false);
        }
    };

    const handleSend = async () => {
        try {
            await quotationAPI.sendQuotation(id);
            toast.success('Quotation sent to customer');
            fetchQuotation(id);
        } catch (error) {
            toast.error('Failed to send quotation');
        }
    };

    const handleConfirm = async () => {
        try {
            await quotationAPI.confirmQuotation(id);
            toast.success('Quotation confirmed');
            fetchQuotation(id);
        } catch (error) {
            toast.error('Failed to confirm quotation');
        }
    };

    const handleAddItem = () => {
        setQuotation(prev => ({
            ...prev,
            items: [...prev.items, {
                product: null,
                quantity: 1,
                unit: 'Units',
                unitPrice: 0,
                pricingType: 'daily',
                taxes: 0,
                totalPrice: 0,
                rentalStartDate: prev.rentalPeriod.startDate,
                rentalEndDate: prev.rentalPeriod.endDate
            }]
        }));
    };

    const handleDeleteItem = (index) => {
        const newItems = [...quotation.items];
        newItems.splice(index, 1);
        setQuotation(prev => ({ ...prev, items: newItems }));
        calculateTotals(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...quotation.items];
        newItems[index][field] = value;
        if (field === 'product' && value) {
            // Default to price
            newItems[index].unitPrice = value.price || 0;
            newItems[index].quantity = 1;
        }
        if (['quantity', 'unitPrice', 'taxes'].includes(field) || field === 'product') {
            const qty = newItems[index].quantity || 0;
            const price = newItems[index].unitPrice || 0;
            newItems[index].totalPrice = qty * price;
        }
        setQuotation(prev => ({ ...prev, items: newItems }));
        calculateTotals(newItems);
    };

    const calculateTotals = (items) => {
        const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const taxAmount = subtotal * 0.18;
        const total = subtotal + taxAmount;
        setQuotation(prev => ({
            ...prev,
            pricing: { ...prev.pricing, subtotal, taxes: taxAmount, total }
        }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#FFFFFF' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
                <VendorNavbar />
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #BAE6FD' }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setQuotation({
                                        quotationNumber: 'Draft',
                                        customer: null,
                                        status: 'quotation',
                                        orderDate: dayjs(),
                                        validUntil: dayjs().add(7, 'day'),
                                        invoiceAddress: { name: '', street: '', city: '', state: '', zipCode: '' },
                                        deliveryAddress: { name: '', street: '', city: '', state: '', zipCode: '' },
                                        rentalPeriod: { startDate: null, endDate: null },
                                        items: [],
                                        downpayment: { enabled: false, amount: 0, percentage: 0 },
                                        pricing: { subtotal: 0, taxes: 0, discount: 0, total: 0 },
                                        termsAndConditions: 'http://rentit.com/terms',
                                        notes: ''
                                    });
                                    navigate('/quotations/new');
                                }}
                                sx={{ bgcolor: '#9333ea', '&:hover': { bgcolor: '#7928ca' } }}
                            >
                                New
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={saving}
                                sx={{ bgcolor: '#9333ea', '&:hover': { bgcolor: '#7928ca' } }}
                            >
                                Save
                            </Button>
                            <Typography variant="h6" sx={{ color: '#0284C7', fontWeight: 'bold' }}>
                                Rental Order {quotation.status === 'confirmed' ? <CheckCircleIcon color="success" /> : null}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="contained" startIcon={<SendIcon />} onClick={handleSend} disabled={!id} sx={{ bgcolor: '#9333ea', '&:hover': { bgcolor: '#7928ca' } }}>
                                Send By Email
                            </Button>
                            <Button variant="outlined" onClick={handleConfirm} disabled={!id || quotation.status === 'sale_order'} sx={{ color: '#0284C7', borderColor: '#0284C7' }}>
                                Confirm
                            </Button>
                            <Button variant="outlined" startIcon={<PrintIcon />} sx={{ color: '#0284C7', borderColor: '#0284C7' }}>
                                Print
                            </Button>
                            <Button variant="contained" startIcon={<InvoiceIcon />} sx={{ bgcolor: '#9333ea', '&:hover': { bgcolor: '#7928ca' } }}>
                                Create Invoice
                            </Button>
                        </Box>
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ minHeight: 0 }}>
                            <Tab label="Quotation" sx={{ minHeight: 0, py: 1 }} />
                            <Tab label="Quotation Sent" sx={{ minHeight: 0, py: 1 }} />
                            <Tab label="Sale Order" sx={{ minHeight: 0, py: 1 }} />
                        </Tabs>
                    </Paper>

                    <Paper sx={{ p: 4, border: '1px solid #BAE6FD', minHeight: '600px' }}>
                        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#000' }}>
                            {quotation.quotationNumber}
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2, alignItems: 'center', mb: 2 }}>
                                    <Typography sx={{ fontWeight: 'bold' }}>Customer</Typography>
                                    <Autocomplete
                                        options={customers}
                                        getOptionLabel={(option) => option.name || ''}
                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                        value={quotation.customer}
                                        onChange={(e, v) => setQuotation({ ...quotation, customer: v })}
                                        renderInput={(params) => <TextField {...params} size="small" variant="standard" />}
                                    />
                                    <Typography sx={{ fontWeight: 'bold' }}>Invoice Address</Typography>
                                    <TextField
                                        size="small"
                                        variant="standard"
                                        value={quotation.invoiceAddress.street}
                                        onChange={(e) => setQuotation({ ...quotation, invoiceAddress: { ...quotation.invoiceAddress, street: e.target.value } })}
                                    />
                                    <Typography sx={{ fontWeight: 'bold' }}>Delivery Address</Typography>
                                    <TextField
                                        size="small"
                                        variant="standard"
                                        value={quotation.deliveryAddress.street}
                                        onChange={(e) => setQuotation({ ...quotation, deliveryAddress: { ...quotation.deliveryAddress, street: e.target.value } })}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2, alignItems: 'center', mb: 2 }}>
                                    <Typography sx={{ fontWeight: 'bold' }}>Order Date</Typography>
                                    <DatePicker
                                        value={quotation.orderDate}
                                        onChange={(newValue) => setQuotation({ ...quotation, orderDate: newValue })}
                                        slotProps={{ textField: { size: 'small', variant: 'standard' } }}
                                    />
                                    <Typography sx={{ fontWeight: 'bold' }}>Rental Period</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <DatePicker
                                            label="Start"
                                            value={quotation.rentalPeriod.startDate}
                                            onChange={(v) => setQuotation({ ...quotation, rentalPeriod: { ...quotation.rentalPeriod, startDate: v } })}
                                            slotProps={{ textField: { size: 'small', variant: 'standard' } }}
                                        />
                                        <Typography>→</Typography>
                                        <DatePicker
                                            label="End"
                                            value={quotation.rentalPeriod.endDate}
                                            onChange={(v) => setQuotation({ ...quotation, rentalPeriod: { ...quotation.rentalPeriod, endDate: v } })}
                                            slotProps={{ textField: { size: 'small', variant: 'standard' } }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4 }}>
                            <Tabs value={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                                <Tab label="Order Lines" />
                            </Tabs>
                            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell width="120">Quantity</TableCell>
                                            <TableCell width="100">Unit</TableCell>
                                            <TableCell width="150">Unit Price</TableCell>
                                            <TableCell width="100">Taxes</TableCell>
                                            <TableCell width="150" align="right">Amount</TableCell>
                                            <TableCell width="50"></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {quotation.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Autocomplete
                                                        options={products}
                                                        getOptionLabel={(option) => option.title || ''}
                                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                                        value={item.product}
                                                        onChange={(e, v) => handleItemChange(index, 'product', v)}
                                                        renderInput={(params) => <TextField {...params} variant="standard" />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                                        variant="standard"
                                                        InputProps={{ inputProps: { min: 1 } }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={item.unit}
                                                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                        variant="standard"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                                                        variant="standard"
                                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">18%</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography>₹{item.totalPrice.toLocaleString()}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => handleDeleteItem(index)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={7}>
                                                <Button startIcon={<AddIcon />} onClick={handleAddItem}>Add a product</Button>
                                                <Button startIcon={<AddIcon />}>Add a note</Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                            <Box sx={{ width: 300 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>Untaxed Amount:</Typography>
                                    <Typography>₹{quotation.pricing.subtotal.toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>Taxes:</Typography>
                                    <Typography>₹{quotation.pricing.taxes.toLocaleString()}</Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="h6">Total:</Typography>
                                    <Typography variant="h6">₹{quotation.pricing.total.toLocaleString()}</Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 4 }}>
                            <TextField
                                label="Terms & Conditions"
                                fullWidth
                                variant="standard"
                                value={quotation.termsAndConditions}
                                onChange={(e) => setQuotation({ ...quotation, termsAndConditions: e.target.value })}
                            />
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </LocalizationProvider>
    );
};

export default QuotationPage;
