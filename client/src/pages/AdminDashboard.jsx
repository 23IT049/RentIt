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
    FormControlLabel
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
    Gavel
} from '@mui/icons-material';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetailsOpen, setUserDetailsOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    
    // Mock data - replace with API calls
    const [stats, setStats] = useState({
        totalUsers: 1245,
        totalVendors: 89,
        totalOrders: 3421,
        totalRevenue: 156780,
        pendingVendors: 12,
        activeRentals: 156
    });

    const [users, setUsers] = useState([
        {
            id: 'USR-000001',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'customer',
            status: 'active',
            registeredAt: '2024-01-10',
            lastLogin: '2024-01-15',
            totalOrders: 5,
            totalSpent: 1250
        },
        {
            id: 'USR-000002',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'vendor',
            status: 'pending',
            registeredAt: '2024-01-12',
            lastLogin: '2024-01-14',
            companyName: 'Smith Rentals',
            gstNo: '27AAAPL1234C1ZV',
            isApproved: false
        },
        {
            id: 'USR-000003',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'vendor',
            status: 'active',
            registeredAt: '2024-01-08',
            lastLogin: '2024-01-15',
            companyName: 'Mike Equipment',
            gstNo: '19AAAPL5678B2ZY',
            isApproved: true
        }
    ]);

    const [systemSettings, setSystemSettings] = useState({
        allowVendorRegistration: true,
        requireGstinForVendors: true,
        autoApproveVendors: false,
        enableCouponCodes: true,
        maxRentalDays: 30,
        lateFeePerHour: 5,
        securityDepositRequired: true
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // API calls to fetch dashboard data
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
            // API call to approve vendor
            setUsers(users.map(user => 
                user.id === selectedUser.id 
                    ? { ...user, status: 'active', isApproved: true }
                    : user
            ));
            setApproveDialogOpen(false);
            handleMenuClose();
        } catch (error) {
            console.error('Error approving vendor:', error);
        }
    };

    const handleRejectVendor = async () => {
        try {
            // API call to reject vendor
            setUsers(users.map(user => 
                user.id === selectedUser.id 
                    ? { ...user, status: 'rejected' }
                    : user
            ));
            handleMenuClose();
        } catch (error) {
            console.error('Error rejecting vendor:', error);
        }
    };

    const handleSettingsChange = (setting, value) => {
        setSystemSettings(prev => ({
            ...prev,
            [setting]: value
        }));
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

    return (
        <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
                Admin Dashboard
            </Typography>

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
                    <Tab label="System Settings" />
                    <Tab label="Reports" />
                </Tabs>

                {/* Users Tab */}
                {tabValue === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">User Management</Typography>
                            <Button
                                variant="contained"
                                startIcon={<People />}
                                sx={{ backgroundColor: '#9333ea' }}
                            >
                                Export Users
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white' }}>User</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Role</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Registered</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Orders/Spent</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
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
                                                <Box>
                                                    <Typography variant="body2">{user.registeredAt}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#888' }}>
                                                        Last: {user.lastLogin}
                                                    </Typography>
                                                </Box>
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
                    </Box>
                )}

                {/* Vendors Tab */}
                {tabValue === 1 && (
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">Vendor Management</Typography>
                            <Alert severity="warning" sx={{ mr: 2 }}>
                                {stats.pendingVendors} vendors awaiting approval
                            </Alert>
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
                                    {users.filter(user => user.role === 'vendor').map((vendor) => (
                                        <TableRow key={vendor.id}>
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
                                                    label={vendor.status}
                                                    color={getStatusColor(vendor.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#ccc' }}>
                                                {Math.floor(Math.random() * 20) + 5}
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
                    </Box>
                )}

                {/* Orders Tab */}
                {tabValue === 2 && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Management
                        </Typography>
                        <Alert severity="info">
                            Order management interface - view all orders, manage disputes, and track payments
                        </Alert>
                    </Box>
                )}

                {/* System Settings Tab */}
                {tabValue === 3 && (
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
                                                checked={systemSettings.allowVendorRegistration}
                                                onChange={(e) => handleSettingsChange('allowVendorRegistration', e.target.checked)}
                                                sx={{ color: '#9333ea' }}
                                            />
                                        }
                                        label="Allow Vendor Registration"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={systemSettings.requireGstinForVendors}
                                                onChange={(e) => handleSettingsChange('requireGstinForVendors', e.target.checked)}
                                                sx={{ color: '#9333ea' }}
                                            />
                                        }
                                        label="Require GSTIN for Vendors"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={systemSettings.autoApproveVendors}
                                                onChange={(e) => handleSettingsChange('autoApproveVendors', e.target.checked)}
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
                                        value={systemSettings.maxRentalDays}
                                        onChange={(e) => handleSettingsChange('maxRentalDays', parseInt(e.target.value))}
                                        sx={{ mb: 2 }}
                                        InputProps={{ style: { color: 'white' } }}
                                        InputLabelProps={{ style: { color: '#ccc' } }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Late Fee per Hour ($)"
                                        type="number"
                                        value={systemSettings.lateFeePerHour}
                                        onChange={(e) => handleSettingsChange('lateFeePerHour', parseInt(e.target.value))}
                                        sx={{ mb: 2 }}
                                        InputProps={{ style: { color: 'white' } }}
                                        InputLabelProps={{ style: { color: '#ccc' } }}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={systemSettings.securityDepositRequired}
                                                onChange={(e) => handleSettingsChange('securityDepositRequired', e.target.checked)}
                                                sx={{ color: '#9333ea' }}
                                            />
                                        }
                                        label="Require Security Deposit"
                                    />
                                </Card>
                            </Grid>
                        </Grid>
                        <Box mt={3}>
                            <Button variant="contained" sx={{ backgroundColor: '#9333ea' }}>
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
                        <Alert severity="info">
                            Comprehensive reporting dashboard coming soon! Generate reports for revenue, user activity, and system performance.
                        </Alert>
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
                <MenuItem onClick={() => navigate(`/users/${selectedUser?.id}/edit`)}>
                    <Edit sx={{ mr: 1 }} /> Edit User
                </MenuItem>
                {selectedUser?.role === 'vendor' && selectedUser?.status === 'pending' && (
                    <>
                        <MenuItem onClick={() => setApproveDialogOpen(true)}>
                            <CheckCircle sx={{ mr: 1 }} /> Approve Vendor
                        </MenuItem>
                        <MenuItem onClick={handleRejectVendor}>
                            <Cancel sx={{ mr: 1 }} /> Reject Vendor
                        </MenuItem>
                    </>
                )}
                <MenuItem onClick={() => {/* Disable user */}}>
                    <Delete sx={{ mr: 1 }} /> Disable User
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
                        <Grid container spacing={2}>
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
                                <Typography>{selectedUser.registeredAt}</Typography>
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
                    <Button variant="contained" sx={{ backgroundColor: '#9333ea' }}>
                        Edit User
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
        </Container>
    );
};

export default AdminDashboard;
