import { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    TextField,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Paper,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import { itemsAPI } from '../services/api';

const Home = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        fetchItems();
    }, [filters]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.category) params.category = filters.category;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;

            const response = await itemsAPI.getAll(params);
            setItems(response.data.items);
            setError('');
        } catch (err) {
            setError('Failed to load items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                {/* Hero Section */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ color: 'white' }}>
                        Rent Anything, Anytime
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ color: '#ccc' }}>
                        24-hour rentals made easy
                    </Typography>
                </Box>

                {/* Filters */}
                <Paper elevation={2} sx={{ p: 3, mb: 4, backgroundColor: '#2a2a2a' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Search items..."
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#ccc' }} />
                                        </InputAdornment>
                                    ),
                                    style: { color: 'white' }
                                }}
                                InputLabelProps={{ style: { color: '#ccc' } }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#555',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#9333ea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#9333ea',
                                        },
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: '#ccc' }}>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    label="Category"
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
                        <Grid item xs={6} md={2}>
                            <TextField
                                fullWidth
                                label="Min Price"
                                name="minPrice"
                                type="number"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                label="Max Price"
                                name="maxPrice"
                                type="number"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Items Grid */}
                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : items.length === 0 ? (
                    <Box textAlign="center" py={8}>
                        <Typography variant="h6" color="text.secondary">
                            No items found. Try adjusting your filters.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {items.map((item) => (
                            <Grid item key={item._id} xs={12} sm={6} md={4}>
                                <ItemCard item={item} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </>
    );
};

export default Home;
