import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import InventoryIcon from '@mui/icons-material/Inventory';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: '#FFFFFF',
                backdropFilter: 'blur(10px)',
                borderBottom: '2px solid #0284C7',
                color: '#0284C7',
                transition: 'all 0.3s ease',
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ py: 1 }}>
                    <Typography
                        variant="h5"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: '#0284C7',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            }
                        }}
                    >
                        🏠 RentHub
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/"
                            startIcon={<HomeIcon />}
                            sx={{
                                color: '#0284C7',
                                fontWeight: 600,
                                px: 2,
                                borderRadius: '0.5rem',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#E0F2FE',
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            Browse
                        </Button>

                        {isAuthenticated ? (
                            <>
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/create-item"
                                    startIcon={<AddIcon />}
                                    sx={{
                                        color: '#0284C7',
                                        fontWeight: 600,
                                        px: 2,
                                        borderRadius: '0.5rem',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: '#E0F2FE',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    List Item
                                </Button>
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/my-items"
                                    startIcon={<InventoryIcon />}
                                    sx={{
                                        color: '#0284C7',
                                        fontWeight: 600,
                                        px: 2,
                                        borderRadius: '0.5rem',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: '#E0F2FE',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    My Items
                                </Button>
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/my-bookings"
                                    startIcon={<BookmarksIcon />}
                                    sx={{
                                        color: '#0284C7',
                                        fontWeight: 600,
                                        px: 2,
                                        borderRadius: '0.5rem',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: '#E0F2FE',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    Bookings
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleLogout}
                                    sx={{
                                        ml: 1,
                                        borderColor: '#0284C7',
                                        color: '#0284C7',
                                        fontWeight: 600,
                                        px: 2.5,
                                        borderRadius: '0.5rem',
                                        borderWidth: '2px',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: '#0284C7',
                                            borderWidth: '2px',
                                            backgroundColor: '#E0F2FE',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    Logout ({user?.name})
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/login"
                                    sx={{
                                        color: '#0284C7',
                                        fontWeight: 600,
                                        px: 2,
                                        borderRadius: '0.5rem',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: '#E0F2FE',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="contained"
                                    component={Link}
                                    to="/register"
                                    sx={{
                                        backgroundColor: '#0284C7',
                                        color: '#FFFFFF',
                                        fontWeight: 600,
                                        px: 2.5,
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: '#0369A1',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)',
                                        }
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
