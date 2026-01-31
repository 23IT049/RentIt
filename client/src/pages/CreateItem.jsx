import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material';
import VendorNavbar from '../components/VendorNavbar';
import { itemsAPI } from '../services/api';

const CreateItem = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Other',
        price: '',
        deposit: '',
        location: '',
        condition: 'Good',
        image: 'https://via.placeholder.com/400x300',
        features: '',
        terms: 'Standard rental terms apply'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submitData = {
                ...formData,
                price: Number(formData.price),
                deposit: Number(formData.deposit) || 0,
                features: formData.features ? formData.features.split(',').map(f => f.trim()) : []
            };

            await itemsAPI.create(submitData);
            alert('Item created successfully!');
            navigate('/vendor-dashboard?tab=products');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <VendorNavbar />
            <Container maxWidth="md" sx={{ py: 4, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
                <Paper elevation={3} sx={{ p: 4, backgroundColor: '#FFFFFF', color: '#0284C7' }}>
                    <Typography variant="h4" gutterBottom sx={{ color: '#0284C7' }}>
                        Create Rental Item
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, color: '#0284C7' }}>
                        Fill in the details to list your item for rent
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Item Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ style: { color: '#0284C7' } }}
                                    InputProps={{ style: { color: '#0284C7' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#BAE6FD',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#0284C7',
                                            },
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
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    required
                                    InputLabelProps={{ style: { color: '#0284C7' } }}
                                    InputProps={{ style: { color: '#0284C7' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#BAE6FD',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel sx={{ color: '#0284C7' }}>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        label="Category"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#BAE6FD',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#0284C7',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#0284C7',
                                                },
                                            },
                                            '& .MuiSelect-select': {
                                                color: '#0284C7'
                                            }
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

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel sx={{ color: '#0284C7' }}>Condition</InputLabel>
                                    <Select
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleChange}
                                        label="Condition"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#BAE6FD',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#0284C7',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#0284C7',
                                                },
                                            },
                                            '& .MuiSelect-select': {
                                                color: '#0284C7'
                                            }
                                        }}
                                    >
                                        <MenuItem value="New">New</MenuItem>
                                        <MenuItem value="Like New">Like New</MenuItem>
                                        <MenuItem value="Good">Good</MenuItem>
                                        <MenuItem value="Fair">Fair</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Price per 24 hours (₹)"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ style: { color: '#0284C7' } }}
                                    InputProps={{ style: { color: '#0284C7' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#BAE6FD',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Security Deposit (₹)"
                                    name="deposit"
                                    type="number"
                                    value={formData.deposit}
                                    onChange={handleChange}
                                    InputLabelProps={{ style: { color: '#0284C7' } }}
                                    InputProps={{ style: { color: '#0284C7' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#BAE6FD',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ style: { color: '#0284C7' } }}
                                    InputProps={{ style: { color: '#0284C7' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#BAE6FD',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Image URL"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    helperText="Enter image URL or use placeholder"
                                    InputLabelProps={{ style: { color: '#0284C7' } }}
                                    InputProps={{ style: { color: '#0284C7' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#BAE6FD',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                        }
                                    }}
                                    FormHelperTextProps={{ style: { color: '#0284C7' } }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Features (comma separated)"
                                    name="features"
                                    value={formData.features}
                                    onChange={handleChange}
                                    placeholder="e.g. WiFi, Bluetooth, HD Camera"
                                    helperText="Separate features with commas"
                                    InputLabelProps={{ style: { color: '#0284C7' } }}
                                    InputProps={{
                                        style: { color: '#0284C7' },
                                        placeholder: { color: '#BAE6FD' }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#BAE6FD',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                        }
                                    }}
                                    FormHelperTextProps={{ style: { color: '#0284C7' } }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Terms & Conditions"
                                    name="terms"
                                    value={formData.terms}
                                    onChange={handleChange}
                                    multiline
                                    rows={2}
                                    InputLabelProps={{ style: { color: '#0284C7' } }}
                                    InputProps={{ style: { color: '#0284C7' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#BAE6FD',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#0284C7',
                                            },
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                backgroundColor: '#0284C7',
                                '&:hover': {
                                    backgroundColor: '#0369A1'
                                }
                            }}
                        >
                            {loading ? 'Creating...' : 'List Item'}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </>
    );
};

export default CreateItem;
