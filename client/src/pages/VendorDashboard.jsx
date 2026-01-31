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
    CircularProgress
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
    Assessment
} from '@mui/icons-material';
import VendorNavbar from '../components/VendorNavbar';
import { itemsAPI, bookingsAPI } from '../services/api';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
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
                                                <TableRow key={order.id}>
                                                    <TableCell sx={{ color: '#ccc' }}>{order.id}</TableCell>
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
                                                        <IconButton
                                                            onClick={(e) => handleMenuClick(e, order)}
                                                            sx={{ color: '#ccc' }}
                                                        >
                                                            <MoreVert />
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

                    {/* Products Tab */}
                    {tabValue === 1 && (
                        <Box sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6">My Products</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => navigate('/create-item')}
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
                                                            onClick={() => navigate(`/edit-item/${product._id}`)}
                                                            sx={{ color: '#9333ea', borderColor: '#9333ea' }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<Visibility />}
                                                            onClick={() => navigate(`/items/${product._id}`)}
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
            </Container>
        </>
    );
};

export default VendorDashboard;
