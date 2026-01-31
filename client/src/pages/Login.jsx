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
    Fade,
    InputAdornment,
    IconButton
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #E0F2FE 0%, #FFFFFF 50%, #E0F2FE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
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

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Fade in timeout={800}>
                    <Paper
                        elevation={0}
                        className="animate-scaleIn"
                        sx={{
                            p: 5,
                            backgroundColor: '#FFFFFF',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid #0284C7',
                            borderRadius: '1.5rem',
                            boxShadow: '0 20px 25px -5px rgba(2, 132, 199, 0.2)',
                        }}
                    >
                        {/* Logo/Icon */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    backgroundColor: '#0284C7',
                                    mb: 2,
                                    boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)',
                                    animation: 'bounce 2s ease-in-out infinite',
                                }}
                            >
                                <LockOpenIcon sx={{ fontSize: 40, color: '#FFFFFF' }} />
                            </Box>
                            <Typography
                                variant="h4"
                                align="center"
                                gutterBottom
                                sx={{
                                    fontWeight: 800,
                                    color: '#0284C7',
                                }}
                            >
                                Welcome Back
                            </Typography>
                            <Typography
                                variant="body1"
                                align="center"
                                sx={{
                                    color: '#0284C7',
                                    fontWeight: 500,
                                }}
                            >
                                Sign in to continue to RentHub
                            </Typography>
                        </Box>

                        {error && (
                            <Fade in>
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
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
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: '#0284C7' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#FFFFFF',
                                    }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: '#0284C7' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: '#0284C7' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 1,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#FFFFFF',
                                    }
                                }}
                            />

                            <Box sx={{ textAlign: 'right', mb: 3 }}>
                                <Link
                                    to="/forgot-password"
                                    style={{
                                        textDecoration: 'none',
                                        color: '#0284C7',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    Forgot Password?
                                </Link>
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    mb: 2,
                                    backgroundColor: '#0284C7',
                                    color: '#FFFFFF',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#0369A1',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.5)',
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#BAE6FD',
                                        color: '#FFFFFF',
                                    }
                                }}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>

                            <Box
                                sx={{
                                    textAlign: 'center',
                                    pt: 3,
                                    borderTop: '2px solid #E0F2FE',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#0284C7',
                                        fontWeight: 500,
                                    }}
                                >
                                    Don't have an account?{' '}
                                    <Link
                                        to="/register"
                                        style={{
                                            textDecoration: 'none',
                                            color: '#0284C7',
                                            fontWeight: 700,
                                        }}
                                    >
                                        Register Here
                                    </Link>
                                </Typography>
                            </Box>
                        </form>
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
};

export default Login;
