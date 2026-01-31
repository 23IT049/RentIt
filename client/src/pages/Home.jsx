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
    InputAdornment,
    Fade,
    Grow
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

            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(180deg, #E0F2FE 0%, #FFFFFF 100%)',
                    borderBottom: '2px solid #0284C7',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.2) 0%, rgba(2, 132, 199, 0) 70%)',
                        animation: 'pulse 4s ease-in-out infinite',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -150,
                        left: -150,
                        width: 500,
                        height: 500,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, rgba(2, 132, 199, 0) 70%)',
                        animation: 'pulse 5s ease-in-out infinite',
                        animationDelay: '1s',
                    }}
                />

                <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
                    <Fade in timeout={800}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography
                                variant="h2"
                                gutterBottom
                                className="animate-slideDown"
                                sx={{
                                    fontWeight: 800,
                                    color: '#0284C7',
                                    mb: 2,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                                }}
                            >
                                Rent Anything, Anytime
                            </Typography>
                            <Typography
                                variant="h5"
                                className="animate-slideUp"
                                sx={{
                                    color: '#0284C7',
                                    fontWeight: 600,
                                    mb: 4,
                                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                                }}
                            >
                                24-hour rentals made easy ✨
                            </Typography>
                        </Box>
                    </Fade>

                    {/* Search & Filters */}
                    <Grow in timeout={1000}>
                        <Paper
                            elevation={0}
                            className="animate-scaleIn"
                            sx={{
                                p: 3,
                                backgroundColor: '#FFFFFF',
                                backdropFilter: 'blur(10px)',
                                border: '2px solid #0284C7',
                                borderRadius: '1rem',
                                boxShadow: '0 20px 25px -5px rgba(2, 132, 199, 0.2)',
                            }}
                        >
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
                                                    <SearchIcon sx={{ color: '#0284C7' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: '#FFFFFF',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.2)',
                                                },
                                                '&.Mui-focused': {
                                                    boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)',
                                                }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#0284C7' }}>Category</InputLabel>
                                        <Select
                                            name="category"
                                            value={filters.category}
                                            onChange={handleFilterChange}
                                            label="Category"
                                            sx={{
                                                backgroundColor: '#FFFFFF',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.2)',
                                                }
                                            }}
                                        >
                                            <MenuItem value="">All Categories</MenuItem>
                                            <MenuItem value="Electronics">📱 Electronics</MenuItem>
                                            <MenuItem value="Vehicles">🚗 Vehicles</MenuItem>
                                            <MenuItem value="Equipment">🔧 Equipment</MenuItem>
                                            <MenuItem value="Sports">⚽ Sports</MenuItem>
                                            <MenuItem value="Tools">🛠️ Tools</MenuItem>
                                            <MenuItem value="Other">📦 Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={2.5}>
                                    <TextField
                                        fullWidth
                                        label="Min Price"
                                        name="minPrice"
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={handleFilterChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: '#FFFFFF',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={2.5}>
                                    <TextField
                                        fullWidth
                                        label="Max Price"
                                        name="maxPrice"
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={handleFilterChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: '#FFFFFF',
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grow>
                </Container>
            </Box>

            {/* Items Grid */}
            <Container maxWidth="lg" sx={{ py: 6, minHeight: '60vh', backgroundColor: '#FFFFFF' }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                        <Box textAlign="center">
                            <CircularProgress
                                size={60}
                                thickness={4}
                                sx={{
                                    color: '#0284C7',
                                    mb: 2,
                                }}
                            />
                            <Typography variant="h6" sx={{ color: '#0284C7', fontWeight: 600 }}>
                                Loading amazing items...
                            </Typography>
                        </Box>
                    </Box>
                ) : error ? (
                    <Fade in>
                        <Alert
                            severity="error"
                            sx={{
                                borderRadius: '0.75rem',
                                border: '2px solid #0284C7',
                                backgroundColor: '#E0F2FE',
                                color: '#0284C7',
                                '& .MuiAlert-icon': {
                                    color: '#0284C7',
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    </Fade>
                ) : items.length === 0 ? (
                    <Fade in>
                        <Box textAlign="center" py={8}>
                            <Typography
                                variant="h4"
                                gutterBottom
                                sx={{
                                    color: '#0284C7',
                                    fontWeight: 700,
                                    mb: 2,
                                }}
                            >
                                No items found
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#0284C7' }}>
                                Try adjusting your filters to see more results
                            </Typography>
                        </Box>
                    </Fade>
                ) : (
                    <Grid container spacing={3}>
                        {items.map((item, index) => (
                            <Grid
                                item
                                key={item._id}
                                xs={12}
                                sm={6}
                                md={4}
                                className={`animate-slideUp stagger-${Math.min(index + 1, 5)}`}
                            >
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
