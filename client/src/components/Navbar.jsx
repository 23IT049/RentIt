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
        <AppBar position="sticky">
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit',
                            fontWeight: 'bold'
                        }}
                    >
                        🏠 RentHub
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/"
                            startIcon={<HomeIcon />}
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
                                >
                                    List Item
                                </Button>
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/my-items"
                                    startIcon={<InventoryIcon />}
                                >
                                    My Items
                                </Button>
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/my-bookings"
                                    startIcon={<BookmarksIcon />}
                                >
                                    Bookings
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={handleLogout}
                                    sx={{ ml: 1 }}
                                >
                                    Logout ({user?.name})
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={Link} to="/login">
                                    Login
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    component={Link}
                                    to="/register"
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
