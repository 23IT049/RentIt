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

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'renter',
        phone: ''
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

        // Prepare registration data
        const registerData = {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            phone: formData.phone,
            firstName: formData.firstName,
            lastName: formData.lastName
        };

        const result = await register(registerData);

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
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, backgroundColor: '#1a1a1a', color: 'white' }}>
                    <Typography variant="h4" align="center" gutterBottom sx={{ color: 'white' }}>
                        Sign-up
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ mb: 3, color: '#cccccc' }}>
                        Create your account to get started
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
                                            '& fieldset': { borderColor: '#444' },
                                            '&:hover fieldset': { borderColor: '#666' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                        },
                                        '& .MuiInputLabel-root': { color: '#888' },
                                        '& .MuiInputBase-input': { color: 'white' }
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
                                            '& fieldset': { borderColor: '#444' },
                                            '&:hover fieldset': { borderColor: '#666' },
                                            '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                        },
                                        '& .MuiInputLabel-root': { color: '#888' },
                                        '& .MuiInputBase-input': { color: 'white' }
                                    }}
                                />
                            </Grid>
                        </Grid>

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
                                    '& fieldset': { borderColor: '#444' },
                                    '&:hover fieldset': { borderColor: '#666' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                },
                                '& .MuiInputLabel-root': { color: '#888' },
                                '& .MuiInputBase-input': { color: 'white' }
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
                                    '& fieldset': { borderColor: '#444' },
                                    '&:hover fieldset': { borderColor: '#666' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                },
                                '& .MuiInputLabel-root': { color: '#888' },
                                '& .MuiInputBase-input': { color: 'white' },
                                '& .MuiFormHelperText-root': { color: '#888' }
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
                                    '& fieldset': { borderColor: '#444' },
                                    '&:hover fieldset': { borderColor: '#666' },
                                    '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                                },
                                '& .MuiInputLabel-root': { color: '#888' },
                                '& .MuiInputBase-input': { color: 'white' }
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
                            {loading ? 'Creating Account...' : 'Register'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Link 
                                to="/vendor-register" 
                                style={{ 
                                    textDecoration: 'none', 
                                    color: '#9333ea',
                                    display: 'block'
                                }}
                            >
                                Become a vendor
                            </Link>
                        </Box>

                        <Typography align="center" variant="body2" sx={{ color: '#cccccc' }}>
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

export default Register;
