import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    TextField,
    Tab,
    Tabs,
    Alert,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    Avatar,
    Switch,
    FormControlLabel,
    CircularProgress,
    Snackbar,
    Pagination,
    InputAdornment
} from '@mui/material';
import {
    People,
    Store,
    ShoppingCart,
    AttachMoney,
    TrendingUp,
    Settings,
    Edit,
    Delete,
    Visibility,
    MoreVert,
    CheckCircle,
    Cancel,
    Assessment,
    Gavel,
    Search,
    Refresh,
    Logout
} from '@mui/icons-material';
import adminAPI from '../services/adminApi';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetailsOpen, setUserDetailsOpen] = useState(false);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Edit user form state
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'active',
        role: 'customer'
    });

    // Report states
    const [revenueReport, setRevenueReport] = useState(null);
    const [userReport, setUserReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // Data states
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVendors: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingVendors: 0,
        activeRentals: 0,
        totalProducts: 0,
        pendingProducts: 0
    });
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [systemSettings, setSystemSettings] = useState(null);

    // Pagination states
    const [userPage, setUserPage] = useState(1);
    const [vendorPage, setVendorPage] = useState(1);
    const [orderPage, setOrderPage] = useState(1);
    const [productPage, setProductPage] = useState(1);
    const [userTotal, setUserTotal] = useState(0);
    const [vendorTotal, setVendorTotal] = useState(0);
    const [orderTotal, setOrderTotal] = useState(0);
    const [productTotal, setProductTotal] = useState(0);

    // Search and filter states
    const [userSearch, setUserSearch] = useState('');
    const [vendorSearch, setVendorSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('');
    const [productStatusFilter, setProductStatusFilter] = useState('');
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (tabValue === 0) fetchUsers();
        else if (tabValue === 1) fetchVendors();
        else if (tabValue === 2) fetchOrders();
        else if (tabValue === 3) fetchProducts();
        else if (tabValue === 4) fetchSettings();
    }, [tabValue, userPage, vendorPage, orderPage, productPage, userSearch, roleFilter, statusFilter, productSearch, productStatusFilter]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getStats();
            setStats(response.data.stats);
            setError(null);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard statistics');
            showSnackbar('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getUsers({
                page: userPage,
                limit: 10,
                search: userSearch,
                role: roleFilter,
                status: statusFilter
            });
            setUsers(response.data.users);
            setUserTotal(response.data.pagination.total);
            setError(null);
        } catch (error) {
            console.error('Error fetching users:', error);
            showSnackbar('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getVendors({
                page: vendorPage,
                limit: 10
            });
            setVendors(response.data.vendors);
            setVendorTotal(response.data.pagination.total);
            setError(null);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            showSnackbar('Failed to load vendors', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getOrders({
                page: orderPage,
                limit: 10
            });
            setOrders(response.data.orders);
            setOrderTotal(response.data.pagination.total);
            setError(null);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showSnackbar('Failed to load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: productPage,
                limit: 10,
                search: productSearch,
                approvalStatus: productStatusFilter
            };
            const response = await adminAPI.getProducts(params);
            setProducts(response.data.products);
            setProductTotal(response.data.pagination.total);
            setError(null);
        } catch (error) {
            console.error('Error fetching products:', error);
            showSnackbar('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getSettings();
            setSystemSettings(response.data.settings);
            setError(null);
        } catch (error) {
            console.error('Error fetching settings:', error);
            showSnackbar('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleMenuClick = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleUserDetails = () => {
        setUserDetailsOpen(true);
        handleMenuClose();
    };

    const handleApproveVendor = async () => {
        try {
            await adminAPI.approveVendor(selectedUser._id);
            showSnackbar('Vendor approved successfully', 'success');
            setApproveDialogOpen(false);
            handleMenuClose();
            fetchVendors();
            fetchDashboardData(); // Refresh stats
        } catch (error) {
            console.error('Error approving vendor:', error);
            showSnackbar('Failed to approve vendor', 'error');
        }
    };

    const handleRejectVendor = async () => {
        try {
            await adminAPI.rejectVendor(selectedUser._id, 'Application rejected by admin');
            showSnackbar('Vendor rejected successfully', 'success');
            handleMenuClose();
            fetchVendors();
            fetchDashboardData(); // Refresh stats
        } catch (error) {
            console.error('Error rejecting vendor:', error);
            showSnackbar('Failed to reject vendor', 'error');
        }
    };

    const handleToggleUserStatus = async (userId, newStatus) => {
        try {
            await adminAPI.updateUserStatus(userId, newStatus);
            showSnackbar(`User ${newStatus} successfully`, 'success');
            fetchUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            showSnackbar('Failed to update user status', 'error');
        }
    };

    const handleSettingsChange = (category, field, value) => {
        setSystemSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const handleSaveSettings = async () => {
        try {
            await adminAPI.updateSettings(systemSettings);
            showSnackbar('Settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            showSnackbar('Failed to save settings', 'error');
        }
    };

    const handleEditUser = () => {
        setEditForm({
            name: selectedUser.name,
            email: selectedUser.email,
            phone: selectedUser.phone || '',
            status: selectedUser.status,
            role: selectedUser.role
        });
        setEditUserOpen(true);
        handleMenuClose();
    };

    const handleSaveUser = async () => {
        try {
            await adminAPI.updateUser(selectedUser._id, editForm);
            showSnackbar('User updated successfully', 'success');
            setEditUserOpen(false);
            fetchUsers();
            if (tabValue === 1) fetchVendors();
        } catch (error) {
            console.error('Error updating user:', error);
            showSnackbar('Failed to update user', 'error');
        }
    };

    const handleDeleteUser = () => {
        setDeleteConfirmOpen(true);
        handleMenuClose();
    };

    const confirmDeleteUser = async () => {
        try {
            await adminAPI.deleteUser(selectedUser._id);
            showSnackbar('User deleted successfully', 'success');
            setDeleteConfirmOpen(false);
            fetchUsers();
            if (tabValue === 1) fetchVendors();
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting user:', error);
            showSnackbar('Failed to delete user', 'error');
        }
    };

    const fetchRevenueReport = async () => {
        try {
            setReportLoading(true);
            const response = await adminAPI.getRevenueReport(dateRange);
            setRevenueReport(response.data.report);
        } catch (error) {
            console.error('Error fetching revenue report:', error);
            showSnackbar('Failed to load revenue report', 'error');
        } finally {
            setReportLoading(false);
        }
    };

    const fetchUserReport = async () => {
        try {
            setReportLoading(true);
            const response = await adminAPI.getUserReport();
            setUserReport(response.data.report);
        } catch (error) {
            console.error('Error fetching user report:', error);
            showSnackbar('Failed to load user report', 'error');
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        if (tabValue === 4) {
            fetchRevenueReport();
            fetchUserReport();
        }
    }, [tabValue, dateRange]);

    const handleApproveProduct = async (productId) => {
        try {
            await adminAPI.approveProduct(productId);
            showSnackbar('Product approved successfully', 'success');
            fetchProducts();
            fetchDashboardData(); // Refresh stats
        } catch (error) {
            console.error('Error approving product:', error);
            showSnackbar('Failed to approve product', 'error');
        }
    };

    const handleRejectProduct = async () => {
        try {
            if (!rejectReason.trim()) {
                showSnackbar('Please provide a rejection reason', 'error');
                return;
            }
            await adminAPI.rejectProduct(selectedUser._id, rejectReason);
            showSnackbar('Product rejected successfully', 'success');
            setRejectDialogOpen(false);
            setRejectReason('');
            fetchProducts();
            fetchDashboardData();
        } catch (error) {
            console.error('Error rejecting product:', error);
            showSnackbar('Failed to reject product', 'error');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await adminAPI.deleteProduct(productId);
                showSnackbar('Product deleted successfully', 'success');
                fetchProducts();
                fetchDashboardData();
            } catch (error) {
                console.error('Error deleting product:', error);
                showSnackbar('Failed to delete product', 'error');
            }
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showSnackbar('Logged out successfully', 'success');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'error';
            case 'vendor': return 'warning';
            case 'customer': return 'info';
            default: return 'default';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'inactive': return 'default';
            case 'rejected': return 'error';
            case 'suspended': return 'error';
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

    if (loading && !stats.totalUsers) {
        return (
            <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ color: 'white' }}>
                    Admin Dashboard
                </Typography>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchDashboardData}
                        sx={{ color: 'white', borderColor: 'white' }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Logout />}
                        onClick={handleLogout}
                        sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={<People />}
                        color="#9333ea"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Vendors"
                        value={stats.totalVendors}
                        subtitle={`${stats.pendingVendors} pending`}
                        icon={<Store />}
                        color="#ff9800"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Orders"
                        value={stats.totalOrders}
                        icon={<ShoppingCart />}
                        color="#4caf50"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Revenue"
                        value={`$${stats.totalRevenue.toLocaleString()}`}
                        icon={<AttachMoney />}
                        color="#2196f3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Active Rentals"
                        value={stats.activeRentals}
                        icon={<TrendingUp />}
                        color="#9c27b0"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Pending Vendors"
                        value={stats.pendingVendors}
                        icon={<Gavel />}
                        color="#f44336"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatCard
                        title="Pending Products"
                        value={stats.pendingProducts}
                        icon={<Store />}
                        color="#ff9800"
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
                    <Tab label="Users" />
                    <Tab label="Vendors" />
                    <Tab label="Orders" />
                    <Tab label="Products" />
                    <Tab label="System Settings" />
                    <Tab label="Reports" />
                </Tabs>

                {loading && <LinearProgress />}

                {/* Users Tab */}
                {tabValue === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">User Management</Typography>
                            <Box display="flex" gap={2}>
                                <TextField
                                    size="small"
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: '#ccc' }} />
                                            </InputAdornment>
                                        ),
                                        style: { color: 'white' }
                                    }}
                                    sx={{ backgroundColor: '#333', borderRadius: 1 }}
                                />
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel sx={{ color: '#ccc' }}>Role</InputLabel>
                                    <Select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        sx={{ color: 'white', backgroundColor: '#333' }}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="customer">Customer</MenuItem>
                                        <MenuItem value="vendor">Vendor</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    startIcon={<People />}
                                    sx={{ backgroundColor: '#9333ea' }}
                                    onClick={() => adminAPI.exportUsers()}
                                >
                                    Export Users
                                </Button>
                            </Box>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white' }}>User</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Role</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Registered</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Last Login</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Orders/Spent</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar sx={{ mr: 2, bgcolor: '#9333ea' }}>
                                                        {user.name.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2">{user.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#888' }}>
                                                            {user.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    color={getRoleColor(user.role)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.status}
                                                    color={getStatusColor(user.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                <Typography variant="body2">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                <Typography variant="body2">
                                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                {user.totalOrders || 0} / ${user.totalSpent || 0}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={(e) => handleMenuClick(e, user)}
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

                        <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination
                                count={Math.ceil(userTotal / 10)}
                                page={userPage}
                                onChange={(e, page) => setUserPage(page)}
                                sx={{ '& .MuiPaginationItem-root': { color: 'white' } }}
                            />
                        </Box>
                    </Box>
                )}

                {/* Vendors Tab */}
                {tabValue === 1 && (
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">Vendor Management</Typography>
                            {stats.pendingVendors > 0 && (
                                <Alert severity="warning">
                                    {stats.pendingVendors} vendors awaiting approval
                                </Alert>
                            )}
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white' }}>Vendor</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Company</TableCell>
                                        <TableCell sx={{ color: 'white' }}>GSTIN</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Products</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {vendors.map((vendor) => (
                                        <TableRow key={vendor._id}>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar sx={{ mr: 2, bgcolor: '#ff9800' }}>
                                                        {vendor.name.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2">{vendor.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#888' }}>
                                                            {vendor.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>{vendor.companyName}</TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>{vendor.gstNo}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={vendor.isApproved ? 'Approved' : 'Pending'}
                                                    color={vendor.isApproved ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                {vendor.totalProducts || 0}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={(e) => handleMenuClick(e, vendor)}
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

                        <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination
                                count={Math.ceil(vendorTotal / 10)}
                                page={vendorPage}
                                onChange={(e, page) => setVendorPage(page)}
                                sx={{ '& .MuiPaginationItem-root': { color: 'white' } }}
                            />
                        </Box>
                    </Box>
                )}

                {/* Orders Tab */}
                {tabValue === 2 && (
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">Order Management</Typography>
                            <Button
                                variant="contained"
                                startIcon={<ShoppingCart />}
                                sx={{ backgroundColor: '#9333ea' }}
                                onClick={() => adminAPI.exportOrders()}
                            >
                                Export Orders
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white' }}>Order #</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Customer</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Vendor</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Total</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order._id}>
                                            <TableCell sx={{ color: '#ccc' }}>{order.orderNumber}</TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>{order.customer?.name}</TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>{order.vendor?.companyName || order.vendor?.name}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.status}
                                                    color={getStatusColor(order.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>${order.pricing.totalAmount}</TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination
                                count={Math.ceil(orderTotal / 10)}
                                page={orderPage}
                                onChange={(e, page) => setOrderPage(page)}
                                sx={{ '& .MuiPaginationItem-root': { color: 'white' } }}
                            />
                        </Box>
                    </Box>
                )}

                {/* Products Tab */}
                {tabValue === 3 && (
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">Product Management</Typography>
                            <Box display="flex" gap={2}>
                                <TextField
                                    placeholder="Search products..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    size="small"
                                    InputProps={{
                                        startAdornment: <Search sx={{ color: '#ccc', mr: 1 }} />,
                                        style: { color: 'white' }
                                    }}
                                    sx={{ backgroundColor: '#333', borderRadius: 1 }}
                                />
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel sx={{ color: '#ccc' }}>Status</InputLabel>
                                    <Select
                                        value={productStatusFilter}
                                        onChange={(e) => setProductStatusFilter(e.target.value)}
                                        sx={{ color: 'white', backgroundColor: '#333' }}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="approved">Approved</MenuItem>
                                        <MenuItem value="rejected">Rejected</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white' }}>Product Name</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Vendor</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Category</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Price (Daily)</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product._id}>
                                            <TableCell sx={{ color: '#ccc' }}>{product.title}</TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                {product.vendor?.companyName || product.vendor?.name}
                                            </TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                <Chip label={product.category} size="small" />
                                            </TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                ${product.price || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={product.approvalStatus}
                                                    color={
                                                        product.approvalStatus === 'approved' ? 'success' :
                                                            product.approvalStatus === 'rejected' ? 'error' :
                                                                'warning'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    {product.approvalStatus === 'pending' && (
                                                        <>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleApproveProduct(product._id)}
                                                                sx={{ color: '#4caf50' }}
                                                                title="Approve"
                                                            >
                                                                <CheckCircle />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedUser(product);
                                                                    setRejectDialogOpen(true);
                                                                }}
                                                                sx={{ color: '#f44336' }}
                                                                title="Reject"
                                                            >
                                                                <Cancel />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        sx={{ color: '#ff9800' }}
                                                        title="Delete"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination
                                count={Math.ceil(productTotal / 10)}
                                page={productPage}
                                onChange={(e, page) => setProductPage(page)}
                                sx={{ '& .MuiPaginationItem-root': { color: 'white' } }}
                            />
                        </Box>
                    </Box>
                )}

                {/* System Settings Tab */}
                {tabValue === 4 && systemSettings && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            System Settings
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ backgroundColor: '#333', color: 'white', p: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Registration Settings
                                    </Typography>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={systemSettings.registration?.allowVendorRegistration}
                                                onChange={(e) => handleSettingsChange('registration', 'allowVendorRegistration', e.target.checked)}
                                                sx={{ color: '#9333ea' }}
                                            />
                                        }
                                        label="Allow Vendor Registration"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={systemSettings.registration?.requireGstinForVendors}
                                                onChange={(e) => handleSettingsChange('registration', 'requireGstinForVendors', e.target.checked)}
                                                sx={{ color: '#9333ea' }}
                                            />
                                        }
                                        label="Require GSTIN for Vendors"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={systemSettings.registration?.autoApproveVendors}
                                                onChange={(e) => handleSettingsChange('registration', 'autoApproveVendors', e.target.checked)}
                                                sx={{ color: '#9333ea' }}
                                            />
                                        }
                                        label="Auto-approve Vendors"
                                    />
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ backgroundColor: '#333', color: 'white', p: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Rental Settings
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Max Rental Days"
                                        type="number"
                                        value={systemSettings.rental?.maxRentalDays}
                                        onChange={(e) => handleSettingsChange('rental', 'maxRentalDays', parseInt(e.target.value))}
                                        sx={{ mb: 2 }}
                                        InputProps={{ style: { color: 'white' } }}
                                        InputLabelProps={{ style: { color: '#ccc' } }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Late Fee per Hour ($)"
                                        type="number"
                                        value={systemSettings.rental?.lateFeePerHour}
                                        onChange={(e) => handleSettingsChange('rental', 'lateFeePerHour', parseInt(e.target.value))}
                                        sx={{ mb: 2 }}
                                        InputProps={{ style: { color: 'white' } }}
                                        InputLabelProps={{ style: { color: '#ccc' } }}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={systemSettings.rental?.securityDepositRequired}
                                                onChange={(e) => handleSettingsChange('rental', 'securityDepositRequired', e.target.checked)}
                                                sx={{ color: '#9333ea' }}
                                            />
                                        }
                                        label="Require Security Deposit"
                                    />
                                </Card>
                            </Grid>
                        </Grid>
                        <Box mt={3}>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: '#9333ea' }}
                                onClick={handleSaveSettings}
                            >
                                Save Settings
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Reports Tab */}
                {tabValue === 4 && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Reports & Analytics
                        </Typography>

                        {/* Date Range Filter */}
                        <Box display="flex" gap={2} mb={3}>
                            <TextField
                                label="Start Date"
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                InputLabelProps={{ shrink: true, style: { color: '#ccc' } }}
                                InputProps={{ style: { color: 'white' } }}
                                sx={{ backgroundColor: '#333', borderRadius: 1 }}
                            />
                            <TextField
                                label="End Date"
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                InputLabelProps={{ shrink: true, style: { color: '#ccc' } }}
                                InputProps={{ style: { color: 'white' } }}
                                sx={{ backgroundColor: '#333', borderRadius: 1 }}
                            />
                            <Button
                                variant="contained"
                                onClick={() => {
                                    fetchRevenueReport();
                                    fetchUserReport();
                                }}
                                sx={{ backgroundColor: '#9333ea' }}
                            >
                                Generate Report
                            </Button>
                        </Box>

                        {reportLoading && <LinearProgress sx={{ mb: 3 }} />}

                        <Grid container spacing={3}>
                            {/* Revenue Report */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ backgroundColor: '#333', color: 'white', p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Revenue Report
                                    </Typography>
                                    {revenueReport ? (
                                        <>
                                            <Typography variant="h4" sx={{ mb: 2, color: '#4caf50' }}>
                                                ${revenueReport.totalRevenue?.toLocaleString() || 0}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                Total Revenue ({dateRange.startDate} to {dateRange.endDate})
                                            </Typography>

                                            {revenueReport.revenueByDate && revenueReport.revenueByDate.length > 0 ? (
                                                <Box mt={3}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Daily Breakdown
                                                    </Typography>
                                                    <TableContainer>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell sx={{ color: 'white' }}>Date</TableCell>
                                                                    <TableCell sx={{ color: 'white' }}>Orders</TableCell>
                                                                    <TableCell sx={{ color: 'white' }}>Revenue</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {revenueReport.revenueByDate.slice(0, 10).map((item, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell sx={{ color: '#ccc' }}>
                                                                            {item._id.year}-{String(item._id.month).padStart(2, '0')}-{String(item._id.day).padStart(2, '0')}
                                                                        </TableCell>
                                                                        <TableCell sx={{ color: '#ccc' }}>{item.orderCount}</TableCell>
                                                                        <TableCell sx={{ color: '#ccc' }}>${item.totalRevenue.toLocaleString()}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Box>
                                            ) : (
                                                <Alert severity="info" sx={{ mt: 2 }}>
                                                    No revenue data for selected date range
                                                </Alert>
                                            )}
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            Click "Generate Report" to view revenue data
                                        </Typography>
                                    )}
                                </Card>
                            </Grid>

                            {/* User Report */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ backgroundColor: '#333', color: 'white', p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        User Statistics
                                    </Typography>
                                    {userReport ? (
                                        <>
                                            {/* Users by Role */}
                                            <Box mb={3}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Users by Role
                                                </Typography>
                                                {userReport.usersByRole?.map((item, index) => (
                                                    <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                                                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                            {item._id}
                                                        </Typography>
                                                        <Chip
                                                            label={item.count}
                                                            size="small"
                                                            color={item._id === 'admin' ? 'error' : item._id === 'vendor' ? 'warning' : 'info'}
                                                        />
                                                    </Box>
                                                ))}
                                            </Box>

                                            {/* Users by Status */}
                                            <Box mb={3}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Users by Status
                                                </Typography>
                                                {userReport.usersByStatus?.map((item, index) => (
                                                    <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                                                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                            {item._id}
                                                        </Typography>
                                                        <Chip
                                                            label={item.count}
                                                            size="small"
                                                            color={item._id === 'active' ? 'success' : item._id === 'suspended' ? 'error' : 'default'}
                                                        />
                                                    </Box>
                                                ))}
                                            </Box>

                                            {/* Recent Registrations */}
                                            {userReport.recentRegistrations && userReport.recentRegistrations.length > 0 && (
                                                <Box>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Recent Registrations (Last 30 Days)
                                                    </Typography>
                                                    <Typography variant="h5" sx={{ color: '#9333ea' }}>
                                                        {userReport.recentRegistrations.reduce((sum, item) => sum + item.count, 0)}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        New users registered
                                                    </Typography>
                                                </Box>
                                            )}
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            Click "Generate Report" to view user statistics
                                        </Typography>
                                    )}
                                </Card>
                            </Grid>

                            {/* Export Buttons */}
                            <Grid item xs={12}>
                                <Card sx={{ backgroundColor: '#333', color: 'white', p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Export Data
                                    </Typography>
                                    <Box display="flex" gap={2}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<People />}
                                            onClick={() => adminAPI.exportUsers()}
                                            sx={{ color: 'white', borderColor: 'white' }}
                                        >
                                            Export All Users (CSV)
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<ShoppingCart />}
                                            onClick={() => adminAPI.exportOrders()}
                                            sx={{ color: 'white', borderColor: 'white' }}
                                        >
                                            Export All Orders (CSV)
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>

            {/* User Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleUserDetails}>
                    <Visibility sx={{ mr: 1 }} /> View Details
                </MenuItem>
                <MenuItem onClick={handleEditUser}>
                    <Edit sx={{ mr: 1 }} /> Edit User
                </MenuItem>
                {selectedUser?.role === 'vendor' && !selectedUser?.isApproved && (
                    <>
                        <MenuItem onClick={() => setApproveDialogOpen(true)}>
                            <CheckCircle sx={{ mr: 1 }} /> Approve Vendor
                        </MenuItem>
                        <MenuItem onClick={handleRejectVendor}>
                            <Cancel sx={{ mr: 1 }} /> Reject Vendor
                        </MenuItem>
                    </>
                )}
                {selectedUser?.status === 'active' ? (
                    <MenuItem onClick={() => handleToggleUserStatus(selectedUser._id, 'suspended')}>
                        <Cancel sx={{ mr: 1 }} /> Suspend User
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => handleToggleUserStatus(selectedUser._id, 'active')}>
                        <CheckCircle sx={{ mr: 1 }} /> Activate User
                    </MenuItem>
                )}
                <MenuItem onClick={handleDeleteUser} sx={{ color: '#f44336' }}>
                    <Delete sx={{ mr: 1 }} /> Delete User
                </MenuItem>
            </Menu>

            {/* User Details Dialog */}
            <Dialog
                open={userDetailsOpen}
                onClose={() => setUserDetailsOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    User Details - {selectedUser?.name}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    {selectedUser && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Email
                                </Typography>
                                <Typography>{selectedUser.email}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Role
                                </Typography>
                                <Chip label={selectedUser.role} color={getRoleColor(selectedUser.role)} size="small" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Status
                                </Typography>
                                <Chip label={selectedUser.status} color={getStatusColor(selectedUser.status)} size="small" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Registered
                                </Typography>
                                <Typography>{new Date(selectedUser.createdAt).toLocaleDateString()}</Typography>
                            </Grid>
                            {selectedUser.companyName && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Company
                                    </Typography>
                                    <Typography>{selectedUser.companyName}</Typography>
                                </Grid>
                            )}
                            {selectedUser.gstNo && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        GSTIN
                                    </Typography>
                                    <Typography>{selectedUser.gstNo}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a' }}>
                    <Button onClick={() => setUserDetailsOpen(false)} sx={{ color: '#ccc' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approve Vendor Dialog */}
            <Dialog
                open={approveDialogOpen}
                onClose={() => setApproveDialogOpen(false)}
            >
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    Approve Vendor
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    <Typography>
                        Are you sure you want to approve {selectedUser?.name} as a vendor?
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Company: {selectedUser?.companyName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Email: {selectedUser?.email}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a' }}>
                    <Button onClick={() => setApproveDialogOpen(false)} sx={{ color: '#ccc' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleApproveVendor} variant="contained" sx={{ backgroundColor: '#4caf50' }}>
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog
                open={editUserOpen}
                onClose={() => setEditUserOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    Edit User - {selectedUser?.name}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white', mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        sx={{ mb: 2 }}
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: '#ccc' } }}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        sx={{ mb: 2 }}
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: '#ccc' } }}
                    />
                    <TextField
                        fullWidth
                        label="Phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        sx={{ mb: 2 }}
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: '#ccc' } }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel sx={{ color: '#ccc' }}>Role</InputLabel>
                        <Select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            sx={{ color: 'white' }}
                        >
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="vendor">Vendor</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel sx={{ color: '#ccc' }}>Status</InputLabel>
                        <Select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            sx={{ color: 'white' }}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a' }}>
                    <Button onClick={() => setEditUserOpen(false)} sx={{ color: '#ccc' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveUser} variant="contained" sx={{ backgroundColor: '#9333ea' }}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    Confirm Delete
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action will deactivate the user account. The user will no longer be able to log in.
                    </Alert>
                    <Typography>
                        Are you sure you want to delete <strong>{selectedUser?.name}</strong>?
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Email: {selectedUser?.email}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a' }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: '#ccc' }}>
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteUser} variant="contained" sx={{ backgroundColor: '#f44336' }}>
                        Delete User
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Product Rejection Dialog */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
                    Reject Product
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#2a2a2a', color: 'white', mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Please provide a reason for rejecting this product:
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        sx={{
                            backgroundColor: '#333',
                            '& .MuiInputBase-input': { color: 'white' }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#2a2a2a' }}>
                    <Button onClick={() => {
                        setRejectDialogOpen(false);
                        setRejectReason('');
                    }} sx={{ color: '#ccc' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleRejectProduct} variant="contained" sx={{ backgroundColor: '#f44336' }}>
                        Reject Product
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminDashboard;
