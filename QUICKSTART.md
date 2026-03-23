# 🚀 Quick Start Guide

## Installation & Setup (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 3: Start Backend
```bash
cd backend
npm run dev
```
✅ Backend running on: `http://localhost:5000`

### Step 4: Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```
✅ Frontend running on: `http://localhost:3000`

## 🌐 Open in Browser
Visit: http://localhost:3000

## 📝 First Steps

### 1. Create Test Products (via API)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 2. Register a User
- Go to http://localhost:3000/auth/register
- Fill in the form
- You'll be logged in automatically

### 3. Browse Products
- Go to http://localhost:3000/products
- See featured products on home page
- Click "View" to open product details in side drawer

### 4. Add to Cart
- Click "View" on any product
- Click "Add to Cart" in the drawer
- Cart badge updates automatically
- Click cart icon to open cart drawer

## 🛠️ Useful Commands

### Backend
```bash
npm run dev      # Start dev server with hot reload
npm run build    # Compile TypeScript
npm run start    # Run compiled code
```

### Frontend
```bash
npm run dev      # Start Next.js dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📦 Add Sample Products

Use Postman or your favorite API client:

```bash
POST http://localhost:5000/api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Monstera Deliciosa",
  "description": "Beautiful climbing plant with large leaves",
  "price": 1500,
  "discount": 10,
  "category": "Indoor",
  "stock": 25,
  "sku": "MONSTERA-001"
}
```

## 🔑 Admin Credentials (Create First)

1. Register as customer first
2. Update role in MongoDB to "admin" (or use admin registration if implemented)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error
- Check MONGODB_URI in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure MongoDB Atlas cluster is running

### API Not Connecting
- Check backend is running on port 5000
- Verify NEXT_PUBLIC_API_URL in frontend `.env.local`
- Check browser console for CORS errors

## 📚 File Structure Quick Reference

```
backend/
  └── src/
      ├── app.ts                 # Main Express app
      ├── models/                # Database schemas
      ├── controllers/           # Business logic
      ├── routes/                # API endpoints
      └── middleware/            # Auth, error handling

frontend/
  └── src/
      ├── app/                   # Pages (home, products, auth)
      ├── components/            # Reusable components
      └── lib/                   # API client & state management
```

## 🎯 What's Working Now

✅ Beautiful responsive UI
✅ Product listing & filtering
✅ User authentication (register/login)
✅ Shopping cart with drawer
✅ Product details in side panel
✅ Search functionality
✅ Category filtering
✅ Pagination

## 🔄 Next: Admin Dashboard

Ready to build the admin dashboard for:
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ User management
- ✅ Analytics & reports

Just run the backend and frontend, then we can add admin features!

---

**Questions?** Check the main README.md file for more details.
