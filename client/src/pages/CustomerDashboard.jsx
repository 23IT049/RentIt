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
    CardMedia,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from '@mui/material';
import {
    ShoppingCart,
    Search,
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
import { bookingsAPI, itemsAPI } from '../services/api';

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
    
    // Browse Items state
    const [items, setItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    
    // Booking state
    const [bookingDialog, setBookingDialog] = useState(false);
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        notes: ''
    });
    
    // Booking Details state
    const [bookingDetailsDialog, setBookingDetailsDialog] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        
        // Add timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setError('Dashboard loading timed out. Please refresh the page.');
            }
        }, 10000); // 10 seconds timeout

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (tabValue === 1) {
            fetchItems();
        }
    }, [tabValue, searchTerm, selectedCategory]);

    const handleViewItem = async (item) => {
        try {
            // Fetch full item details
            const response = await itemsAPI.getOne(item._id);
            setSelectedItem(response.data.item);
            setTabValue(5); // Navigate to item details tab
        } catch (error) {
            console.error('Error fetching item details:', error);
        }
    };

    const handleBooking = () => {
        setBookingDialog(true);
    };

    const handleBookingDetails = (booking) => {
        setSelectedBooking(booking);
        setBookingDetailsDialog(true);
    };

    const handleBookingSubmit = async () => {
        try {
            const bookingPayload = {
                item: selectedItem._id,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                notes: bookingData.notes,
                totalAmount: calculateTotalAmount()
            };

            const response = await bookingsAPI.create(bookingPayload);
            
            if (response.data.success) {
                alert('Booking created successfully! Check your bookings.');
                setBookingDialog(false);
                setBookingData({ startDate: '', endDate: '', notes: '' });
                setTabValue(0); // Go to My Bookings tab
                fetchDashboardData(); // Refresh bookings
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Failed to create booking. Please try again.');
        }
    };

    const calculateTotalAmount = () => {
        if (!selectedItem || !bookingData.startDate || !bookingData.endDate) return 0;
        
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        return days * selectedItem.price;
    };

    const fetchItems = async () => {
        try {
            setItemsLoading(true);
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (selectedCategory) params.category = selectedCategory;
            
            console.log('Fetching items with params:', params);
            const response = await itemsAPI.getAll(params);
            console.log('Items response:', response);
            setItems(response.data.items || []);
        } catch (error) {
            console.error('Error fetching items:', error);
            setError('Failed to load items. Please try again.');
        } finally {
            setItemsLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            
            console.log('Fetching dashboard data...');
            
            // Fetch customer's data
            const bookingsResponse = await bookingsAPI.getAll({ role: 'customer' });
            console.log('Bookings response:', bookingsResponse);
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
            setError('Failed to load dashboard data. Please try again.');
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
                        <Typography variant="h6" sx={{ ml: 2, color: '#ccc' }}>
                            Loading dashboard...
                        </Typography>
                    </Box>
                </Container>
            </>
        );
    }

    // Fallback if there's an error but no error message
    if (!loading && !error && myBookings.length === 0 && items.length === 0) {
        return (
            <>
                <CustomerNavbar />
                <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                    <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
                        Customer Dashboard
                    </Typography>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Dashboard is loading. If this persists, please refresh the page.
                    </Alert>
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
                    <Tab icon={<Search />} label="Browse Items" />
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
                                startIcon={<Search />}
                                onClick={() => setTabValue(1)}
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
                                                <TableCell sx={{ color: 'white' }}>Order ID</TableCell>
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
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                            #{booking.id || booking._id?.slice(-8) || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
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
                                                        <IconButton 
                                                            sx={{ color: '#ccc' }}
                                                            onClick={() => handleBookingDetails(booking)}
                                                        >
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

                {/* Browse Items Tab */}
                {tabValue === 1 && (
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">Browse Available Items</Typography>
                        </Box>

                        {/* Search and Filter */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    placeholder="Search items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Search sx={{ color: '#ccc', mr: 1 }} />,
                                        style: { color: 'white' }
                                    }}
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: '#ccc' }}>Category</InputLabel>
                                    <Select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        label="Category"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#555' },
                                                '&:hover fieldset': { borderColor: '#9333ea' },
                                                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                            },
                                            '& .MuiSelect-select': { color: 'white' }
                                        }}
                                    >
                                        <MenuItem value="">All Categories</MenuItem>
                                        <MenuItem value="Electronics">Electronics</MenuItem>
                                        <MenuItem value="Vehicles">Vehicles</MenuItem>
                                        <MenuItem value="Equipment">Equipment</MenuItem>
                                        <MenuItem value="Sports">Sports</MenuItem>
                                        <MenuItem value="Tools">Tools</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                                    sx={{ backgroundColor: '#9333ea', height: '56px' }}
                                >
                                    Clear
                                </Button>
                            </Grid>
                        </Grid>

                        {itemsLoading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress sx={{ color: '#9333ea' }} />
                            </Box>
                        ) : items.length === 0 ? (
                            <Alert severity="info">
                                No items found. Try adjusting your search or filters.
                            </Alert>
                        ) : (
                            <Grid container spacing={3}>
                                {items.map((item) => (
                                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                                        <Card sx={{ backgroundColor: '#2a2a2a', color: 'white', cursor: 'pointer' }}>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={item.image || 'https://via.placeholder.com/300x200'}
                                                alt={item.title}
                                            />
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, color: '#ccc' }}>
                                                    {item.description?.substring(0, 100)}...
                                                </Typography>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                    <Typography variant="h6" color="primary" sx={{ color: '#9333ea' }}>
                                                        ₹{item.price}/day
                                                    </Typography>
                                                    <Chip 
                                                        label={item.category} 
                                                        size="small" 
                                                        sx={{ backgroundColor: '#9333ea', color: 'white' }}
                                                    />
                                                </Box>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => handleViewItem(item)}
                                                    sx={{ backgroundColor: '#9333ea' }}
                                                >
                                                    View Details
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* Wishlist Tab */}
                {tabValue === 2 && (
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
                {tabValue === 3 && (
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
                {tabValue === 4 && (
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

                {/* Item Details Tab */}
                {tabValue === 5 && selectedItem && (
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Button
                                variant="outlined"
                                onClick={() => setTabValue(1)}
                                sx={{ mr: 2, borderColor: '#9333ea', color: '#9333ea' }}
                            >
                                ← Back to Browse
                            </Button>
                            <Typography variant="h6">Item Details</Typography>
                        </Box>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={3} sx={{ backgroundColor: '#2a2a2a' }}>
                                    <img
                                        src={selectedItem.image || 'https://via.placeholder.com/400x300'}
                                        alt={selectedItem.title}
                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                    />
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
                                    {selectedItem.title}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2, color: '#ccc' }}>
                                    {selectedItem.description}
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Chip 
                                        label={selectedItem.category} 
                                        size="small" 
                                        sx={{ backgroundColor: '#9333ea', color: 'white' }}
                                    />
                                </Box>
                                <Typography variant="h5" sx={{ mb: 2, color: '#9333ea' }}>
                                    ₹{selectedItem.price} / day
                                </Typography>
                                {selectedItem.deposit > 0 && (
                                    <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                                        Security Deposit: ₹{selectedItem.deposit}
                                    </Typography>
                                )}
                                <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                                    <strong>Location:</strong> {selectedItem.location}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                                    <strong>Condition:</strong> {selectedItem.condition}
                                </Typography>
                                {selectedItem.features && selectedItem.features.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                                            <strong>Features:</strong>
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {selectedItem.features.map((feature, index) => (
                                                <Chip key={index} label={feature} variant="outlined" size="small" 
                                                    sx={{ borderColor: '#9333ea', color: '#9333ea' }} />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Paper elevation={2} sx={{ p: 2, mt: 3, bgcolor: '#333' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="h6" sx={{ color: 'white' }}>Vendor</Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ color: '#ccc' }}>
                                        {selectedItem.vendor?.name || 'Vendor'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#888' }}>
                                        {selectedItem.vendor?.email || 'vendor@example.com'}
                                    </Typography>
                                </Paper>

                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ mt: 3, backgroundColor: '#9333ea' }}
                                    onClick={handleBooking}
                                >
                                    Book This Item
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>

            {/* Booking Dialog */}
            <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    Book Item: {selectedItem?.title}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a' }}>
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
                                    '& fieldset': { borderColor: '#555' },
                                    '&:hover fieldset': { borderColor: '#9333ea' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            value={bookingData.endDate}
                            onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                            InputLabelProps={{ shrink: true, style: { color: '#ccc' } }}
                            InputProps={{ style: { color: 'white' } }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#555' },
                                    '&:hover fieldset': { borderColor: '#9333ea' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' },
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
                            InputLabelProps={{ style: { color: '#ccc' } }}
                            InputProps={{ style: { color: 'white' } }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#555' },
                                    '&:hover fieldset': { borderColor: '#9333ea' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                }
                            }}
                        />
                        {bookingData.startDate && bookingData.endDate && (
                            <Paper sx={{ p: 2, backgroundColor: '#333', color: 'white' }}>
                                <Typography variant="h6" gutterBottom>
                                    Booking Summary
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Item:</strong> {selectedItem?.title}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Period:</strong> {bookingData.startDate} to {bookingData.endDate}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Daily Rate:</strong> ₹{selectedItem?.price}
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#9333ea' }}>
                                    <strong>Total Amount:</strong> ₹{calculateTotalAmount()}
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a', p: 3 }}>
                    <Button onClick={() => setBookingDialog(false)} sx={{ color: '#ccc' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleBookingSubmit} 
                        variant="contained"
                        sx={{ backgroundColor: '#9333ea' }}
                        disabled={!bookingData.startDate || !bookingData.endDate}
                    >
                        Confirm Booking
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Booking Details Dialog */}
            <Dialog open={bookingDetailsDialog} onClose={() => setBookingDetailsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    Booking Details - #{selectedBooking?.id || selectedBooking?._id?.slice(-8)}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    {selectedBooking && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Order Information
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Order ID:</strong> #{selectedBooking.id || selectedBooking._id?.slice(-8)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Status:</strong> {selectedBooking.status}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Total Amount:</strong> ${selectedBooking.totalAmount || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Booking Date:</strong> {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Item Details
                                    </Typography>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Avatar
                                            src={selectedBooking.item?.image || 'https://via.placeholder.com/50x50'}
                                            sx={{ mr: 2, width: 50, height: 50 }}
                                        />
                                        <Box>
                                            <Typography variant="body1">
                                                {selectedBooking.item?.title || 'Item'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#ccc' }}>
                                                {selectedBooking.item?.category}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Daily Rate:</strong> ${selectedBooking.item?.price || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Location:</strong> {selectedBooking.item?.location || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Rental Period
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Start Date:</strong> {selectedBooking.startDate ? new Date(selectedBooking.startDate).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>End Date:</strong> {selectedBooking.endDate ? new Date(selectedBooking.endDate).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Duration:</strong> {selectedBooking.startDate && selectedBooking.endDate ? 
                                            Math.ceil((new Date(selectedBooking.endDate) - new Date(selectedBooking.startDate)) / (1000 * 60 * 60 * 24)) + 1 : 0} days
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Vendor Information
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Name:</strong> {selectedBooking.vendor?.name || 'Vendor'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Email:</strong> {selectedBooking.vendor?.email || 'vendor@example.com'}
                                    </Typography>
                                </Grid>
                                {selectedBooking.notes && (
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom>
                                            Notes
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#ccc' }}>
                                            {selectedBooking.notes}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a', p: 3 }}>
                    <Button onClick={() => setBookingDetailsDialog(false)} sx={{ color: '#ccc' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            </Container>
        </>
    );
};

export default CustomerDashboard;
