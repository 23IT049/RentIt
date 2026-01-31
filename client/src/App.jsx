import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VendorRegister from './pages/VendorRegister';
import Checkout from './pages/Checkout';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';
import CreateItem from './pages/CreateItem';
import MyBookings from './pages/MyBookings';
import MyItems from './pages/MyItems';
import VendorCustomers from './pages/VendorCustomers';
import CartPage from './pages/CartPage';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0EA5E9',
            light: '#38BDF8',
            dark: '#0284C7',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#10B981',
            light: '#34D399',
            dark: '#059669',
        },
        background: {
            default: '#FFFFFF',
            paper: '#F8FAFC',
        },
        text: {
            primary: '#0F172A',
            secondary: '#64748B',
        },
        error: {
            main: '#EF4444',
        },
        warning: {
            main: '#F59E0B',
        },
        info: {
            main: '#3B82F6',
        },
        success: {
            main: '#10B981',
        },
    },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 700,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
        '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0.5rem',
                    padding: '0.625rem 1.25rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.3)',
                    },
                },
                contained: {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '0.75rem',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#0EA5E9',
                            },
                        },
                        '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#0EA5E9',
                                borderWidth: '2px',
                            },
                        },
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '0.75rem',
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/vendor-register" element={<VendorRegister />} />
                        <Route path="/redirect" element={<RoleBasedRedirect />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <CustomerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/vendor-dashboard"
                            element={
                                <RoleProtectedRoute requiredRole="vendor">
                                    <VendorDashboard />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin-dashboard"
                            element={
                                <RoleProtectedRoute requiredRole="admin">
                                    <AdminDashboard />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route path="/" element={<Home />} />
                        <Route path="/items/:id" element={<ItemDetail />} />
                        <Route
                            path="/create-item"
                            element={
                                <RoleProtectedRoute requiredRole="vendor">
                                    <CreateItem />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-items"
                            element={
                                <RoleProtectedRoute requiredRole="vendor">
                                    <MyItems />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="/vendor-customers"
                            element={
                                <RoleProtectedRoute requiredRole="vendor">
                                    <VendorCustomers />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-bookings"
                            element={
                                <ProtectedRoute>
                                    <MyBookings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute>
                                    <CartPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
