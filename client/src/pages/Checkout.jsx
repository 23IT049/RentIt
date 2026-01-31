import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    Switch,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Badge,
    AppBar,
    Toolbar,
    Breadcrumbs,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Search,
    Favorite,
    ShoppingCart,
    AccountCircle,
    Edit,
    Home,
    LocalShipping,
    Store
} from '@mui/icons-material';

const Checkout = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        deliveryMethod: 'standard',
        customerName: 'John Doe',
        deliveryAddress: '123 Main Street, Apt 4B, New York, NY 10001',
        billingSameAsDelivery: true,
        billingAddress: '',
        rentalStartDate: new Date(),
        rentalEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        specialInstructions: ''
    });

    const [orderSummary, setOrderSummary] = useState({
        productName: 'Professional Camera Kit',
        dailyRate: 25.00,
        deliveryCharges: 0,
        subTotal: 175.00,
        total: 175.00,
        cartItems: 1
    });

    const [editAddressOpen, setEditAddressOpen] = useState(false);
    const [editAddressData, setEditAddressData] = useState({
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Calculate rental days and update totals
        const rentalDays = Math.ceil((formData.rentalEndDate - formData.rentalStartDate) / (1000 * 60 * 60 * 24));
        const subTotal = rentalDays * orderSummary.dailyRate;
        const deliveryCharges = formData.deliveryMethod === 'standard' ? 0 : 5;
        const total = subTotal + deliveryCharges;

        setOrderSummary(prev => ({
            ...prev,
            subTotal,
            deliveryCharges,
            total
        }));
    }, [formData.rentalStartDate, formData.rentalEndDate, formData.deliveryMethod, orderSummary.dailyRate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleDeliveryMethodChange = (e) => {
        setFormData({
            ...formData,
            deliveryMethod: e.target.value
        });
    };

    const handleBillingToggle = (e) => {
        setFormData({
            ...formData,
            billingSameAsDelivery: e.target.checked
        });
    };

    const handleEditAddress = () => {
        // Parse current address for editing
        const addressParts = formData.deliveryAddress.split(', ');
        setEditAddressData({
            name: formData.customerName,
            street: addressParts[0] || '',
            city: addressParts[1] || '',
            state: addressParts[2]?.split(' ')[0] || '',
            zipCode: addressParts[2]?.split(' ')[1] || ''
        });
        setEditAddressOpen(true);
    };

    const handleSaveAddress = () => {
        const fullAddress = `${editAddressData.street}, ${editAddressData.city}, ${editAddressData.state} ${editAddressData.zipCode}`;
        setFormData({
            ...formData,
            customerName: editAddressData.name,
            deliveryAddress: fullAddress,
            billingAddress: formData.billingSameAsDelivery ? fullAddress : formData.billingAddress
        });
        setEditAddressOpen(false);
    };

    const handleConfirmOrder = async () => {
        setLoading(true);
        setError('');

        try {
            // Simulate API call to confirm order
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Navigate to success page or payment page
            navigate('/order-confirmation');
        } catch (err) {
            setError('Failed to confirm order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: 'white' }}>
            {/* Header */}
            <AppBar position="static" sx={{ backgroundColor: '#2a2a2a', boxShadow: 'none' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
                        Your Logo
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                        <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Products</Link>
                        <Link to="/terms" style={{ color: 'white', textDecoration: 'none' }}>Terms & Condition</Link>
                        <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About us</Link>
                        <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact Us</Link>
                    </Box>

                    <TextField
                        size="small"
                        placeholder="Search..."
                        sx={{
                            backgroundColor: '#3a3a3a',
                            borderRadius: 1,
                            mr: 2,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#555' },
                                '&:hover fieldset': { borderColor: '#777' },
                                '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                            },
                            '& .MuiInputBase-input': { color: 'white' }
                        }}
                        InputProps={{
                            startAdornment: <Search sx={{ color: '#888', mr: 1 }} />
                        }}
                    />

                    <IconButton sx={{ color: 'white' }}>
                        <Favorite />
                    </IconButton>
                    <IconButton sx={{ color: 'white' }}>
                        <Badge badgeContent={orderSummary.cartItems} color="error">
                            <ShoppingCart />
                        </Badge>
                    </IconButton>
                    <IconButton sx={{ color: 'white' }}>
                        <AccountCircle />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Breadcrumbs */}
            <Container maxWidth="lg" sx={{ mt: 2, mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ color: '#ccc' }}>
                    <Link to="/" style={{ color: '#9333ea', textDecoration: 'none' }}>Breadcrumb</Link>
                    <Link to="/cart" style={{ color: '#9333ea', textDecoration: 'none' }}>Order</Link>
                    <Typography sx={{ color: 'white' }}>Address</Typography>
                    <Typography sx={{ color: '#888' }}>Payment</Typography>
                </Breadcrumbs>
            </Container>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ pb: 4 }}>
                <Grid container spacing={4}>
                    {/* Left Column - Delivery & Billing */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4, backgroundColor: '#2a2a2a', color: 'white' }}>
                            <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 3 }}>
                                Delivery & Billing Information
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}

                            {/* Delivery Method */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
                                    Delivery Method
                                </Typography>
                                <RadioGroup
                                    name="deliveryMethod"
                                    value={formData.deliveryMethod}
                                    onChange={handleDeliveryMethodChange}
                                >
                                    <FormControlLabel
                                        value="standard"
                                        control={<Radio sx={{ color: '#9333ea', '&.Mui-checked': { color: '#9333ea' } }} />}
                                        label={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <LocalShipping sx={{ mr: 1, color: '#9333ea' }} />
                                                    <Typography>Standard Delivery</Typography>
                                                </Box>
                                                <Typography sx={{ color: '#4caf50', fontWeight: 'bold' }}>Free</Typography>
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="pickup"
                                        control={<Radio sx={{ color: '#9333ea', '&.Mui-checked': { color: '#9333ea' } }} />}
                                        label={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Store sx={{ mr: 1, color: '#9333ea' }} />
                                                    <Typography>Pick up from Store</Typography>
                                                </Box>
                                                <Typography sx={{ color: '#4caf50', fontWeight: 'bold' }}>Free</Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </Box>

                            <Divider sx={{ backgroundColor: '#555', mb: 4 }} />

                            {/* Delivery Address */}
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ color: 'white' }}>
                                        Delivery Address
                                    </Typography>
                                    <IconButton onClick={handleEditAddress} sx={{ color: '#9333ea' }}>
                                        <Edit />
                                    </IconButton>
                                </Box>
                                
                                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {formData.customerName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#ccc', mb: 2 }}>
                                    {formData.deliveryAddress}
                                </Typography>
                                
                                <Button
                                    variant="outlined"
                                    startIcon={<Home />}
                                    sx={{
                                        borderColor: '#9333ea',
                                        color: '#9333ea',
                                        '&:hover': {
                                            borderColor: '#7c3aed',
                                            backgroundColor: 'rgba(147, 51, 234, 0.1)'
                                        }
                                    }}
                                >
                                    Main Address
                                </Button>
                            </Box>

                            <Divider sx={{ backgroundColor: '#555', mb: 4 }} />

                            {/* Billing Address */}
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
                                    Billing Address
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Switch
                                        checked={formData.billingSameAsDelivery}
                                        onChange={handleBillingToggle}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#9333ea',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#9333ea',
                                            }
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ ml: 2, color: '#ccc' }}>
                                        If enabled, it will make Billing and Delivery address the same.
                                    </Typography>
                                </Box>
                                
                                {!formData.billingSameAsDelivery && (
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Billing Address"
                                        name="billingAddress"
                                        value={formData.billingAddress}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#444' },
                                                '&:hover fieldset': { borderColor: '#666' },
                                                '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                            },
                                            '& .MuiInputLabel-root': { color: '#888' },
                                            '& .MuiInputBase-input': { color: 'white' }
                                        }}
                                    />
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right Column - Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, backgroundColor: '#2a2a2a', color: 'white' }}>
                            <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 3 }}>
                                Order Summary
                            </Typography>

                            {/* Product Details */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            backgroundColor: '#444',
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 2
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: '#888' }}>Image</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {orderSummary.productName}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#ccc' }}>
                                            {formatCurrency(orderSummary.dailyRate)} / day
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ backgroundColor: '#555', mb: 3 }} />

                            {/* Rental Period */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
                                    Rental Period
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Start Date & Time"
                                    type="datetime-local"
                                    value={formData.rentalStartDate.toISOString().slice(0, 16)}
                                    onChange={(e) => setFormData({...formData, rentalStartDate: new Date(e.target.value)})}
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#444' },
                                            '&:hover fieldset': { borderColor: '#666' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                        },
                                        '& .MuiInputLabel-root': { color: '#888' },
                                        '& .MuiInputBase-input': { color: 'white' }
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    fullWidth
                                    label="End Date & Time"
                                    type="datetime-local"
                                    value={formData.rentalEndDate.toISOString().slice(0, 16)}
                                    onChange={(e) => setFormData({...formData, rentalEndDate: new Date(e.target.value)})}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#444' },
                                            '&:hover fieldset': { borderColor: '#666' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                        },
                                        '& .MuiInputLabel-root': { color: '#888' },
                                        '& .MuiInputBase-input': { color: 'white' }
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>

                            <Divider sx={{ backgroundColor: '#555', mb: 3 }} />

                            {/* Cost Breakdown */}
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body1">Delivery Charges</Typography>
                                    <Typography variant="body1">
                                        {orderSummary.deliveryCharges === 0 ? 'Free' : formatCurrency(orderSummary.deliveryCharges)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body1">Sub Total</Typography>
                                    <Typography variant="body1">{formatCurrency(orderSummary.subTotal)}</Typography>
                                </Box>
                                <Divider sx={{ backgroundColor: '#555', mb: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                        {formatCurrency(orderSummary.total)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Box>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleConfirmOrder}
                                    disabled={loading}
                                    sx={{
                                        mb: 2,
                                        backgroundColor: '#9333ea',
                                        '&:hover': {
                                            backgroundColor: '#7c3aed'
                                        }
                                    }}
                                >
                                    {loading ? 'Processing...' : 'Confirmed >'}
                                </Button>
                                
                                <Typography variant="body2" align="center" sx={{ color: '#888', mb: 2 }}>
                                    OR
                                </Typography>
                                
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    component={Link}
                                    to="/cart"
                                    sx={{
                                        borderColor: '#9333ea',
                                        color: '#9333ea',
                                        '&:hover': {
                                            borderColor: '#7c3aed',
                                            backgroundColor: 'rgba(147, 51, 234, 0.1)'
                                        }
                                    }}
                                >
                                    &lt; Back to Cart
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Edit Address Dialog */}
            <Dialog open={editAddressOpen} onClose={() => setEditAddressOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>Edit Address</DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    <TextField
                        fullWidth
                        label="Name"
                        value={editAddressData.name}
                        onChange={(e) => setEditAddressData({...editAddressData, name: e.target.value})}
                        margin="normal"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: '#666' },
                                '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                            },
                            '& .MuiInputLabel-root': { color: '#888' },
                            '& .MuiInputBase-input': { color: 'white' }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Street Address"
                        value={editAddressData.street}
                        onChange={(e) => setEditAddressData({...editAddressData, street: e.target.value})}
                        margin="normal"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: '#666' },
                                '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                            },
                            '& .MuiInputLabel-root': { color: '#888' },
                            '& .MuiInputBase-input': { color: 'white' }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="City"
                        value={editAddressData.city}
                        onChange={(e) => setEditAddressData({...editAddressData, city: e.target.value})}
                        margin="normal"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: '#666' },
                                '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                            },
                            '& .MuiInputLabel-root': { color: '#888' },
                            '& .MuiInputBase-input': { color: 'white' }
                        }}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="State"
                                value={editAddressData.state}
                                onChange={(e) => setEditAddressData({...editAddressData, state: e.target.value})}
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#444' },
                                        '&:hover fieldset': { borderColor: '#666' },
                                        '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                    },
                                    '& .MuiInputLabel-root': { color: '#888' },
                                    '& .MuiInputBase-input': { color: 'white' }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Zip Code"
                                value={editAddressData.zipCode}
                                onChange={(e) => setEditAddressData({...editAddressData, zipCode: e.target.value})}
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#444' },
                                        '&:hover fieldset': { borderColor: '#666' },
                                        '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                    },
                                    '& .MuiInputLabel-root': { color: '#888' },
                                    '& .MuiInputBase-input': { color: 'white' }
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a', p: 3 }}>
                    <Button onClick={() => setEditAddressOpen(false)} sx={{ color: '#888' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveAddress} variant="contained" sx={{ backgroundColor: '#9333ea' }}>
                        Save Address
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Checkout;
