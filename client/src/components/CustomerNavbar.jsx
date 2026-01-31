import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    ShoppingCart,
    Search,
    Favorite,
    History,
    Assessment,
    Person,
    AccountCircle,
    ExitToApp,
    Store
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const CustomerNavbar = ({ cart = [], onCartClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleMenuClose();
    };

    // Check if we're on the dashboard page
    const isDashboardPage = location.pathname === '/dashboard';

    // Handle dashboard tab navigation
    const handleDashboardTab = (tabIndex) => {
        if (isDashboardPage) {
            // If already on dashboard, emit custom event to change tab
            window.dispatchEvent(new CustomEvent('changeDashboardTab', { detail: tabIndex }));
        } else {
            // Navigate to dashboard with tab parameter
            navigate('/dashboard', { state: { initialTab: tabIndex } });
        }
        setMobileDrawerOpen(false);
    };

    const menuItems = [
        { 
            text: 'My Bookings', 
            icon: <ShoppingCart />, 
            action: () => handleDashboardTab(0)
        },
        { 
            text: 'Browse Items', 
            icon: <Search />, 
            action: () => handleDashboardTab(1)
        },
        { 
            text: 'Wishlist', 
            icon: <Favorite />, 
            action: () => handleDashboardTab(2)
        },
        { 
            text: 'Profile', 
            icon: <Person />, 
            action: () => handleDashboardTab(3)
        },
    ];

    const drawerContent = (
        <Box sx={{ width: 280, backgroundColor: '#2a2a2a', height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #444' }}>
                <Typography variant="h6" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Store sx={{ color: '#9333ea' }} />
                    RentHub Customer
                </Typography>
                <Typography variant="caption" sx={{ color: '#ccc' }}>
                    {user?.email}
                </Typography>
            </Box>
            <List sx={{ pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={item.action}
                        sx={{ 
                            color: '#ccc', 
                            '&:hover': { 
                                backgroundColor: '#333',
                                color: 'white'
                            },
                            '&.active': {
                                backgroundColor: '#9333ea',
                                color: 'white'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: '#9333ea' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <ListItem
                    button
                    onClick={onCartClick}
                    sx={{ 
                        color: '#ccc', 
                        '&:hover': { 
                            backgroundColor: '#333',
                            color: 'white'
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: '#9333ea' }}>
                        <ShoppingCart />
                    </ListItemIcon>
                    <ListItemText primary={`Shopping Cart (${cart.length})`} />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: '#1a1a1a', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={() => setMobileDrawerOpen(true)}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Store sx={{ mr: 1, color: '#9333ea', fontSize: '1.5rem' }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
                            RentHub
                        </Typography>
                        {isDashboardPage && (
                            <Typography variant="caption" sx={{ ml: 2, color: '#ccc' }}>
                                Customer Dashboard
                            </Typography>
                        )}
                    </Box>

                    {!isMobile && (
                        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                            <Button
                                color="inherit"
                                startIcon={<ShoppingCart />}
                                onClick={() => handleDashboardTab(0)}
                                sx={{ 
                                    color: '#ccc', 
                                    '&:hover': { 
                                        color: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    } 
                                }}
                            >
                                My Bookings
                            </Button>
                            <Button
                                color="inherit"
                                startIcon={<Search />}
                                onClick={() => handleDashboardTab(1)}
                                sx={{ 
                                    color: '#ccc', 
                                    '&:hover': { 
                                        color: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    } 
                                }}
                            >
                                Browse Items
                            </Button>
                            <Button
                                color="inherit"
                                startIcon={<Favorite />}
                                onClick={() => handleDashboardTab(2)}
                                sx={{ 
                                    color: '#ccc', 
                                    '&:hover': { 
                                        color: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    } 
                                }}
                            >
                                Wishlist
                            </Button>
                            <Button
                                color="inherit"
                                startIcon={<Person />}
                                onClick={() => handleDashboardTab(3)}
                                sx={{ 
                                    color: '#ccc', 
                                    '&:hover': { 
                                        color: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    } 
                                }}
                            >
                                Profile
                            </Button>
                            <IconButton
                                color="inherit"
                                onClick={onCartClick}
                                sx={{ 
                                    color: '#ccc', 
                                    '&:hover': { 
                                        color: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    } 
                                }}
                            >
                                <ShoppingCart />
                                {cart.length > 0 && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: 16,
                                            height: 16,
                                            fontSize: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {cart.length}
                                    </Box>
                                )}
                            </IconButton>
                        </Box>
                    )}

                    <Box sx={{ ml: 2 }}>
                        <IconButton
                            color="inherit"
                            onClick={handleMenuOpen}
                            sx={{ 
                                color: '#ccc',
                                '&:hover': { 
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#9333ea' }}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: { 
                                    backgroundColor: '#2a2a2a', 
                                    color: 'white',
                                    minWidth: '200px'
                                }
                            }}
                        >
                            <MenuItem sx={{ '&:hover': { backgroundColor: '#333' } }}>
                                <ListItemIcon>
                                    <AccountCircle sx={{ color: '#9333ea' }} />
                                </ListItemIcon>
                                <ListItemText primary={user?.name || 'User'} secondary={user?.email} />
                            </MenuItem>
                            <MenuItem 
                                onClick={() => {
                                    handleMenuClose();
                                    handleDashboardTab(5);
                                }}
                                sx={{ '&:hover': { backgroundColor: '#333' } }}
                            >
                                <ListItemIcon>
                                    <Person sx={{ color: '#9333ea' }} />
                                </ListItemIcon>
                                <ListItemText primary="Profile" />
                            </MenuItem>
                            <MenuItem 
                                onClick={handleLogout}
                                sx={{ '&:hover': { backgroundColor: '#333' } }}
                            >
                                <ListItemIcon>
                                    <ExitToApp sx={{ color: '#f44336' }} />
                                </ListItemIcon>
                                <ListItemText primary="Logout" />
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={mobileDrawerOpen}
                onClose={() => setMobileDrawerOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: '#2a2a2a',
                    }
                }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default CustomerNavbar;
