import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useState } from 'react';

const ItemCard = ({ item }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const getStockStatus = () => {
        if (!item.quantity || item.quantity === 0) {
            return { label: 'Out of Stock', color: '#0284C7', bgColor: '#E0F2FE' };
        } else if (item.quantity <= 5) {
            return { label: 'Low Stock', color: '#0284C7', bgColor: '#BAE6FD' };
        }
        return { label: 'In Stock', color: '#FFFFFF', bgColor: '#0284C7' };
    };

    const stockStatus = getStockStatus();

    return (
        <Card
            className="animate-fadeIn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                border: '2px solid #BAE6FD',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: isHovered
                    ? '0 20px 25px -5px rgba(2, 132, 199, 0.3)'
                    : '0 1px 3px 0 rgba(2, 132, 199, 0.1)',
                '&:hover': {
                    borderColor: '#0284C7',
                }
            }}
        >
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={item.title}
                    sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: stockStatus.bgColor,
                        color: stockStatus.color,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
                        animation: 'fadeIn 0.5s ease',
                    }}
                >
                    {stockStatus.label}
                </Box>
                {isHovered && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(180deg, rgba(2, 132, 199, 0) 0%, rgba(2, 132, 199, 0.3) 100%)',
                            animation: 'fadeIn 0.3s ease',
                        }}
                    />
                )}
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    noWrap
                    sx={{
                        fontWeight: 700,
                        color: '#0284C7',
                        mb: 1,
                    }}
                >
                    {item.title}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                        color: '#0284C7',
                    }}
                >
                    {item.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                    <LocationOnIcon fontSize="small" sx={{ color: '#0284C7' }} />
                    <Typography variant="body2" sx={{ color: '#0284C7', fontWeight: 500 }}>
                        {item.location}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                        label={item.category}
                        size="small"
                        sx={{
                            backgroundColor: '#E0F2FE',
                            color: '#0284C7',
                            fontWeight: 700,
                            border: '2px solid #0284C7',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: '#BAE6FD',
                            }
                        }}
                    />
                    <Chip
                        label={item.condition}
                        size="small"
                        sx={{
                            backgroundColor: '#FFFFFF',
                            color: '#0284C7',
                            fontWeight: 700,
                            border: '2px solid #BAE6FD',
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 0.5,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            color: '#0284C7',
                        }}
                    >
                        ₹{item.price}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0284C7', fontWeight: 500 }}>
                        /24hrs
                    </Typography>
                </Box>
            </CardContent>
            <CardActions sx={{ p: 2.5, pt: 0 }}>
                <Button
                    size="large"
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/items/${item._id}`)}
                    sx={{
                        backgroundColor: '#0284C7',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        py: 1.25,
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: '#0369A1',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.5)',
                        }
                    }}
                >
                    View Details
                </Button>
            </CardActions>
        </Card>
    );
};

export default ItemCard;
