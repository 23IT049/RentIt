import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography, Button } from '@mui/material';

const RoleProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        const getRedirectPath = () => {
            switch (user?.role) {
                case 'customer':
                    return '/dashboard';
                case 'vendor':
                    return '/vendor-dashboard';
                case 'admin':
                    return '/admin-dashboard';
                default:
                    return '/';
            }
        };

        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
                    Access Denied
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, color: '#ccc' }}>
                    You don't have permission to access this page.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, color: '#888' }}>
                    Required role: {requiredRole} | Your role: {user?.role || 'Unknown'}
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={() => window.location.href = getRedirectPath()}
                    sx={{ backgroundColor: '#9333ea' }}
                >
                    Go to Your Dashboard
                </Button>
            </Box>
        );
    }

    return children;
};

export default RoleProtectedRoute;
