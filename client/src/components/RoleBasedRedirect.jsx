import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const RoleBasedRedirect = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            // Redirect based on user role
            switch (user.role) {
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
                    navigate('/'); // fallback to home
            }
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                sx={{ backgroundColor: '#1a1a1a' }}
            >
                <CircularProgress sx={{ color: '#9333ea' }} />
            </Box>
        );
    }

    return null;
};

export default RoleBasedRedirect;
