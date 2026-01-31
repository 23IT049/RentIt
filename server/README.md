# 🏠 Rental Management System - Backend

24-hour rental management system built with MERN stack.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account (for images)
- Stripe account (for payments)

### Installation

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your credentials

# Run development server
npm run dev
```

## 📝 Environment Variables

```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Items
- `GET /api/items` - Get all items (with search/filters)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create item (Protected)
- `PUT /api/items/:id` - Update item (Protected)
- `DELETE /api/items/:id` - Delete item (Protected)
- `GET /api/items/owner/me` - Get user's items (Protected)

### Bookings
- `POST /api/bookings` - Create booking (Protected)
- `GET /api/bookings` - Get user's bookings (Protected)
- `GET /api/bookings/:id` - Get single booking (Protected)
- `PUT /api/bookings/:id/confirm` - Confirm booking (Protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (Protected)
- `PUT /api/bookings/:id/complete` - Complete booking (Protected)

## 🗂️ Project Structure

```
server/
├── models/          # Mongoose models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── .env            # Environment variables
└── server.js       # Entry point
```

## 🧪 Testing with Postman

1. Register a user: `POST /api/auth/register`
2. Login: `POST /api/auth/login` (save the token)
3. Add token to headers: `Authorization: Bearer <token>`
4. Create an item: `POST /api/items`
5. Create a booking: `POST /api/bookings`

## 📦 Dependencies

- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - CORS middleware
- dotenv - Environment variables
- multer - File upload
- cloudinary - Image hosting
- stripe - Payment processing
