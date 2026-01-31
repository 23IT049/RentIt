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
    useMediaQuery,
    Badge,
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    ShoppingCart,
    Search,
    Favorite,
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
        <Box sx={{ width: 280, backgroundColor: '#FFFFFF', height: '100%' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0' }}>
                <Typography
                    variant="h6"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    <Store sx={{ color: '#0EA5E9' }} />
                    RentHub
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
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
                            color: '#64748B',
                            mx: 1,
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: '#F0F9FF',
                                color: '#0EA5E9',
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{ fontWeight: 600 }}
                        />
                    </ListItem>
                ))}
                <ListItem
                    button
                    onClick={() => {
                        onCartClick();
                        setMobileDrawerOpen(false);
                    }}
                    sx={{
                        color: '#64748B',
                        mx: 1,
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: '#F0F9FF',
                            color: '#0EA5E9',
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <Badge badgeContent={cart.length} color="error">
                            <ShoppingCart />
                        </Badge>
                    </ListItemIcon>
                    <ListItemText
                        primary="Shopping Cart"
                        primaryTypographyProps={{ fontWeight: 600 }}
                    />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid #E2E8F0',
                    color: '#0F172A',
                }}
            >
                <Toolbar sx={{ py: 1 }}>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={() => setMobileDrawerOpen(true)}
                            sx={{
                                mr: 2,
                                color: '#64748B',
                                '&:hover': {
                                    backgroundColor: '#F1F5F9',
                                    color: '#0EA5E9',
                                }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Store sx={{ mr: 1, color: '#0EA5E9', fontSize: '1.75rem' }} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            RentHub
                        </Typography>
                        {isDashboardPage && (
                            <Typography
                                variant="caption"
                                sx={{
                                    ml: 2,
                                    color: '#64748B',
                                    fontWeight: 600,
                                    px: 2,
                                    py: 0.5,
                                    backgroundColor: '#F0F9FF',
                                    borderRadius: '9999px',
                                }}
                            >
                                Dashboard
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
                                    color: '#64748B',
                                    fontWeight: 600,
                                    px: 2,
                                    borderRadius: '0.5rem',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#F1F5F9',
                                        color: '#0EA5E9',
                                        transform: 'translateY(-2px)',
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
                                    color: '#64748B',
                                    fontWeight: 600,
                                    px: 2,
                                    borderRadius: '0.5rem',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#F1F5F9',
                                        color: '#0EA5E9',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                Browse
                            </Button>
                            <Button
                                color="inherit"
                                startIcon={<Favorite />}
                                onClick={() => handleDashboardTab(2)}
                                sx={{
                                    color: '#64748B',
                                    fontWeight: 600,
                                    px: 2,
                                    borderRadius: '0.5rem',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#F1F5F9',
                                        color: '#0EA5E9',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                Wishlist
                            </Button>
                            <IconButton
                                color="inherit"
                                onClick={onCartClick}
                                sx={{
                                    color: '#64748B',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#F1F5F9',
                                        color: '#0EA5E9',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                <Badge
                                    badgeContent={cart.length}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: '#EF4444',
                                            color: 'white',
                                            fontWeight: 700,
                                        }
                                    }}
                                >
                                    <ShoppingCart />
                                </Badge>
                            </IconButton>
                        </Box>
                    )}

                    <Box sx={{ ml: 2 }}>
                        <IconButton
                            color="inherit"
                            onClick={handleMenuOpen}
                            sx={{
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                }
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)',
                                }}
                            >
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    minWidth: '220px',
                                    mt: 1,
                                }
                            }}
                        >
                            <MenuItem sx={{ '&:hover': { backgroundColor: '#F8FAFC' }, pointerEvents: 'none' }}>
                                <ListItemIcon>
                                    <AccountCircle sx={{ color: '#0EA5E9' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={user?.name || 'User'}
                                    secondary={user?.email}
                                    primaryTypographyProps={{
                                        fontWeight: 600,
                                        color: '#0F172A'
                                    }}
                                    secondaryTypographyProps={{
                                        fontSize: '0.75rem',
                                        color: '#64748B'
                                    }}
                                />
                            </MenuItem>
                            <Divider sx={{ my: 1 }} />
                            <MenuItem
                                onClick={() => {
                                    handleMenuClose();
                                    handleDashboardTab(3);
                                }}
                                sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}
                            >
                                <ListItemIcon>
                                    <Person sx={{ color: '#0EA5E9' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Profile"
                                    primaryTypographyProps={{ fontWeight: 600 }}
                                />
                            </MenuItem>
                            <MenuItem
                                onClick={handleLogout}
                                sx={{
                                    color: '#EF4444',
                                    '&:hover': {
                                        backgroundColor: '#FEE2E2',
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <ExitToApp sx={{ color: '#EF4444' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Logout"
                                    primaryTypographyProps={{ fontWeight: 600 }}
                                />
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
                        backgroundColor: '#FFFFFF',
                    }
                }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default CustomerNavbar;
