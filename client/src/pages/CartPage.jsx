import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    IconButton,
    TextField,
    Divider,
    Avatar,
    Card,
    CardContent
} from '@mui/material';
import {
    ArrowBack,
    Add,
    Remove,
    Delete,
    ShoppingCart
} from '@mui/icons-material';
import CustomerNavbar from '../components/CustomerNavbar';

const CartPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [cart, setCart] = useState(location.state?.cart || []);
    const [rentalPeriod, setRentalPeriod] = useState({
        startDate: '',
        endDate: ''
    });

    const handleQuantityChange = (itemId, change) => {
        setCart(cart.map(item =>
            item._id === itemId
                ? { ...item, quantity: Math.max(1, item.quantity + change) }
                : item
        ));
    };

    const handleRemoveItem = (itemId) => {
        setCart(cart.filter(item => item._id !== itemId));
    };

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const deliveryCharges = 0; // Free delivery
    const total = calculateSubtotal() + deliveryCharges;

    const handleCheckout = () => {
        alert('Proceeding to checkout...');
        // Add checkout logic here
    };

    const handleContinueShopping = () => {
        navigate('/dashboard', {
            state: {
                cart,
                initialTab: 1 // Browse Items tab
            }
        });
    };

    return (
        <>
            <CustomerNavbar cart={cart} onCartClick={() => { }} />
            <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={handleContinueShopping} sx={{ color: '#333' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" sx={{ color: '#333', fontWeight: 600 }}>
                        Your Cart
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Left Side - Cart Items */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 3, backgroundColor: 'white', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Order Summary
                            </Typography>

                            {cart.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <ShoppingCart sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                                        Your cart is empty
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={handleContinueShopping}
                                        sx={{
                                            backgroundColor: '#4caf50',
                                            '&:hover': { backgroundColor: '#45a049' }
                                        }}
                                    >
                                        Continue Shopping
                                    </Button>
                                </Box>
                            ) : (
                                <>
                                    {cart.map((item, index) => (
                                        <Box key={item._id}>
                                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                <Avatar
                                                    src={item.image || 'https://via.placeholder.com/80'}
                                                    variant="rounded"
                                                    sx={{ width: 80, height: 80 }}
                                                />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                        {item.title}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                                        ₹{item.price}/day
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#888' }}>
                                                        Date and time for which the product is rented.
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                                        ₹{item.price * item.quantity}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleQuantityChange(item._id, -1)}
                                                            sx={{ border: '1px solid #ddd' }}
                                                        >
                                                            <Remove fontSize="small" />
                                                        </IconButton>
                                                        <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                                                            {item.quantity}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleQuantityChange(item._id, 1)}
                                                            sx={{ border: '1px solid #ddd' }}
                                                        >
                                                            <Add fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    sx={{ color: '#666', textTransform: 'none' }}
                                                >
                                                    Remove
                                                </Button>
                                                <Button
                                                    size="small"
                                                    sx={{ color: '#666', textTransform: 'none' }}
                                                >
                                                    Save for Later
                                                </Button>
                                            </Box>

                                            {index < cart.length - 1 && <Divider sx={{ my: 2 }} />}
                                        </Box>
                                    ))}

                                    <Divider sx={{ my: 3 }} />

                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleContinueShopping}
                                        sx={{
                                            color: '#333',
                                            borderColor: '#ddd',
                                            textTransform: 'none',
                                            py: 1.5,
                                            '&:hover': {
                                                borderColor: '#999',
                                                backgroundColor: '#f9f9f9'
                                            }
                                        }}
                                    >
                                        Continue Shopping →
                                    </Button>
                                </>
                            )}
                        </Paper>
                    </Grid>

                    {/* Right Side - Rental Period & Summary */}
                    <Grid item xs={12} md={5}>
                        {/* Rental Period */}
                        <Paper sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Rental Period
                            </Typography>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="Start Date & Time"
                                value={rentalPeriod.startDate}
                                onChange={(e) => setRentalPeriod({ ...rentalPeriod, startDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="End Date & Time"
                                value={rentalPeriod.endDate}
                                onChange={(e) => setRentalPeriod({ ...rentalPeriod, endDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Paper>

                        {/* Price Summary */}
                        <Paper sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body1">Delivery Charges</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {deliveryCharges === 0 ? '-' : `₹${deliveryCharges}`}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body1">Sub Total</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    ₹{calculateSubtotal().toFixed(2)}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    ₹{total.toFixed(2)}
                                </Typography>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                sx={{
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    py: 1.5,
                                    mb: 2,
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    '&:hover': {
                                        backgroundColor: '#45a049'
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#ccc'
                                    }
                                }}
                            >
                                Apply Coupon
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{
                                    borderColor: '#ddd',
                                    color: '#333',
                                    py: 1.5,
                                    mb: 2,
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    '&:hover': {
                                        borderColor: '#999',
                                        backgroundColor: '#f9f9f9'
                                    }
                                }}
                            >
                                Pay with Save Card
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                sx={{
                                    borderColor: '#ddd',
                                    color: '#333',
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    '&:hover': {
                                        borderColor: '#999',
                                        backgroundColor: '#f9f9f9'
                                    }
                                }}
                            >
                                Checkout
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default CartPage;
