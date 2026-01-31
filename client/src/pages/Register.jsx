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
    Grid,
    Fade,
    InputAdornment,
    IconButton
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #FFFFFF 100%)',
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
                    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0) 70%)',
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
                    background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0) 70%)',
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
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid #E2E8F0',
                            borderRadius: '1.5rem',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
                                    background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
                                    mb: 2,
                                    boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.4)',
                                    animation: 'bounce 2s ease-in-out infinite',
                                }}
                            >
                                <PersonAddIcon sx={{ fontSize: 40, color: 'white' }} />
                            </Box>
                            <Typography
                                variant="h4"
                                align="center"
                                gutterBottom
                                sx={{
                                    fontWeight: 800,
                                    color: '#0F172A',
                                }}
                            >
                                Create Account
                            </Typography>
                            <Typography
                                variant="body1"
                                align="center"
                                sx={{
                                    color: '#64748B',
                                    fontWeight: 500,
                                }}
                            >
                                Join RentHub and start renting today
                            </Typography>
                        </Box>

                        {error && (
                            <Fade in>
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: '0.75rem',
                                        border: '1px solid #FEE2E2',
                                    }}
                                >
                                    {error}
                                </Alert>
                            </Fade>
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
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon sx={{ color: '#0EA5E9' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: '#FFFFFF',
                                            }
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
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon sx={{ color: '#0EA5E9' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: '#FFFFFF',
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>

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
                                            <EmailIcon sx={{ color: '#0EA5E9' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mt: 2,
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
                                helperText="Minimum 6 characters"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: '#0EA5E9' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
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
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: '#0EA5E9' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#FFFFFF',
                                    }
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    mb: 2,
                                    background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.5)',
                                    },
                                    '&:disabled': {
                                        background: '#E2E8F0',
                                        color: '#94A3B8',
                                    }
                                }}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>

                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Link
                                    to="/vendor-register"
                                    style={{
                                        textDecoration: 'none',
                                        color: '#0EA5E9',
                                        fontWeight: 600,
                                    }}
                                >
                                    Want to become a vendor? Register here
                                </Link>
                            </Box>

                            <Box
                                sx={{
                                    textAlign: 'center',
                                    pt: 3,
                                    borderTop: '1px solid #E2E8F0',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#64748B',
                                        fontWeight: 500,
                                    }}
                                >
                                    Already have an account?{' '}
                                    <Link
                                        to="/login"
                                        style={{
                                            textDecoration: 'none',
                                            color: '#0EA5E9',
                                            fontWeight: 700,
                                        }}
                                    >
                                        Sign In
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

export default Register;
