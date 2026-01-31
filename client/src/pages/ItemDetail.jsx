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
                <Container sx={{ py: 4, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                        <CircularProgress sx={{ color: '#0284C7' }} />
                    </Box>
                </Container>
            </>
        );
    }

    if (error || !item) {
        return (
            <>
                <Navbar />
                <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
                    <Alert severity="error">{error || 'Item not found'}</Alert>
                </Container>
            </>
        );
    }

    const isVendor = user?._id === item.vendor._id;

    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
                <Grid container spacing={4}>
                    {/* Image */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ backgroundColor: '#FFFFFF' }}>
                            <img
                                src={item.image}
                                alt={item.title}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </Paper>
                    </Grid>

                    {/* Details */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom sx={{ color: '#0284C7' }}>
                            {item.title}
                        </Typography>

                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, color: '#0284C7' }}>
                            {item.description}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Chip
                                label={item.category}
                                size="small"
                                sx={{ backgroundColor: '#0284C7', color: 'white' }}
                            />
                        </Box>

                        <Typography variant="h5" color="primary" sx={{ mb: 2, color: '#0284C7' }}>
                            ₹{item.price} / day
                        </Typography>

                        {item.deposit > 0 && (
                            <Typography variant="body2" sx={{ mb: 2, color: '#0284C7' }}>
                                Security Deposit: ₹{item.deposit}
                            </Typography>
                        )}

                        <Typography variant="body2" sx={{ mb: 2, color: '#0284C7' }}>
                            <strong>Location:</strong> {item.location}
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 2, color: '#0284C7' }}>
                            <strong>Condition:</strong> {item.condition}
                        </Typography>

                        {item.features && item.features.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1, color: '#0284C7' }}>
                                    <strong>Features:</strong>
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {item.features.map((feature, index) => (
                                        <Chip key={index} label={feature} variant="outlined" size="small"
                                            sx={{ borderColor: '#0284C7', color: '#0284C7' }} />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        <Paper elevation={2} sx={{ p: 2, mt: 3, bgcolor: '#FFFFFF', border: '1px solid #BAE6FD' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PersonIcon sx={{ color: '#0284C7' }} />
                                <Typography variant="h6" sx={{ color: '#0284C7' }}>Vendor</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ color: '#0284C7' }}>{item.vendor.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ color: '#0284C7' }}>
                                {item.vendor.email}
                            </Typography>
                        </Paper>

                        {!isVendor && item.available && (
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{ mt: 3, backgroundColor: '#0284C7' }}
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
                    sx: { backgroundColor: '#FFFFFF', color: '#0284C7' }
                }}
            >
                <DialogTitle sx={{ color: '#0284C7' }}>Book {item.title}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={bookingData.startDate}
                            onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                            InputLabelProps={{ shrink: true, style: { color: '#0284C7' } }}
                            InputProps={{ style: { color: '#0284C7' } }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#BAE6FD',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#0284C7',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#0284C7',
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
                            InputLabelProps={{ shrink: true, style: { color: '#0284C7' } }}
                            InputProps={{ style: { color: '#0284C7' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#BAE6FD',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#0284C7',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#0284C7',
                                    },
                                }
                            }}
                        />
                        <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#FFFFFF', color: '#0284C7', border: '1px solid #BAE6FD' }}>
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
                <DialogActions sx={{ backgroundColor: '#FFFFFF' }}>
                    <Button onClick={() => setBookingDialog(false)} sx={{ color: '#0284C7' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleBooking}
                        disabled={bookingLoading}
                        sx={{ backgroundColor: '#0284C7' }}
                    >
                        {bookingLoading ? 'Creating...' : 'Confirm Booking'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ItemDetail;
