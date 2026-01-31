import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Button
} from '@mui/material';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';
import { bookingsAPI } from '../services/api';

const MyBookings = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const role = activeTab === 0 ? 'customer' : 'vendor';
            const response = await bookingsAPI.getAll({ role });
            setBookings(response.data.bookings);
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await bookingsAPI.cancel(id);
                fetchBookings();
                alert('Booking cancelled');
            } catch (err) {
                alert('Failed to cancel booking');
            }
        }
    };

    const handleConfirm = async (id) => {
        try {
            await bookingsAPI.confirm(id);
            fetchBookings();
            alert('Booking confirmed');
        } catch (err) {
            alert('Failed to confirm booking');
        }
    };

    const handleComplete = async (id) => {
        try {
            await bookingsAPI.complete(id);
            fetchBookings();
            alert('Booking completed');
        } catch (err) {
            alert('Failed to complete booking');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            confirmed: 'info',
            active: 'success',
            completed: 'default',
            cancelled: 'error'
        };
        return colors[status] || 'default';
    };

    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: 'white' }}>
                    My Bookings
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: '#555', mb: 3 }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(e, v) => setActiveTab(v)}
                        sx={{
                            '& .MuiTab-root': {
                                color: '#ccc',
                                '&.Mui-selected': {
                                    color: '#9333ea'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#9333ea'
                            }
                        }}
                    >
                        <Tab label="As Customer" />
                        <Tab label="As Vendor" />
                    </Tabs>
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                        <CircularProgress sx={{ color: '#9333ea' }} />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : bookings.length === 0 ? (
                    <Paper elevation={2} sx={{ p: 6, textAlign: 'center', backgroundColor: '#2a2a2a' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ color: '#ccc' }}>
                            No bookings found
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {bookings.map((booking) => (
                            <Grid item key={booking._id} xs={12} md={6}>
                                <Card sx={{ backgroundColor: '#2a2a2a' }}>
                                    <Grid container>
                                        <Grid item xs={4}>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={booking.item.image}
                                                alt={booking.item.title}
                                            />
                                        </Grid>
                                        <Grid item xs={8}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                                                    {booking.item.title}
                                                </Typography>

                                                <Box sx={{ mb: 2 }}>
                                                    <Chip
                                                        label={booking.status.toUpperCase()}
                                                        color={getStatusColor(booking.status)}
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Chip
                                                        label={booking.paymentStatus.toUpperCase()}
                                                        color={booking.paymentStatus === 'paid' ? 'success' : 'warning'}
                                                        size="small"
                                                    />
                                                </Box>

                                                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ color: '#ccc' }}>
                                                    <strong>Start:</strong> {format(new Date(booking.startDate), 'PPp')}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ color: '#ccc' }}>
                                                    <strong>End:</strong> {format(new Date(booking.endDate), 'PPp')}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ color: '#ccc' }}>
                                                    <strong>Total:</strong> ₹{booking.totalAmount}
                                                </Typography>

                                                {activeTab === 0 && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ color: '#ccc' }}>
                                                        <strong>Vendor:</strong> {booking.vendor.name}
                                                    </Typography>
                                                )}

                                                {activeTab === 1 && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ color: '#ccc' }}>
                                                        <strong>Renter:</strong> {booking.renter.name}
                                                    </Typography>
                                                )}

                                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            {activeTab === 1 && (
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    onClick={() => handleConfirm(booking._id)}
                                                                    sx={{ backgroundColor: '#9333ea' }}
                                                                >
                                                                    Confirm
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                onClick={() => handleCancel(booking._id)}
                                                                sx={{ borderColor: '#f44336', color: '#f44336' }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </>
                                                    )}

                                                    {booking.status === 'confirmed' && activeTab === 1 && (
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="success"
                                                            onClick={() => handleComplete(booking._id)}
                                                            sx={{ backgroundColor: '#4caf50' }}
                                                        >
                                                            Mark Complete
                                                        </Button>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </>
    );
};

export default MyBookings;
