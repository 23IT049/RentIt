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
import CartPage from './pages/CartPage';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
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
