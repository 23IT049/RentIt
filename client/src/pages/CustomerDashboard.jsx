import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tab,
    Tabs,
    Alert,
    LinearProgress,
    CircularProgress,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider
} from '@mui/material';
import {
    ShoppingCart,
    Favorite,
    History,
    Assessment,
    LocalShipping,
    Event,
    Star,
    Visibility,
    Edit,
    Delete,
    Add,
    TrendingUp,
    Schedule,
    Payment
} from '@mui/icons-material';
import CustomerNavbar from '../components/CustomerNavbar';
import { bookingsAPI } from '../services/api';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Dynamic state
    const [stats, setStats] = useState({
        activeRentals: 0,
        totalBookings: 0,
        wishlistItems: 0,
        totalSpent: 0
    });

    const [myBookings, setMyBookings] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [rentalHistory, setRentalHistory] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Fetch customer's data
            const bookingsResponse = await bookingsAPI.getAll({ role: 'customer' });
            const bookings = bookingsResponse.data.bookings || [];

            setMyBookings(bookings);

            // Calculate stats
            const activeRentals = bookings.filter(booking => 
                booking.status === 'renting' || booking.status === 'confirmed'
            ).length;

            const totalSpent = bookings.reduce((total, booking) => {
                if (booking.status === 'completed') {
                    return total + (booking.totalAmount || 0);
                }
                return total;
            }, 0);

            const completedBookings = bookings.filter(booking => 
                booking.status === 'completed'
            );

            setStats({
                activeRentals,
                totalBookings: bookings.length,
                wishlistItems: 0, // Will implement wishlist API later
                totalSpent
            });

            // Set rental history from completed bookings
            setRentalHistory(completedBookings.map(booking => ({
                id: booking.id,
                itemName: booking.item?.title || 'Item',
                vendorName: booking.vendor?.name || 'Vendor',
                rentalPeriod: `${booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'} - ${booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}`,
                totalAmount: booking.totalAmount || 0,
                status: booking.status,
                rating: 5, // Will implement rating system later
                review: 'Great experience!' // Will implement review system later
            })));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'completed': return 'default';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <Card sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="h6" component="div">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div">
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="textSecondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ color, fontSize: 40 }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <>
                <CustomerNavbar />
                <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                        <CircularProgress sx={{ color: '#9333ea' }} />
                    </Box>
                </Container>
            </>
        );
    }

    return (
        <>
            <CustomerNavbar />
            <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
                    Customer Dashboard
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Rentals"
                        value={stats.activeRentals}
                        icon={<LocalShipping />}
                        color="#4caf50"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Bookings"
                        value={stats.totalBookings}
                        icon={<ShoppingCart />}
                        color="#9333ea"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Wishlist"
                        value={stats.wishlistItems}
                        icon={<Favorite />}
                        color="#ff9800"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Spent"
                        value={`$${stats.totalSpent}`}
                        icon={<Payment />}
                        color="#2196f3"
                    />
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        borderBottom: 1,
                        borderColor: '#444',
                        '& .MuiTab-root': { color: '#ccc' },
                        '& .Mui-selected': { color: 'white' }
                    }}
                >
                    <Tab icon={<ShoppingCart />} label="My Bookings" />
                    <Tab icon={<Favorite />} label="Wishlist" />
                    <Tab icon={<History />} label="Rental History" />
                    <Tab icon={<Assessment />} label="Analytics" />
                </Tabs>

                {/* My Bookings Tab */}
                {tabValue === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">My Current Bookings</Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => navigate('/')}
                                sx={{ backgroundColor: '#9333ea' }}
                            >
                                Browse Items
                            </Button>
                        </Box>

                        {myBookings.length === 0 ? (
                                <Alert severity="info">
                                    No bookings found. Start by browsing and renting items!
                                </Alert>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: 'white' }}>Item</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Vendor</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Rental Period</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Total</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {myBookings.map((booking) => (
                                                <TableRow key={booking.id}>
                                                    <TableCell sx={{ color: '#ccc' }}>
                                                        <Box display="flex" alignItems="center">
                                                            <Avatar
                                                                src={booking.item?.image || 'https://via.placeholder.com/40x40'}
                                                                sx={{ mr: 2, width: 40, height: 40 }}
                                                            />
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {booking.item?.title || 'Item'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#ccc' }}>
                                                        {booking.vendor?.name || 'Vendor'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#ccc' }}>
                                                        {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'} - 
                                                        {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#ccc' }}>
                                                        ${booking.totalAmount || 0}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={booking.status}
                                                            color={getStatusColor(booking.status)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton sx={{ color: '#ccc' }}>
                                                            <Visibility />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                    </Box>
                )}

                {/* Wishlist Tab */}
                {tabValue === 1 && (
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">My Wishlist</Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => navigate('/')}
                                sx={{ backgroundColor: '#9333ea' }}
                            >
                                Browse More Items
                            </Button>
                        </Box>

                        {wishlist.length === 0 ? (
                            <Alert severity="info">
                                Your wishlist is empty. Browse items and add them to your wishlist!
                            </Alert>
                        ) : (
                            <Grid container spacing={3}>
                                {wishlist.map((item) => (
                                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                                        <Card sx={{ backgroundColor: '#333', color: 'white' }}>
                                            <CardContent>
                                                <Box display="flex" alignItems="center" mb={2}>
                                                    <Avatar
                                                        src={item.image}
                                                        sx={{ mr: 2, width: 50, height: 50 }}
                                                    />
                                                    <Box flexGrow={1}>
                                                        <Typography variant="h6">{item.name}</Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {item.vendorName}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box display="flex" justifyContent="space-between" mb={2}>
                                                    <Typography variant="body2">
                                                        ${item.dailyRate}/day
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        ${item.weeklyRate}/week
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" mb={2}>
                                                    <Star sx={{ color: '#ffc107', mr: 1, fontSize: 16 }} />
                                                    <Typography variant="body2">
                                                        {item.rating} ({item.reviews} reviews)
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" gap={1}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        sx={{ backgroundColor: '#9333ea' }}
                                                    >
                                                        Book Now
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ color: '#f44336', borderColor: '#f44336' }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* Rental History Tab */}
                {tabValue === 2 && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Rental History & Reviews
                        </Typography>
                        {rentalHistory.length === 0 ? (
                            <Alert severity="info">
                                No rental history yet. Your completed rentals will appear here.
                            </Alert>
                        ) : (
                            <List>
                                {rentalHistory.map((rental) => (
                                    <Box key={rental.id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={rental.itemName}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {rental.vendorName} • {rental.rentalPeriod}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            Total: ${rental.totalAmount}
                                                        </Typography>
                                                        {rental.review && (
                                                            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                                                "{rental.review}"
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Star sx={{ color: '#ffc107', fontSize: 16 }} />
                                                    <Typography variant="body2">{rental.rating}</Typography>
                                                </Box>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <Divider />
                                    </Box>
                                ))}
                            </List>
                        )}
                    </Box>
                )}

                {/* Analytics Tab */}
                {tabValue === 3 && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Your Rental Analytics
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ backgroundColor: '#333', color: 'white', p: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Spending Overview
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={65}
                                        sx={{ mb: 2, backgroundColor: '#555' }}
                                    />
                                    <Typography variant="body2">
                                        You've spent $2,450 this year
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Average per rental: $163
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ backgroundColor: '#333', color: 'white', p: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Favorite Categories
                                    </Typography>
                                    <Typography variant="body2">
                                        📸 Electronics (8 rentals)
                                    </Typography>
                                    <Typography variant="body2">
                                        🎵 Audio Equipment (4 rentals)
                                    </Typography>
                                    <Typography variant="body2">
                                        🎥 Video Gear (3 rentals)
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>
            </Container>
        </>
    );
};

export default CustomerDashboard;
