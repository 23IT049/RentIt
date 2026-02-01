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
    LocalShipping,
    Event,
    Star,
    Visibility,
    Edit,
    Delete,
    Add,
    TrendingUp,
    Schedule,
    Payment,
    Person,
    Email,
    Phone,
    LocationOn,
    RemoveShoppingCart,
    FavoriteBorder,
    DeleteOutline
} from '@mui/icons-material';
import CustomerNavbar from '../components/CustomerNavbar';
import { bookingsAPI, itemsAPI } from '../services/api';
import InvoiceCard from '../components/InvoiceCard';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Profile state
    const [userProfile, setUserProfile] = useState(null);
    const [editProfileDialog, setEditProfileDialog] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Dynamic state
    const [stats, setStats] = useState({
        activeRentals: 0,
        totalBookings: 0,
        wishlistItems: 0,
        totalSpent: 0
    });

    const [myBookings, setMyBookings] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    // Cart state
    const [cart, setCart] = useState([]);

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

        // Listen for tab changes from navbar
        const handleTabChange = (event) => {
            setTabValue(event.detail);
        };

        window.addEventListener('changeDashboardTab', handleTabChange);

        // Check for initial tab from navigation state
        const locationState = window.history?.state?.usr?.state;
        if (locationState?.initialTab !== undefined) {
            setTabValue(locationState.initialTab);
        }

        // Add timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setError('Dashboard loading timed out. Please refresh the page.');
            }
        }, 10000); // 10 seconds timeout

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('changeDashboardTab', handleTabChange);
        };
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
            setTabValue(6); // Navigate to item details tab
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

    // Profile handlers
    const handleEditProfile = () => {
        setEditProfileForm({
            name: userProfile?.name || '',
            email: userProfile?.email || '',
            phone: userProfile?.phone || '',
            address: userProfile?.address || ''
        });
        setEditProfileDialog(true);
    };

    const handleProfileChange = (e) => {
        setEditProfileForm({
            ...editProfileForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async () => {
        try {
            // In a real app, you'd call an API to update the profile
            // For now, we'll just update the local state
            setUserProfile({
                ...userProfile,
                ...editProfileForm
            });

            // Update localStorage
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            userData.name = editProfileForm.name;
            userData.email = editProfileForm.email;
            userData.phone = editProfileForm.phone;
            userData.address = editProfileForm.address;
            localStorage.setItem('user', JSON.stringify(userData));

            setEditProfileDialog(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    // Cart functions
    const handleAddToCart = (item) => {
        const existingItem = cart.find(cartItem => cartItem._id === item._id);
        if (existingItem) {
            alert('This item is already in your cart!');
            return;
        }

        const cartItem = {
            ...item,
            quantity: 1,
            addedAt: new Date().toISOString()
        };

        setCart([...cart, cartItem]);
        alert(`${item.title} added to cart!`);
    };

    const handleRemoveFromCart = (itemId) => {
        setCart(cart.filter(item => item._id !== itemId));
    };

    const calculateCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Wishlist functions
    const handleAddToWishlist = (item) => {
        const existingItem = wishlist.find(wishlistItem => wishlistItem._id === item._id);
        if (existingItem) {
            alert('This item is already in your wishlist!');
            return;
        }

        const wishlistItem = {
            ...item,
            addedAt: new Date().toISOString()
        };

        setWishlist([...wishlist, wishlistItem]);
        alert(`${item.title} added to wishlist!`);
    };

    const handleRemoveFromWishlist = (itemId) => {
        setWishlist(wishlist.filter(item => item._id !== itemId));
    };

    const handleMoveToCart = (item) => {
        handleAddToCart(item);
        handleRemoveFromWishlist(item._id);
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

            // Load user profile from localStorage
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            setUserProfile(userData);

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
                wishlistItems: wishlist.length,
                totalSpent
            });

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
        <Card sx={{ backgroundColor: '#FFFFFF', color: '#0284C7' }}>
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
                <CustomerNavbar
                    cart={cart}
                    onCartClick={() => navigate('/cart', { state: { cart } })}
                />
                <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                        <CircularProgress sx={{ color: '#0284C7' }} />
                        <Typography variant="h6" sx={{ ml: 2, color: '#0284C7' }}>
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
                <CustomerNavbar
                    cart={cart}
                    onCartClick={() => navigate('/cart', { state: { cart } })}
                />
                <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
                    <Typography variant="h4" gutterBottom sx={{ color: '#0284C7', mb: 4 }}>
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
            <CustomerNavbar
                cart={cart}
                onCartClick={() => navigate('/cart', { state: { cart } })}
            />
            <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}



                {/* Tabs */}
                <Paper sx={{ backgroundColor: '#FFFFFF', color: '#0284C7' }}>

                    {/* My Bookings Tab */}
                    {tabValue === 0 && (
                        <Box sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6">My Current Bookings</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Search />}
                                    onClick={() => setTabValue(1)}
                                    sx={{ backgroundColor: '#0284C7' }}
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
                                                <TableCell sx={{ color: '#0284C7' }}>Order ID</TableCell>
                                                <TableCell sx={{ color: '#0284C7' }}>Item</TableCell>
                                                <TableCell sx={{ color: '#0284C7' }}>Vendor</TableCell>
                                                <TableCell sx={{ color: '#0284C7' }}>Rental Period</TableCell>
                                                <TableCell sx={{ color: '#0284C7' }}>Total</TableCell>
                                                <TableCell sx={{ color: '#0284C7' }}>Status</TableCell>
                                                <TableCell sx={{ color: '#0284C7' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {myBookings.map((booking) => (
                                                <TableRow key={booking.id}>
                                                    <TableCell sx={{ color: '#0284C7' }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                            #{booking.id || booking._id?.slice(-8) || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#0284C7' }}>
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
                                                    <TableCell sx={{ color: '#0284C7' }}>
                                                        {booking.vendor?.name || 'Vendor'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#0284C7' }}>
                                                        {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'} -
                                                        {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#0284C7' }}>
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
                                                            sx={{ color: '#0284C7' }}
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
                                            startAdornment: <Search sx={{ color: '#0284C7', mr: 1 }} />,
                                            style: { color: '#0284C7' }
                                        }}
                                        InputLabelProps={{ style: { color: '#0284C7' } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#BAE6FD' },
                                                '&:hover fieldset': { borderColor: '#0284C7' },
                                                '&.Mui-focused fieldset': { borderColor: '#0284C7' },
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#0284C7' }}>Category</InputLabel>
                                        <Select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            label="Category"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': { borderColor: '#BAE6FD' },
                                                    '&:hover fieldset': { borderColor: '#0284C7' },
                                                    '&.Mui-focused fieldset': { borderColor: '#0284C7' },
                                                },
                                                '& .MuiInputLabel-root': { color: '#0284C7' },
                                                '& .MuiOutlinedInput-input': { color: '#0284C7' }
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
                                        sx={{ backgroundColor: '#0284C7', height: '56px' }}
                                    >
                                        Clear
                                    </Button>
                                </Grid>
                            </Grid>

                            {itemsLoading ? (
                                <Box display="flex" justifyContent="center" py={4}>
                                    <CircularProgress sx={{ color: '#0284C7' }} />
                                </Box>
                            ) : items.length === 0 ? (
                                <Alert severity="info">
                                    No items found. Try adjusting your search or filters.
                                </Alert>
                            ) : (
                                <Grid container spacing={3}>
                                    {items.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item._id}>
                                            <Card sx={{ backgroundColor: '#FFFFFF', color: '#0284C7', cursor: 'pointer' }}>
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
                                                    <Typography variant="body2" color="primary" sx={{ mb: 1, color: '#0284C7' }}>
                                                        {item.description?.substring(0, 100)}...
                                                    </Typography>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                        <Typography variant="h6" color="primary" sx={{ color: '#0284C7' }}>
                                                            ₹{item.price}/day
                                                        </Typography>
                                                        <Chip
                                                            label={item.category}
                                                            size="small"
                                                            sx={{ backgroundColor: '#9333ea', color: 'white' }}
                                                        />
                                                    </Box>
                                                    <Box display="flex" gap={1} mb={2}>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<ShoppingCart />}
                                                            onClick={() => handleAddToCart(item)}
                                                            sx={{
                                                                backgroundColor: '#0284C7',
                                                                flex: 1
                                                            }}
                                                        >
                                                            Add to Cart
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<Favorite />}
                                                            onClick={() => handleAddToWishlist(item)}
                                                            sx={{
                                                                borderColor: '#0284C7',
                                                                color: '#0284C7',
                                                                flex: 1
                                                            }}
                                                        >
                                                            Wishlist
                                                        </Button>
                                                    </Box>
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        onClick={() => handleViewItem(item)}
                                                        sx={{
                                                            borderColor: '#0284C7',
                                                            color: '#0284C7'
                                                        }}
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
                                <Typography variant="h6">My Wishlist ({wishlist.length})</Typography>
                                <Box display="flex" gap={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<ShoppingCart />}
                                        onClick={() => setCartDialog(true)}
                                        sx={{ backgroundColor: '#0284C7' }}
                                    >
                                        View Cart ({cart.length})
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Add />}
                                        onClick={() => setTabValue(1)}
                                        sx={{ borderColor: '#0284C7', color: '#0284C7' }}
                                    >
                                        Browse More Items
                                    </Button>
                                </Box>
                            </Box>

                            {wishlist.length === 0 ? (
                                <Alert severity="info">
                                    Your wishlist is empty. Browse items and add them to your wishlist!
                                </Alert>
                            ) : (
                                <Grid container spacing={3}>
                                    {wishlist.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item._id}>
                                            <Card sx={{ backgroundColor: '#FFFFFF', color: '#0284C7' }}>
                                                <CardMedia
                                                    component="img"
                                                    height="150"
                                                    image={item.image || 'https://via.placeholder.com/300x150'}
                                                    alt={item.title}
                                                />
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>
                                                        {item.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="primary" sx={{ mb: 2, color: '#0284C7' }}>
                                                        {item.description?.substring(0, 80)}...
                                                    </Typography>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                        <Typography variant="h6" color="primary" sx={{ color: '#0284C7' }}>
                                                            ₹{item.price}/day
                                                        </Typography>
                                                        <Chip
                                                            label={item.category}
                                                            size="small"
                                                            sx={{ backgroundColor: '#0284C7', color: '#FFFFFF' }}
                                                        />
                                                    </Box>
                                                    <Box display="flex" gap={1}>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<ShoppingCart />}
                                                            onClick={() => handleMoveToCart(item)}
                                                            sx={{
                                                                backgroundColor: '#0284C7',
                                                                flex: 1
                                                            }}
                                                        >
                                                            Move to Cart
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<DeleteOutline />}
                                                            onClick={() => handleRemoveFromWishlist(item._id)}
                                                            sx={{
                                                                borderColor: '#0284C7',
                                                                color: '#0284C7'
                                                            }}
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

                    {/* Profile Tab */}
                    {tabValue === 3 && (
                        <Box sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6">My Profile</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Edit />}
                                    onClick={handleEditProfile}
                                    sx={{ backgroundColor: '#0284C7' }}
                                >
                                    Edit Profile
                                </Button>
                            </Box>

                            {userProfile ? (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                                            <Avatar
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    mx: 'auto',
                                                    mb: 2,
                                                    bgcolor: '#0284C7',
                                                    fontSize: '3rem'
                                                }}
                                            >
                                                {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                                            </Avatar>
                                            <Typography variant="h5" gutterBottom>
                                                {userProfile.name || 'User Name'}
                                            </Typography>
                                            <Chip
                                                label={userProfile.role || 'customer'}
                                                color="primary"
                                                size="small"
                                                sx={{ mb: 2 }}
                                            />
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={8}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <Card sx={{ backgroundColor: '#FFFFFF', color: '#0284C7', p: 3, height: '100%' }}>
                                                    <Box display="flex" alignItems="center" mb={2}>
                                                        <Email sx={{ mr: 2, color: '#0284C7' }} />
                                                        <Typography variant="subtitle1">Contact Information</Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Email:</strong> {userProfile.email || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Phone:</strong> {userProfile.phone || 'Not provided'}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Address:</strong> {userProfile.address || 'Not provided'}
                                                    </Typography>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Card sx={{ backgroundColor: '#FFFFFF', color: '#0284C7', p: 3, height: '100%' }}>
                                                    <Box display="flex" alignItems="center" mb={2}>
                                                        <TrendingUp sx={{ mr: 2, color: '#0284C7' }} />
                                                        <Typography variant="subtitle1">Account Statistics</Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Total Bookings:</strong> {stats.totalBookings}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Active Rentals:</strong> {stats.activeRentals}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Total Spent:</strong> ${stats.totalSpent}
                                                    </Typography>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Card sx={{ backgroundColor: '#FFFFFF', color: '#0284C7', p: 3, height: '100%' }}>
                                                    <Box display="flex" alignItems="center" mb={2}>
                                                        <Event sx={{ mr: 2, color: '#0284C7' }} />
                                                        <Typography variant="subtitle1">Account Information</Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Member Since:</strong> {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Last Login:</strong> {userProfile.lastLogin ? new Date(userProfile.lastLogin).toLocaleDateString() : 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Account Status:</strong>
                                                        <Chip
                                                            label="Active"
                                                            color="success"
                                                            size="small"
                                                            sx={{ ml: 1 }}
                                                        />
                                                    </Typography>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Card sx={{ backgroundColor: '#FFFFFF', color: '#0284C7', p: 3, height: '100%' }}>
                                                    <Box display="flex" alignItems="center" mb={2}>
                                                        <LocationOn sx={{ mr: 2, color: '#0284C7' }} />
                                                        <Typography variant="subtitle1">Preferences</Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Preferred Categories:</strong> Electronics, Tools
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Notification Settings:</strong> Email & SMS
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Language:</strong> English
                                                    </Typography>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="h6" color="textSecondary">
                                        Loading profile information...
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Item Details Tab */}
                    {tabValue === 6 && selectedItem && (
                        <Box sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" mb={3}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setTabValue(1)}
                                    sx={{ mr: 2, borderColor: '#0284C7', color: '#0284C7' }}
                                >
                                    ← Back to Browse
                                </Button>
                                <Typography variant="h6">Item Details</Typography>
                            </Box>

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={3} sx={{ backgroundColor: '#FFFFFF' }}>
                                        <img
                                            src={selectedItem.image || 'https://via.placeholder.com/400x300'}
                                            alt={selectedItem.title}
                                            style={{ width: '100%', height: 'auto', display: 'block' }}
                                        />
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="h4" gutterBottom sx={{ color: '#0284C7' }}>
                                        {selectedItem.title}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2, color: '#0284C7' }}>
                                        {selectedItem.description}
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Chip
                                            label={selectedItem.category}
                                            size="small"
                                            sx={{ backgroundColor: '#0284C7', color: 'white' }}
                                        />
                                    </Box>
                                    <Typography variant="h5" sx={{ mb: 2, color: '#0284C7' }}>
                                        ₹{selectedItem.price} / day
                                    </Typography>
                                    {selectedItem.deposit > 0 && (
                                        <Typography variant="body2" sx={{ mb: 2, color: '#0284C7' }}>
                                            Security Deposit: ₹{selectedItem.deposit}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" sx={{ mb: 2, color: '#0284C7' }}>
                                        <strong>Location:</strong> {selectedItem.location}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2, color: '#0284C7' }}>
                                        <strong>Condition:</strong> {selectedItem.condition}
                                    </Typography>
                                    {selectedItem.features && selectedItem.features.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ mb: 1, color: '#0284C7' }}>
                                                <strong>Features:</strong>
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {selectedItem.features.map((feature, index) => (
                                                    <Chip key={index} label={feature} variant="outlined" size="small"
                                                        sx={{ borderColor: '#0284C7', color: '#0284C7' }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    <Paper elevation={2} sx={{ p: 2, mt: 3, bgcolor: '#FFFFFF' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" sx={{ color: '#0284C7' }}>Vendor</Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ color: '#0284C7' }}>
                                            {selectedItem.vendor?.name || 'Vendor'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#0284C7' }}>
                                            {selectedItem.vendor?.email || 'vendor@example.com'}
                                        </Typography>
                                    </Paper>

                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        sx={{ mt: 3, backgroundColor: '#0284C7' }}
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
                <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth
                    PaperProps={{
                        sx: { backgroundColor: '#FFFFFF' }
                    }}
                >
                    <DialogTitle sx={{ color: '#0284C7' }}>
                        Book Item: {selectedItem?.title}
                    </DialogTitle>
                    <DialogContent sx={{ backgroundColor: '#FFFFFF' }}>
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
                                        '& fieldset': { borderColor: '#BAE6FD' },
                                        '&:hover fieldset': { borderColor: '#0284C7' },
                                        '&.Mui-focused fieldset': { borderColor: '#0284C7' },
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                value={bookingData.endDate}
                                onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                                InputLabelProps={{ shrink: true, style: { color: '#0284C7' } }}
                                InputProps={{ style: { color: '#0284C7' } }}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#BAE6FD' },
                                        '&:hover fieldset': { borderColor: '#0284C7' },
                                        '&.Mui-focused fieldset': { borderColor: '#0284C7' },
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
                                InputLabelProps={{ style: { color: '#0284C7' } }}
                                InputProps={{ style: { color: '#0284C7' } }}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#BAE6FD' },
                                        '&:hover fieldset': { borderColor: '#0284C7' },
                                        '&.Mui-focused fieldset': { borderColor: '#0284C7' },
                                    }
                                }}
                            />
                            {bookingData.startDate && bookingData.endDate && (
                                <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', color: '#0284C7' }}>
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
                                    <Typography variant="h6" sx={{ color: '#0284C7' }}>
                                        <strong>Total Amount:</strong> ₹{calculateTotalAmount()}
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #BAE6FD' }}>
                        <Button onClick={() => setBookingDialog(false)} sx={{ color: '#0284C7' }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBookingSubmit}
                            variant="contained"
                            sx={{ backgroundColor: '#0284C7' }}
                            disabled={!bookingData.startDate || !bookingData.endDate}
                        >
                            Confirm Booking
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Booking Details Dialog */}
                <Dialog
                    open={bookingDetailsDialog}
                    onClose={() => setBookingDetailsDialog(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: { backgroundColor: '#FFFFFF', color: '#0284C7' }
                    }}
                >
                    <DialogTitle sx={{ backgroundColor: '#FFFFFF', color: '#0284C7' }}>
                        Booking Details - #{selectedBooking?.id || selectedBooking?._id?.slice(-8)}
                    </DialogTitle>
                    <DialogContent sx={{ backgroundColor: '#FFFFFF', color: '#0284C7' }}>
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
                                                <Typography variant="body2" sx={{ color: '#0284C7' }}>
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
                                            <Typography variant="body2" sx={{ color: '#0284C7' }}>
                                                {selectedBooking.notes}
                                            </Typography>
                                        </Grid>
                                    )}

                                    {/* Invoice Section */}
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 2 }} />
                                        <InvoiceCard
                                            order={selectedBooking}
                                            onInvoiceGenerated={() => {
                                                // Refresh booking data after invoice generation
                                                fetchDashboardData();
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ borderTop: '1px solid #BAE6FD', backgroundColor: '#FFFFFF' }}>
                        <Button onClick={() => setBookingDetailsDialog(false)} sx={{ color: '#0284C7' }}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Profile Dialog */}
                <Dialog
                    open={editProfileDialog}
                    onClose={() => setEditProfileDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: { backgroundColor: '#FFFFFF', color: '#0284C7' }
                    }}
                >
                    <DialogTitle sx={{ backgroundColor: '#FFFFFF', color: '#0284C7' }}>
                        Edit Profile
                    </DialogTitle>
                    <DialogContent sx={{ backgroundColor: '#FFFFFF', color: '#0284C7' }}>
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={editProfileForm.name}
                                onChange={handleProfileChange}
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#BAE6FD' },
                                        '&:hover fieldset': { borderColor: '#0284C7' },
                                        '&.Mui-focused fieldset': { borderColor: '#0284C7' }
                                    },
                                    '& .MuiInputLabel-root': { color: '#0284C7' },
                                    '& .MuiInputBase-input': { color: '#0284C7' }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={editProfileForm.email}
                                onChange={handleProfileChange}
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#BAE6FD' },
                                        '&:hover fieldset': { borderColor: '#0284C7' },
                                        '&.Mui-focused fieldset': { borderColor: '#0284C7' }
                                    },
                                    '& .MuiInputLabel-root': { color: '#0284C7' },
                                    '& .MuiInputBase-input': { color: '#0284C7' }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={editProfileForm.phone}
                                onChange={handleProfileChange}
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#BAE6FD' },
                                        '&:hover fieldset': { borderColor: '#0284C7' },
                                        '&.Mui-focused fieldset': { borderColor: '#0284C7' }
                                    },
                                    '& .MuiInputLabel-root': { color: '#0284C7' },
                                    '& .MuiInputBase-input': { color: '#0284C7' }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={editProfileForm.address}
                                onChange={handleProfileChange}
                                margin="normal"
                                multiline
                                rows={3}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#BAE6FD' },
                                        '&:hover fieldset': { borderColor: '#0284C7' },
                                        '&.Mui-focused fieldset': { borderColor: '#0284C7' }
                                    },
                                    '& .MuiInputLabel-root': { color: '#0284C7' },
                                    '& .MuiInputBase-input': { color: '#0284C7' }
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #BAE6FD' }}>
                        <Button onClick={() => setEditProfileDialog(false)} sx={{ color: '#0284C7' }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} variant="contained" sx={{ backgroundColor: '#0284C7' }}>
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </>
    );
};

export default CustomerDashboard;
