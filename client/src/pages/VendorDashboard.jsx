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
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tab,
    Tabs,
    Alert,
    LinearProgress,
    CircularProgress,
    TextField,
    FormControl,
    InputLabel,
    Select,
    CardMedia
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Visibility,
    MoreVert,
    TrendingUp,
    ShoppingCart,
    AttachMoney,
    People,
    LocalShipping,
    Store,
    Assessment,
    CheckCircle
} from '@mui/icons-material';
import VendorNavbar from '../components/VendorNavbar';
import { itemsAPI, bookingsAPI } from '../services/api';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null); // For menu functionality
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Booking Details state (separate from menu state)
    const [bookingDetailsDialog, setBookingDetailsDialog] = useState(false);
    const [selectedBookingOrder, setSelectedBookingOrder] = useState(null);
    
    // Dynamic state
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeRentals: 0,
        monthlyRevenue: 0,
        totalProducts: 0
    });

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [quotations, setQuotations] = useState([]);
    
    // Create Item state
    const [createItemDialog, setCreateItemDialog] = useState(false);
    const [createItemLoading, setCreateItemLoading] = useState(false);
    
    // Edit Item state
    const [editItemDialog, setEditItemDialog] = useState(false);
    const [editItemLoading, setEditItemLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // View Item state
    const [viewItemDialog, setViewItemDialog] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        deposit: '',
        location: '',
        condition: '',
        image: '',
        features: '',
        terms: ''
    });

    // Set tab based on URL params
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'products') setTabValue(1);
        else if (tab === 'orders') setTabValue(0);
        else if (tab === 'quotations') setTabValue(2);
        else if (tab === 'analytics') setTabValue(3);
    }, [searchParams]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Fetch vendor's data
            const [ordersResponse, productsResponse] = await Promise.all([
                bookingsAPI.getAll({ role: 'vendor' }),
                itemsAPI.getMyItems()
            ]);

            setOrders(ordersResponse.data.bookings || []);
            setProducts(productsResponse.data.items || []);

            // Calculate stats
            const activeRentals = ordersResponse.data.bookings?.filter(order => 
                order.status === 'renting' || order.status === 'confirmed'
            ).length || 0;

            const monthlyRevenue = ordersResponse.data.bookings?.reduce((total, order) => {
                if (order.status === 'completed') {
                    return total + (order.totalAmount || 0);
                }
                return total;
            }, 0) || 0;

            setStats({
                totalOrders: ordersResponse.data.bookings?.length || 0,
                activeRentals,
                monthlyRevenue,
                totalProducts: productsResponse.data.items?.length || 0
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const tabNames = ['orders', 'products', 'quotations', 'analytics'];
        setSearchParams({ tab: tabNames[newValue] });
    };

    const handleMenuClick = (event, order) => {
        setAnchorEl(event.currentTarget);
        setSelectedOrder(order);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedOrder(null);
    };

    const handleOrderDetails = () => {
        setOrderDetailsOpen(true);
        handleMenuClose();
    };

    const handleCreateItem = () => {
        setCreateItemDialog(true);
    };

    const handleCreateItemSubmit = async () => {
        try {
            setCreateItemLoading(true);
            
            const itemData = {
                ...formData,
                price: parseFloat(formData.price),
                deposit: parseFloat(formData.deposit),
                features: formData.features.split(',').map(f => f.trim()).filter(f => f)
            };

            const response = await itemsAPI.create(itemData);
            
            if (response.data.success) {
                alert('Item created successfully!');
                setCreateItemDialog(false);
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    price: '',
                    deposit: '',
                    location: '',
                    condition: '',
                    image: '',
                    features: '',
                    terms: ''
                });
                fetchDashboardData(); // Refresh products
            }
        } catch (error) {
            console.error('Error creating item:', error);
            alert('Failed to create item. Please try again.');
        } finally {
            setCreateItemLoading(false);
        }
    };

    const handleCreateItemChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEditItem = (product) => {
        setSelectedProduct(product);
        setFormData({
            title: product.title || '',
            description: product.description || '',
            category: product.category || '',
            price: product.price?.toString() || '',
            deposit: product.deposit?.toString() || '',
            location: product.location || '',
            condition: product.condition || '',
            image: product.image || '',
            features: product.features?.join(', ') || '',
            terms: product.terms || ''
        });
        setEditItemDialog(true);
    };

    const handleEditItemSubmit = async () => {
        try {
            setEditItemLoading(true);
            
            const itemData = {
                ...formData,
                price: parseFloat(formData.price),
                deposit: parseFloat(formData.deposit),
                features: formData.features.split(',').map(f => f.trim()).filter(f => f)
            };

            const response = await itemsAPI.update(selectedProduct._id, itemData);
            
            if (response.data.success) {
                alert('Product updated successfully!');
                setEditItemDialog(false);
                setSelectedProduct(null);
                fetchDashboardData(); // Refresh products
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update product. Please try again.');
        } finally {
            setEditItemLoading(false);
        }
    };

    const handleViewItem = (product) => {
        setSelectedProduct(product);
        setViewItemDialog(true);
    };

    const handleBookingDetails = (order) => {
        console.log('handleBookingDetails called with order:', order);
        
        if (!order) {
            console.error('No order provided to handleBookingDetails');
            alert('Error: No booking data available');
            return;
        }
        
        try {
            setSelectedBookingOrder(order);
            setBookingDetailsDialog(true);
            console.log('bookingDetailsDialog set to true');
        } catch (error) {
            console.error('Error in handleBookingDetails:', error);
            alert('Error opening booking details. Please try again.');
        }
    };

    const handleApproveBooking = async (orderId) => {
        console.log('handleApproveBooking called with orderId:', orderId);
        console.log('Order ID type:', typeof orderId);
        
        if (!orderId) {
            alert('Error: No booking ID provided');
            return;
        }
        
        try {
            console.log('Making API call to:', `/bookings/${orderId}/confirm`);
            const response = await bookingsAPI.confirm(orderId);
            console.log('Approve response:', response);
            
            if (response.data && response.data.success) {
                alert('Booking approved successfully!');
                setBookingDetailsDialog(false);
                fetchDashboardData(); // Refresh orders
            } else {
                alert('Failed to approve booking: ' + (response.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error approving booking:', error);
            console.error('Error response:', error.response);
            
            let errorMessage = 'Failed to approve booking. Please try again.';
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
                
                if (error.response.status === 404) {
                    errorMessage = 'Booking not found or endpoint not available';
                } else if (error.response.status === 403) {
                    errorMessage = 'You are not authorized to approve this booking';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = 'No response from server. Please check your connection.';
            }
            
            alert(errorMessage);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'primary';
            case 'renting': return 'success';
            case 'delivered': return 'info';
            case 'returned': return 'default';
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
                <VendorNavbar />
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
            <VendorNavbar />
            <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
                    Vendor Dashboard
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
                            title="Total Orders"
                            value={stats.totalOrders}
                            icon={<ShoppingCart />}
                            color="#9333ea"
                        />
                    </Grid>
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
                            title="Monthly Revenue"
                            value={`$${stats.monthlyRevenue.toLocaleString()}`}
                            icon={<AttachMoney />}
                            color="#ff9800"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Products"
                            value={stats.totalProducts}
                            icon={<Store />}
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
                        <Tab label="Orders" />
                        <Tab label="Products" />
                        <Tab label="Quotations" />
                        <Tab label="Analytics" />
                    </Tabs>

                    {/* Orders Tab */}
                    {tabValue === 0 && (
                        <Box sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6">Customer Orders to Process</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Assessment />}
                                    onClick={() => fetchDashboardData()}
                                    sx={{ backgroundColor: '#9333ea' }}
                                >
                                    Refresh
                                </Button>
                            </Box>

                            {orders.length === 0 ? (
                                <Alert severity="info">
                                    No orders found. Your customer orders will appear here.
                                </Alert>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: 'white' }}>Order ID</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Customer</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Items</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Rental Period</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Total</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {orders.map((order) => (
                                                <TableRow key={order._id}>
                                                    <TableCell sx={{ color: '#ccc' }}>#{order._id?.slice(-8) || 'N/A'}</TableCell>
                                                    <TableCell sx={{ color: '#ccc' }}>
                                                        <Box>
                                                            <Typography variant="body2">{order.renter?.name}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#888' }}>
                                                                {order.renter?.email}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#ccc' }}>
                                                        {order.item?.title || 'Item'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#ccc' }}>
                                                        {order.startDate ? new Date(order.startDate).toLocaleDateString() : 'N/A'} - 
                                                        {order.endDate ? new Date(order.endDate).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#ccc' }}>
                                                        ${order.totalAmount || 0}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={order.status}
                                                            color={getStatusColor(order.status)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box display="flex" gap={1}>
                                                            <IconButton
                                                                onClick={() => {
                                                                    console.log('View Details button clicked for order:', order);
                                                                    handleBookingDetails(order);
                                                                }}
                                                                sx={{ color: '#ccc' }}
                                                                title="View Details"
                                                            >
                                                                <Visibility />
                                                            </IconButton>
                                                            {order.status === 'pending' && (
                                                                <IconButton
                                                                    onClick={() => {
                                                                        console.log('Approve button clicked for order:', order._id);
                                                                        handleApproveBooking(order._id);
                                                                    }}
                                                                    sx={{ color: '#4caf50' }}
                                                                    title="Approve Booking"
                                                                >
                                                                    <CheckCircle />
                                                                </IconButton>
                                                            )}
                                                            <IconButton
                                                                onClick={(e) => handleMenuClick(e, order)}
                                                                sx={{ color: '#ccc' }}
                                                                title="More Options"
                                                            >
                                                                <MoreVert />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    )}

                    {/* Products Tab */}
                    {tabValue === 1 && (
                        <Box sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6">My Products</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleCreateItem}
                                    sx={{ backgroundColor: '#9333ea' }}
                                >
                                    Add Product
                                </Button>
                            </Box>

                            {products.length === 0 ? (
                                <Alert severity="info">
                                    No products found. Start by adding your first rental product.
                                </Alert>
                            ) : (
                                <Grid container spacing={3}>
                                    {products.map((product) => (
                                        <Grid item xs={12} sm={6} md={4} key={product._id}>
                                            <Card sx={{ backgroundColor: '#333', color: 'white' }}>
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>
                                                        {product.title}
                                                    </Typography>
                                                    <Typography color="textSecondary" gutterBottom>
                                                        {product.category}
                                                    </Typography>
                                                    <Box display="flex" justifyContent="space-between" mb={2}>
                                                        <Typography variant="body2">
                                                            ${product.price}/day
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Stock: {product.available ? 'Available' : 'Unavailable'}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" gap={1}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<Edit />}
                                                            onClick={() => handleEditItem(product)}
                                                            sx={{ color: '#9333ea', borderColor: '#9333ea' }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<Visibility />}
                                                            onClick={() => handleViewItem(product)}
                                                            sx={{ color: '#9333ea', borderColor: '#9333ea' }}
                                                        >
                                                            View
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

                    {/* Quotations Tab */}
                    {tabValue === 2 && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Quotations
                            </Typography>
                            <Alert severity="info">
                                Quotation management coming soon!
                            </Alert>
                        </Box>
                    )}

                    {/* Analytics Tab */}
                    {tabValue === 3 && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Analytics & Reports
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ backgroundColor: '#333', color: 'white', p: 3 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Revenue Overview
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={75}
                                            sx={{ mb: 2, backgroundColor: '#555' }}
                                        />
                                        <Typography variant="body2">
                                            75% of monthly target achieved
                                        </Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ backgroundColor: '#333', color: 'white', p: 3 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Popular Products
                                        </Typography>
                                        <Typography variant="body2">
                                            Your most rented products will appear here
                                        </Typography>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Paper>

                {/* Order Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleOrderDetails}>
                        <Visibility sx={{ mr: 1 }} /> View Details
                    </MenuItem>
                    <MenuItem onClick={() => {/* Generate invoice */}}>
                        <AttachMoney sx={{ mr: 1 }} /> Generate Invoice
                    </MenuItem>
                </Menu>

                {/* Order Details Dialog */}
                <Dialog
                    open={orderDetailsOpen}
                    onClose={() => setOrderDetailsOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                        Order Details - {selectedOrder?.id}
                    </DialogTitle>
                    <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                        {selectedOrder && (
                            <Box>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Customer
                                        </Typography>
                                        <Typography>{selectedOrder.renter?.name}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {selectedOrder.renter?.email}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Order Status
                                        </Typography>
                                        <Chip
                                            label={selectedOrder.status}
                                            color={getStatusColor(selectedOrder.status)}
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                                
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Item
                                </Typography>
                                <Typography sx={{ mb: 1 }}>
                                    {selectedOrder.item?.title}
                                </Typography>
                                
                                <Box mt={3}>
                                    <Typography variant="h6">
                                        Total: ${selectedOrder.totalAmount || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ backgroundColor: '#2a2a2a' }}>
                        <Button onClick={() => setOrderDetailsOpen(false)} sx={{ color: '#ccc' }}>
                            Close
                        </Button>
                        <Button variant="contained" sx={{ backgroundColor: '#9333ea' }}>
                            Generate Invoice
                        </Button>
                    </DialogActions>
                </Dialog>

            {/* Create Item Dialog */}
            <Dialog
                open={createItemDialog}
                onClose={() => setCreateItemDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    Add New Product
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Product Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleCreateItemChange}
                                    required
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleCreateItemChange}
                                    multiline
                                    rows={3}
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: '#ccc' }}>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleCreateItemChange}
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
                                        <MenuItem value="Electronics">Electronics</MenuItem>
                                        <MenuItem value="Vehicles">Vehicles</MenuItem>
                                        <MenuItem value="Equipment">Equipment</MenuItem>
                                        <MenuItem value="Sports">Sports</MenuItem>
                                        <MenuItem value="Tools">Tools</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Daily Price (₹)"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleCreateItemChange}
                                    type="number"
                                    required
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Security Deposit (₹)"
                                    name="deposit"
                                    value={formData.deposit}
                                    onChange={handleCreateItemChange}
                                    type="number"
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleCreateItemChange}
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: '#ccc' }}>Condition</InputLabel>
                                    <Select
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleCreateItemChange}
                                        label="Condition"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#555' },
                                                '&:hover fieldset': { borderColor: '#9333ea' },
                                                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                            },
                                            '& .MuiSelect-select': { color: 'white' }
                                        }}
                                    >
                                        <MenuItem value="New">New</MenuItem>
                                        <MenuItem value="Like New">Like New</MenuItem>
                                        <MenuItem value="Good">Good</MenuItem>
                                        <MenuItem value="Fair">Fair</MenuItem>
                                        <MenuItem value="Poor">Poor</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Image URL"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleCreateItemChange}
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Features (comma-separated)"
                                    name="features"
                                    value={formData.features}
                                    onChange={handleCreateItemChange}
                                    placeholder="e.g., Waterproof, Portable, High Quality"
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Terms & Conditions"
                                    name="terms"
                                    value={formData.terms}
                                    onChange={handleCreateItemChange}
                                    multiline
                                    rows={2}
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a', p: 3 }}>
                    <Button onClick={() => setCreateItemDialog(false)} sx={{ color: '#ccc' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateItemSubmit} 
                        variant="contained"
                        sx={{ backgroundColor: '#9333ea' }}
                        disabled={createItemLoading || !formData.title || !formData.price}
                    >
                        {createItemLoading ? 'Creating...' : 'Add Product'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Item Dialog */}
            <Dialog
                open={editItemDialog}
                onClose={() => setEditItemDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    Edit Product - {selectedProduct?.title}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Product Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleCreateItemChange}
                                    required
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleCreateItemChange}
                                    multiline
                                    rows={3}
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: '#ccc' }}>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleCreateItemChange}
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
                                        <MenuItem value="Electronics">Electronics</MenuItem>
                                        <MenuItem value="Vehicles">Vehicles</MenuItem>
                                        <MenuItem value="Equipment">Equipment</MenuItem>
                                        <MenuItem value="Sports">Sports</MenuItem>
                                        <MenuItem value="Tools">Tools</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Daily Price (₹)"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleCreateItemChange}
                                    type="number"
                                    required
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Security Deposit (₹)"
                                    name="deposit"
                                    value={formData.deposit}
                                    onChange={handleCreateItemChange}
                                    type="number"
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleCreateItemChange}
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: '#ccc' }}>Condition</InputLabel>
                                    <Select
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleCreateItemChange}
                                        label="Condition"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#555' },
                                                '&:hover fieldset': { borderColor: '#9333ea' },
                                                '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                            },
                                            '& .MuiSelect-select': { color: 'white' }
                                        }}
                                    >
                                        <MenuItem value="New">New</MenuItem>
                                        <MenuItem value="Like New">Like New</MenuItem>
                                        <MenuItem value="Good">Good</MenuItem>
                                        <MenuItem value="Fair">Fair</MenuItem>
                                        <MenuItem value="Poor">Poor</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Image URL"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleCreateItemChange}
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Features (comma-separated)"
                                    name="features"
                                    value={formData.features}
                                    onChange={handleCreateItemChange}
                                    placeholder="e.g., Waterproof, Portable, High Quality"
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Terms & Conditions"
                                    name="terms"
                                    value={formData.terms}
                                    onChange={handleCreateItemChange}
                                    multiline
                                    rows={2}
                                    InputLabelProps={{ style: { color: '#ccc' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#555' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' },
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a', p: 3 }}>
                    <Button onClick={() => setEditItemDialog(false)} sx={{ color: '#ccc' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleEditItemSubmit} 
                        variant="contained"
                        sx={{ backgroundColor: '#9333ea' }}
                        disabled={editItemLoading || !formData.title || !formData.price}
                    >
                        {editItemLoading ? 'Updating...' : 'Update Product'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Item Dialog */}
            <Dialog
                open={viewItemDialog}
                onClose={() => setViewItemDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    Product Details - {selectedProduct?.title}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    {selectedProduct && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    {selectedProduct.image ? (
                                        <img
                                            src={selectedProduct.image}
                                            alt={selectedProduct.title}
                                            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                        />
                                    ) : (
                                        <Box sx={{ 
                                            height: 200, 
                                            backgroundColor: '#333', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            borderRadius: '8px'
                                        }}>
                                            <Typography variant="body2" sx={{ color: '#888' }}>
                                                No Image Available
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                                        {selectedProduct.title}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2, color: '#ccc' }}>
                                        {selectedProduct.description}
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Chip 
                                            label={selectedProduct.category} 
                                            size="small" 
                                            sx={{ backgroundColor: '#9333ea', color: 'white' }}
                                        />
                                        <Chip 
                                            label={selectedProduct.condition} 
                                            size="small" 
                                            sx={{ ml: 1, backgroundColor: '#555', color: 'white' }}
                                        />
                                    </Box>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#9333ea' }}>
                                        ₹{selectedProduct.price} / day
                                    </Typography>
                                    {selectedProduct.deposit > 0 && (
                                        <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                                            Security Deposit: ₹{selectedProduct.deposit}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                                        <strong>Location:</strong> {selectedProduct.location}
                                    </Typography>
                                    {selectedProduct.features && selectedProduct.features.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                                                <strong>Features:</strong>
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {selectedProduct.features.map((feature, index) => (
                                                    <Chip key={index} label={feature} variant="outlined" size="small" 
                                                        sx={{ borderColor: '#9333ea', color: '#9333ea' }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                    {selectedProduct.terms && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                                                <strong>Terms & Conditions:</strong>
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#888' }}>
                                                {selectedProduct.terms}
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a', p: 3 }}>
                    <Button onClick={() => setViewItemDialog(false)} sx={{ backgroundColor: '#9333ea' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Booking Details Dialog */}
            <Dialog open={bookingDetailsDialog} onClose={() => {
                console.log('Dialog closing');
                setBookingDetailsDialog(false);
            }} maxWidth="md" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    Booking Details - #{selectedBookingOrder?._id?.slice(-8) || 'N/A'}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    {selectedBookingOrder ? (
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                                Debug: Dialog is open, selectedBookingOrder ID: {selectedBookingOrder._id}
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Order Information
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Order ID:</strong> #{selectedBookingOrder._id?.slice(-8) || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Status:</strong> {selectedBookingOrder.status || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Total Amount:</strong> ${selectedBookingOrder.totalAmount || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Booking Date:</strong> {selectedBookingOrder.createdAt ? new Date(selectedBookingOrder.createdAt).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Customer Information
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Name:</strong> {selectedBookingOrder.renter?.name || 'Customer'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Email:</strong> {selectedBookingOrder.renter?.email || 'customer@example.com'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Phone:</strong> {selectedBookingOrder.renter?.phone || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Item Details
                                    </Typography>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Avatar
                                            src={selectedBookingOrder.item?.image || 'https://via.placeholder.com/50x50'}
                                            sx={{ mr: 2, width: 50, height: 50 }}
                                        />
                                        <Box>
                                            <Typography variant="body1">
                                                {selectedBookingOrder.item?.title || 'Item'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#ccc' }}>
                                                {selectedBookingOrder.item?.category || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Daily Rate:</strong> ${selectedBookingOrder.item?.price || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Location:</strong> {selectedBookingOrder.item?.location || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Rental Period
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Start Date:</strong> {selectedBookingOrder.startDate ? new Date(selectedBookingOrder.startDate).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>End Date:</strong> {selectedBookingOrder.endDate ? new Date(selectedBookingOrder.endDate).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Duration:</strong> {selectedBookingOrder.startDate && selectedBookingOrder.endDate ? 
                                            Math.ceil((new Date(selectedBookingOrder.endDate) - new Date(selectedBookingOrder.startDate)) / (1000 * 60 * 60 * 24)) + 1 : 0} days
                                    </Typography>
                                </Grid>
                                {selectedBookingOrder.notes && (
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom>
                                            Customer Notes
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#ccc' }}>
                                            {selectedBookingOrder.notes}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    ) : (
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="body2" sx={{ color: '#ccc' }}>
                                No booking data available
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a', p: 3 }}>
                    <Button onClick={() => setBookingDetailsDialog(false)} sx={{ color: '#ccc' }}>
                        Close
                    </Button>
                    {selectedBookingOrder?.status === 'pending' && (
                        <Button 
                            onClick={() => handleApproveBooking(selectedBookingOrder._id)} 
                            variant="contained"
                            sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
                        >
                            Approve Booking
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
            </Container>
        </>
    );
};

export default VendorDashboard;
