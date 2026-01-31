import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Store,
    ShoppingCart,
    Assessment,
    Add,
    AccountCircle,
    ExitToApp,
    People
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const VendorNavbar = () => {
    const navigate = useNavigate();
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

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/vendor-dashboard' },
        { text: 'Products', icon: <Store />, path: '/vendor-dashboard?tab=products' },
        { text: 'Orders', icon: <ShoppingCart />, path: '/vendor-dashboard?tab=orders' },
        { text: 'Customers', icon: <People />, path: '/vendor-customers' },
        { text: 'Analytics', icon: <Assessment />, path: '/vendor-dashboard?tab=analytics' },
        { text: 'Create Item', icon: <Add />, path: '/create-item' },
    ];

    const drawerContent = (
        <Box sx={{ width: 280, backgroundColor: '#FFFFFF', height: '100%' }}>
            <Box sx={{ p: 3, borderBottom: '2px solid #0284C7' }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 800,
                        color: '#0284C7',
                    }}
                >
                    🏪 Vendor Portal
                </Typography>
                <Typography variant="caption" sx={{ color: '#0284C7' }}>
                    {user?.email}
                </Typography>
            </Box>
            <List sx={{ pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            setMobileDrawerOpen(false);
                        }}
                        sx={{
                            color: '#0284C7',
                            mx: 1,
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: '#E0F2FE',
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: '#0284C7', minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{ fontWeight: 600 }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: '#FFFFFF',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '2px solid #0284C7',
                    color: '#0284C7',
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
                                color: '#0284C7',
                                '&:hover': {
                                    backgroundColor: '#E0F2FE',
                                }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 800,
                            color: '#0284C7',
                        }}
                    >
                        🏪 Vendor Dashboard
                    </Typography>

                    {!isMobile && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.text}
                                    color="inherit"
                                    startIcon={item.icon}
                                    onClick={() => navigate(item.path)}
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
                                    {item.text}
                                </Button>
                            ))}
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
                                    backgroundColor: '#0284C7',
                                    color: '#FFFFFF',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)',
                                }}
                            >
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    backgroundColor: '#FFFFFF',
                                    border: '2px solid #0284C7',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 10px 15px -3px rgba(2, 132, 199, 0.2)',
                                    minWidth: '200px',
                                    mt: 1,
                                }
                            }}
                        >
                            <MenuItem
                                sx={{
                                    '&:hover': { backgroundColor: '#E0F2FE' },
                                    pointerEvents: 'none',
                                }}
                            >
                                <ListItemIcon>
                                    <AccountCircle sx={{ color: '#0284C7' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={user?.name}
                                    primaryTypographyProps={{
                                        fontWeight: 600,
                                        color: '#0284C7'
                                    }}
                                />
                            </MenuItem>
                            <Divider sx={{ my: 1, borderColor: '#BAE6FD' }} />
                            <MenuItem
                                onClick={handleLogout}
                                sx={{
                                    color: '#0284C7',
                                    '&:hover': {
                                        backgroundColor: '#E0F2FE',
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <ExitToApp sx={{ color: '#0284C7' }} />
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

export default VendorNavbar;
