# 🌿 Plants Mall - E-Commerce ERP Dashboard

A modern full-stack e-commerce platform for a garden nursery with ERP dashboard capabilities.

## 📚 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Zustand** - State management
- **Axios** - API client
- **React Icons** - Icon library
- **React Hook Form** - Form handling

### Backend
- **Express.js** - REST API server
- **TypeScript** - Type safety
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Multer** - File uploads
- **Helmet** - Security headers
- **CORS** - Cross-origin requests

### Database
- **MongoDB Atlas** - Cloud database

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Git

### Installation

#### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder (already configured, update if needed):
```env
MONGODB_URI=mongodb+srv://plants-mall:Plants2003@plants-mall.otyfvij.mongodb.net/plants-mall
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Start Backend:**
```bash
npm run dev
```
Backend will run on: `http://localhost:5000`

#### 2. Frontend Setup
```bash
cd frontend
npm install
```

`.env.local` is already created with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start Frontend:**
```bash
npm run dev
```
Frontend will run on: `http://localhost:3000`

## 📁 Project Structure

```
plants-mall/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express server setup
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB connection
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── Product.ts
│   │   │   ├── User.ts
│   │   │   └── Order.ts
│   │   ├── controllers/           # Request handlers
│   │   │   ├── authController.ts
│   │   │   └── productController.ts
│   │   ├── routes/                # API routes
│   │   │   ├── auth.ts
│   │   │   └── products.ts
│   │   ├── middleware/            # Custom middleware
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   └── utils/                 # Utilities
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── globals.css        # Global styles
│   │   │   ├── products/
│   │   │   │   └── page.tsx       # Products listing
│   │   │   ├── about/
│   │   │   │   └── page.tsx       # About page
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       │   └── page.tsx
│   │   │       └── register/
│   │   │           └── page.tsx
│   │   ├── components/            # React components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── RightDrawer.tsx    # Side drawer component
│   │   │   ├── CartDrawer.tsx     # Cart drawer
│   │   │   └── ProductDetailDrawer.tsx
│   │   └── lib/
│   │       ├── api.ts             # API client
│   │       └── store.ts           # Zustand stores
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── .env.local
│
└── .env                           # Root env file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with pagination, filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin/staff only)
- `PUT /api/products/:id` - Update product (admin/staff only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Health Check
- `GET /api/health` - Server health check

## 🎨 Features Implemented

### Public Store
✅ Beautiful homepage with featured products
✅ Products listing with filters & search
✅ Product details in right-side drawer
✅ Shopping cart with quantity management
✅ User authentication (login/register)
✅ Responsive design (mobile-friendly)
✅ Modern UI with Tailwind CSS
✅ Category filtering
✅ Pagination

### UI Components
✅ Navbar with search and cart icon
✅ Footer with links
✅ Product cards with discount badges
✅ Right-side drawer system (for product details & cart)
✅ Auth forms with validation
✅ Loading states

## 🔐 Security Features

✅ JWT authentication with refresh tokens
✅ Password hashing with bcryptjs
✅ Role-based access control (admin, staff, customer)
✅ Protected API routes
✅ CORS configuration
✅ Helmet.js security headers
✅ Input validation
✅ Error handling

## 📦 Database Collections

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'staff' | 'customer',
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Products
```javascript
{
  name: String,
  description: String,
  price: Number,
  discount: Number (0-100),
  image: String (URL),
  category: String,
  stock: Number,
  sku: String (unique),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders
```javascript
{
  orderNumber: String (unique),
  customerId: String,
  products: [{productId, quantity, price}],
  totalAmount: Number,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  paymentStatus: 'pending' | 'paid' | 'failed',
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Test API with Postman/cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Products:**
```bash
curl http://localhost:5000/api/products?page=1&limit=10
```

## 🔄 Next Steps

1. **Admin Dashboard** - Create dashboard for product management
2. **Order Management** - Implement order tracking
3. **Payment Integration** - Add payment gateway (Stripe, Razorpay)
4. **Wishlist Feature** - Add wishlist functionality
5. **Reviews & Ratings** - Customer reviews system
6. **Email Notifications** - Send order confirmations
7. **Analytics** - Sales dashboard
8. **Deployment** - Deploy to Vercel (frontend) & Railway (backend)

## 📝 Environment Variables

**Backend (.env):**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Frontend URL for CORS

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Connect your repo to Vercel
# It will auto-deploy on git push
```

### Backend (Railway/Render)
```bash
# Connect repo to Railway/Render
# Configure environment variables in dashboard
# Deploy with git push
```

## 📞 Support

For issues or questions, please open an issue in the repository.

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Happy Gardening! 🌿
