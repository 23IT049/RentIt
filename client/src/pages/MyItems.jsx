import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    CircularProgress,
    Alert,
    Button,
    Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import { itemsAPI } from '../services/api';

const MyItems = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyItems();
    }, []);

    const fetchMyItems = async () => {
        try {
            const response = await itemsAPI.getMyItems();
            setItems(response.data.items);
        } catch (err) {
            setError('Failed to load your items');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await itemsAPI.delete(id);
                setItems(items.filter(item => item._id !== id));
                alert('Item deleted successfully');
            } catch (err) {
                alert('Failed to delete item');
            }
        }
    };

    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold">
                        My Listed Items
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/create-item')}
                    >
                        + Add New Item
                    </Button>
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : items.length === 0 ? (
                    <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            You haven't listed any items yet
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/create-item')}
                            sx={{ mt: 2 }}
                        >
                            List Your First Item
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {items.map((item) => (
                            <Grid item key={item._id} xs={12} sm={6} md={4}>
                                <ItemCard item={item} />
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate(`/items/${item._id}`)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        onClick={() => handleDelete(item._id)}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </>
    );
};

export default MyItems;
