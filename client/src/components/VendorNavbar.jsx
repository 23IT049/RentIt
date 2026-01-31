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
    useMediaQuery
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
        <Box sx={{ width: 250, backgroundColor: '#2a2a2a', height: '100%' }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                    Vendor Portal
                </Typography>
            </Box>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            setMobileDrawerOpen(false);
                        }}
                        sx={{ color: '#ccc', '&:hover': { backgroundColor: '#333' } }}
                    >
                        <ListItemIcon sx={{ color: '#9333ea' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
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

                    <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
                        Vendor Dashboard
                    </Typography>

                    {!isMobile && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.text}
                                    color="inherit"
                                    startIcon={item.icon}
                                    onClick={() => navigate(item.path)}
                                    sx={{ color: '#ccc', '&:hover': { color: 'white' } }}
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
                            sx={{ color: '#ccc' }}
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#9333ea' }}>
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: { backgroundColor: '#2a2a2a', color: 'white' }
                            }}
                        >
                            <MenuItem onClick={handleMenuClose}>
                                <ListItemIcon>
                                    <AccountCircle sx={{ color: '#9333ea' }} />
                                </ListItemIcon>
                                <ListItemText primary={user?.name} />
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
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

export default VendorNavbar;
