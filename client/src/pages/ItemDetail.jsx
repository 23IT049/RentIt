import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    Chip,
    CircularProgress,
    Alert,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';
import { itemsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingDialog, setBookingDialog] = useState(false);
    const [bookingData, setBookingData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await itemsAPI.getOne(id);
            setItem(response.data.item);
        } catch (err) {
            setError('Failed to load item');
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setBookingLoading(true);
        try {
            await bookingsAPI.create({
                item: item._id,
                startDate: bookingData.startDate,
                notes: bookingData.notes
            });
            alert('Booking created successfully! Check your dashboard.');
            setBookingDialog(false);
            navigate('/dashboard?tab=bookings');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <Container sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                        <CircularProgress sx={{ color: '#9333ea' }} />
                    </Box>
                </Container>
            </>
        );
    }

    if (error || !item) {
        return (
            <>
                <Navbar />
                <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                    <Alert severity="error">{error || 'Item not found'}</Alert>
                </Container>
            </>
        );
    }

    const isVendor = user?._id === item.vendor._id;

    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                <Grid container spacing={4}>
                    {/* Image */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ backgroundColor: '#2a2a2a' }}>
                            <img
                                src={item.image}
                                alt={item.title}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </Paper>
                    </Grid>

                    {/* Details */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
                            {item.title}
                        </Typography>

                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, color: '#ccc' }}>
                            {item.description}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Chip 
                                label={item.category} 
                                size="small" 
                                sx={{ backgroundColor: '#9333ea', color: 'white' }}
                            />
                        </Box>

                        <Typography variant="h5" color="primary" sx={{ mb: 2, color: '#9333ea' }}>
                            ₹{item.price} / day
                        </Typography>

                        {item.deposit > 0 && (
                            <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                                Security Deposit: ₹{item.deposit}
                            </Typography>
                        )}

                        <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                            <strong>Location:</strong> {item.location}
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                            <strong>Condition:</strong> {item.condition}
                        </Typography>

                        {item.features && item.features.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                                    <strong>Features:</strong>
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {item.features.map((feature, index) => (
                                        <Chip key={index} label={feature} variant="outlined" size="small" 
                                            sx={{ borderColor: '#9333ea', color: '#9333ea' }} />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        <Paper elevation={2} sx={{ p: 2, mt: 3, bgcolor: '#333' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PersonIcon sx={{ color: '#9333ea' }} />
                                <Typography variant="h6" sx={{ color: 'white' }}>Vendor</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ color: '#ccc' }}>{item.vendor.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ color: '#888' }}>
                                {item.vendor.email}
                            </Typography>
                        </Paper>

                        {!isVendor && item.available && (
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{ mt: 3, backgroundColor: '#9333ea' }}
                                onClick={() => setBookingDialog(true)}
                            >
                                Book Now
                            </Button>
                        )}

                        {isVendor && (
                            <Alert severity="info" sx={{ mt: 3 }}>
                                This is your item
                            </Alert>
                        )}
                    </Grid>
                </Grid>
            </Container>

            {/* Booking Dialog */}
            <Dialog 
                open={bookingDialog} 
                onClose={() => setBookingDialog(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: { backgroundColor: '#2a2a2a', color: 'white' }
                }}
            >
                <DialogTitle sx={{ color: 'white' }}>Book {item.title}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={bookingData.startDate}
                            onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                            InputLabelProps={{ shrink: true, style: { color: '#ccc' } }}
                            InputProps={{ style: { color: 'white' } }}
                            sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#555',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#9333ea',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#9333ea',
                                    },
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Notes (Optional)"
                            multiline
                            rows={3}
                            value={bookingData.notes}
                            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                            InputLabelProps={{ shrink: true, style: { color: '#ccc' } }}
                            InputProps={{ style: { color: 'white' } }}
                            sx={{ 
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#555',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#9333ea',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#9333ea',
                                    },
                                }
                            }}
                        />
                        <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#333', color: 'white' }}>
                            <Typography variant="body2" gutterBottom>
                                <strong>Rental Period:</strong> 24 hours
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Rental Price:</strong> ₹{item.price}
                            </Typography>
                            {item.deposit > 0 && (
                                <Typography variant="body2" gutterBottom>
                                    <strong>Security Deposit:</strong> ₹{item.deposit}
                                </Typography>
                            )}
                            <Typography variant="h6" sx={{ mt: 1 }}>
                                <strong>Total:</strong> ₹{item.price + (item.deposit || 0)}
                            </Typography>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a' }}>
                    <Button onClick={() => setBookingDialog(false)} sx={{ color: '#ccc' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleBooking}
                        disabled={bookingLoading}
                        sx={{ backgroundColor: '#9333ea' }}
                    >
                        {bookingLoading ? 'Creating...' : 'Confirm Booking'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ItemDetail;
