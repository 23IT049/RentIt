import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const VendorRegister = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        productCategory: '',
        gstNo: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Prepare vendor data
        const vendorData = {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            password: formData.password,
            role: 'vendor',
            phone: '',
            firstName: formData.firstName,
            lastName: formData.lastName,
            companyName: formData.companyName,
            productCategory: formData.productCategory,
            gstNo: formData.gstNo
        };

        const result = await register(vendorData);

        if (result.success) {
            // Redirect based on user role
            switch (result.user.role) {
                case 'customer':
                    navigate('/dashboard');
                    break;
                case 'vendor':
                    navigate('/vendor-dashboard');
                    break;
                case 'admin':
                    navigate('/admin-dashboard');
                    break;
                default:
                    navigate('/');
            }
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, backgroundColor: 'white', color: 'black' }}>
                    <Typography variant="h4" align="center" gutterBottom sx={{ color: 'black' }}>
                        Vendor Sign-up
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ mb: 3, color: '#666666' }}>
                        Register your business to start listing items
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#ddd' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                        },
                                        '& .MuiInputLabel-root': { color: '#666' },
                                        '& .MuiInputBase-input': { color: 'black' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#ddd' },
                                            '&:hover fieldset': { borderColor: '#9333ea' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                        },
                                        '& .MuiInputLabel-root': { color: '#666' },
                                        '& .MuiInputBase-input': { color: 'black' }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            fullWidth
                            label="Company Name"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            required
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#ddd' },
                                    '&:hover fieldset': { borderColor: '#9333ea' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                },
                                '& .MuiInputLabel-root': { color: '#666' },
                                '& .MuiInputBase-input': { color: 'black' }
                            }}
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ color: '#666' }}>Product Category</InputLabel>
                            <Select
                                name="productCategory"
                                value={formData.productCategory}
                                onChange={handleChange}
                                label="Product Category"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#ddd' },
                                        '&:hover fieldset': { borderColor: '#9333ea' },
                                        '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                    },
                                    '& .MuiInputLabel-root': { color: '#666' },
                                    '& .MuiInputBase-input': { color: 'black' }
                                }}
                            >
                                <MenuItem value="electronics">Electronics</MenuItem>
                                <MenuItem value="furniture">Furniture</MenuItem>
                                <MenuItem value="vehicles">Vehicles</MenuItem>
                                <MenuItem value="tools">Tools & Equipment</MenuItem>
                                <MenuItem value="clothing">Clothing</MenuItem>
                                <MenuItem value="books">Books</MenuItem>
                                <MenuItem value="sports">Sports & Recreation</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="GST no"
                            name="gstNo"
                            value={formData.gstNo}
                            onChange={handleChange}
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#ddd' },
                                    '&:hover fieldset': { borderColor: '#9333ea' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                },
                                '& .MuiInputLabel-root': { color: '#666' },
                                '& .MuiInputBase-input': { color: 'black' }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Email ID"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#ddd' },
                                    '&:hover fieldset': { borderColor: '#9333ea' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                },
                                '& .MuiInputLabel-root': { color: '#666' },
                                '& .MuiInputBase-input': { color: 'black' }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            margin="normal"
                            helperText="Minimum 6 characters"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#ddd' },
                                    '&:hover fieldset': { borderColor: '#9333ea' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                },
                                '& .MuiInputLabel-root': { color: '#666' },
                                '& .MuiInputBase-input': { color: 'black' },
                                '& .MuiFormHelperText-root': { color: '#666' }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#ddd' },
                                    '&:hover fieldset': { borderColor: '#9333ea' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                },
                                '& .MuiInputLabel-root': { color: '#666' },
                                '& .MuiInputBase-input': { color: 'black' }
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ 
                                mt: 3, 
                                mb: 2,
                                backgroundColor: '#9333ea',
                                '&:hover': {
                                    backgroundColor: '#7c3aed'
                                }
                            }}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </Button>

                        <Typography align="center" variant="body2" sx={{ color: '#666666' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ textDecoration: 'none', color: '#9333ea' }}>
                                Login here
                            </Link>
                        </Typography>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default VendorRegister;
