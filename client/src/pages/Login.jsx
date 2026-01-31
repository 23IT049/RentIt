import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

        const result = await login(formData.email, formData.password);

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
        <Container maxWidth="sm" sx={{ py: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, backgroundColor: 'white', color: 'black' }}>
                    <Typography variant="h4" align="center" gutterBottom sx={{ color: 'black' }}>
                        Login
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ mb: 3, color: '#666666' }}>
                        Welcome back to RentHub
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Login ID"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            margin="normal"
                            autoFocus
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
                            {loading ? 'Logging in...' : 'Log In'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Link 
                                to="/forgot-password" 
                                style={{ 
                                    textDecoration: 'none', 
                                    color: '#9333ea',
                                    display: 'block',
                                    mb: 1
                                }}
                            >
                                Forgot Password?
                            </Link>
                        </Box>

                        <Typography align="center" variant="body2" sx={{ color: '#666666' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ textDecoration: 'none', color: '#9333ea' }}>
                                Register Here
                            </Link>
                        </Typography>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
