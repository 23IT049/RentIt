import { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    IconButton,
    Avatar,
    Pagination,
    CircularProgress,
    Alert,
    Chip,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';
import {
    Search,
    ViewModule,
    ViewList,
    Person,
    Email,
    Phone,
    ShoppingCart,
    AttachMoney
} from '@mui/icons-material';
import VendorNavbar from '../components/VendorNavbar';
import vendorAPI from '../services/vendorApi';

const VendorCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        fetchCustomers();
    }, [page, search]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await vendorAPI.getCustomers({
                page,
                limit: 12,
                search
            });

            if (response.data.success) {
                setCustomers(response.data.customers);
                setTotalPages(response.data.pagination.pages);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            setError('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const handleViewModeChange = (event, newMode) => {
        if (newMode !== null) {
            setViewMode(newMode);
        }
    };

    const CustomerCard = ({ customer }) => (
        <Card sx={{ backgroundColor: '#FFFFFF', color: '#0284C7', height: '100%', border: '1px solid #BAE6FD' }}>
            <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                    <Avatar
                        src={customer.avatar}
                        sx={{ width: 80, height: 80, mb: 2, bgcolor: '#0284C7' }}
                    >
                        <Person sx={{ fontSize: 40 }} />
                    </Avatar>

                    <Typography variant="h6" gutterBottom sx={{ color: '#0284C7' }}>
                        {customer.name}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <Email sx={{ fontSize: 16, color: '#0284C7' }} />
                        <Typography variant="body2" sx={{ color: '#0284C7' }}>
                            {customer.email}
                        </Typography>
                    </Box>

                    {customer.phone && (
                        <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                            <Phone sx={{ fontSize: 16, color: '#0284C7' }} />
                            <Typography variant="body2" sx={{ color: '#0284C7' }}>
                                {customer.phone}
                            </Typography>
                        </Box>
                    )}

                    <Box display="flex" gap={2} mt={2}>
                        <Chip
                            icon={<ShoppingCart style={{ color: '#FFFFFF' }} />}
                            label={`${customer.totalOrders} orders`}
                            size="small"
                            sx={{ bgcolor: '#0284C7', color: '#FFFFFF' }}
                        />
                        <Chip
                            icon={<AttachMoney style={{ color: '#FFFFFF' }} />}
                            label={`$${customer.totalSpent.toFixed(2)}`}
                            size="small"
                            sx={{ bgcolor: '#0284C7', color: '#FFFFFF' }}
                        />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    const CustomerListItem = ({ customer }) => (
        <Card sx={{ backgroundColor: '#FFFFFF', color: '#0284C7', mb: 2, border: '1px solid #BAE6FD' }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={3}>
                    <Avatar
                        src={customer.avatar}
                        sx={{ width: 60, height: 60, bgcolor: '#0284C7' }}
                    >
                        <Person sx={{ fontSize: 30 }} />
                    </Avatar>

                    <Box flex={1}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#0284C7' }}>
                            {customer.name}
                        </Typography>
                        <Box display="flex" gap={3}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <Email sx={{ fontSize: 16, color: '#0284C7' }} />
                                <Typography variant="body2" sx={{ color: '#0284C7' }}>
                                    {customer.email}
                                </Typography>
                            </Box>
                            {customer.phone && (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Phone sx={{ fontSize: 16, color: '#0284C7' }} />
                                    <Typography variant="body2" sx={{ color: '#0284C7' }}>
                                        {customer.phone}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Box display="flex" gap={2}>
                        <Chip
                            icon={<ShoppingCart style={{ color: '#FFFFFF' }} />}
                            label={`${customer.totalOrders} orders`}
                            size="small"
                            sx={{ bgcolor: '#0284C7', color: '#FFFFFF' }}
                        />
                        <Chip
                            icon={<AttachMoney style={{ color: '#FFFFFF' }} />}
                            label={`$${customer.totalSpent.toFixed(2)}`}
                            size="small"
                            sx={{ bgcolor: '#0284C7', color: '#FFFFFF' }}
                        />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <>
            <VendorNavbar />
            <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
                <Paper sx={{ backgroundColor: '#FFFFFF', color: '#0284C7', p: 3, boxShadow: 'none' }}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" sx={{ color: '#0284C7' }}>
                            Customers
                        </Typography>

                        <Box display="flex" gap={2} alignItems="center">
                            {/* Search Bar */}
                            <TextField
                                placeholder="Search customers..."
                                value={search}
                                onChange={handleSearchChange}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: '#0284C7' }} />
                                        </InputAdornment>
                                    ),
                                    style: { color: '#0284C7' }
                                }}
                                sx={{
                                    width: 300,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 1,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#BAE6FD' },
                                        '&:hover fieldset': { borderColor: '#0284C7' },
                                        '&.Mui-focused fieldset': { borderColor: '#0284C7' }
                                    }
                                }}
                            />

                            {/* View Switcher */}
                            <ToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={handleViewModeChange}
                                size="small"
                                sx={{
                                    '& .MuiToggleButton-root': {
                                        color: '#0284C7',
                                        borderColor: '#BAE6FD',
                                        '&.Mui-selected': {
                                            backgroundColor: '#0284C7',
                                            color: '#FFFFFF',
                                            '&:hover': {
                                                backgroundColor: '#026aa1'
                                            }
                                        }
                                    }
                                }}
                            >
                                <ToggleButton value="grid">
                                    <ViewModule />
                                </ToggleButton>
                                <ToggleButton value="list">
                                    <ViewList />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    </Box>

                    {/* Loading State */}
                    {loading && (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress sx={{ color: '#0284C7' }} />
                        </Box>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Empty State */}
                    {!loading && !error && customers.length === 0 && (
                        <Alert severity="info">
                            {search ? 'No customers found matching your search.' : 'No customers yet. Customers who rent your products will appear here.'}
                        </Alert>
                    )}

                    {/* Customers Grid View */}
                    {!loading && !error && customers.length > 0 && viewMode === 'grid' && (
                        <Grid container spacing={3}>
                            {customers.map((customer) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={customer._id}>
                                    <CustomerCard customer={customer} />
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Customers List View */}
                    {!loading && !error && customers.length > 0 && viewMode === 'list' && (
                        <Box>
                            {customers.map((customer) => (
                                <CustomerListItem key={customer._id} customer={customer} />
                            ))}
                        </Box>
                    )}

                    {/* Pagination */}
                    {!loading && customers.length > 0 && totalPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(e, value) => setPage(value)}
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        color: '#0284C7',
                                        borderColor: '#BAE6FD',
                                        '&.Mui-selected': {
                                            backgroundColor: '#0284C7',
                                            color: '#FFFFFF',
                                            '&:hover': {
                                                backgroundColor: '#026aa1'
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>
                    )}
                </Paper>
            </Container>
        </>
    );
};

export default VendorCustomers;
