# 📋 Plants Mall - Tech Stack Summary

## 🎯 Project Overview
A modern **full-stack e-commerce platform** for a garden nursery with:
- Beautiful public-facing store
- Product catalog with advanced filtering
- Shopping cart with drawer UI
- User authentication
- Backend API with database
- Ready for admin dashboard expansion

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                    │
│                  Next.js Frontend (React)               │
│  Homepage | Products | Auth | About | Shopping Cart    │
└────────────────────────┬────────────────────────────────┘
                         │ API Calls (REST)
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                            │
│                 Express.js Backend                      │
│  Auth Routes | Product Routes | Validation | Security  │
└────────────────────────┬────────────────────────────────┘
                         │ CRUD Operations
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                            │
│               MongoDB Atlas (Cloud DB)                  │
│  Collections: Users | Products | Orders | Categories   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Stack

### Framework & Language
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^14.0.0 | React framework with SSR/SSG |
| `react` | ^18.2.0 | UI library |
| `typescript` | ^5.3.3 | Type safety |

### Styling & Components
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3.3.6 | Utility-first CSS |
| `autoprefixer` | ^10.4.16 | CSS vendor prefixes |
| `postcss` | ^8.4.32 | CSS processing |
| `react-icons` | ^4.12.0 | Icon library |

### State Management & API
| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^4.4.5 | Lightweight state management |
| `axios` | ^1.6.0 | HTTP client with interceptors |

### Form Handling
| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | ^7.48.0 | Form state & validation |
| `@hookform/resolvers` | ^3.3.4 | Form validation schemas |
| `zod` | ^3.22.4 | Schema validation |

---

## 🖥️ Backend Stack

### Framework & Language
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18.2 | Web framework |
| `typescript` | ^5.3.3 | Type safety |
| `node` | 18+ | JavaScript runtime |

### Database & ODM
| Package | Version | Purpose |
|---------|---------|---------|
| `mongoose` | ^8.0.0 | MongoDB ODM |

### Authentication & Security
| Package | Version | Purpose |
|---------|---------|---------|
| `jsonwebtoken` | ^9.1.2 | JWT creation & verification |
| `bcryptjs` | ^2.4.3 | Password hashing |
| `cors` | ^2.8.5 | Cross-origin requests |
| `helmet` | ^7.1.0 | Security headers |
| `express-validator` | ^7.0.0 | Input validation |
| `express-rate-limit` | ^7.1.5 | Rate limiting |

### File Handling
| Package | Version | Purpose |
|---------|---------|---------|
| `multer` | ^1.4.5 | File uploads |
| `cloudinary` | ^1.41.0 | Cloud storage (optional) |

### Environment & Configuration
| Package | Version | Purpose |
|---------|---------|---------|
| `dotenv` | ^16.3.1 | Environment variables |

---

## 🗄️ Database Schema

### MongoDB Atlas (Cloud)
**Connection:** `mongodb+srv://plants-mall:Plants2003@plants-mall.otyfvij.mongodb.net/plants-mall`

#### Collections & Fields:

**Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcryptjs),
  role: Enum['admin', 'staff', 'customer'],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Products Collection**
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  price: Number (required),
  discount: Number (0-100),
  image: String (CloudURL),
  category: String,
  stock: Number,
  sku: String (unique, required),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Orders Collection**
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  customerId: String (userId),
  products: [
    {
      productId: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: Enum['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
  paymentStatus: Enum['pending', 'paid', 'failed'],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📦 Project Dependencies Breakdown

### Frontend Dependencies (14 packages)
```json
{
  "production": [
    "next", "react", "react-dom", "typescript",
    "@types/react", "@types/react-dom", "@types/node",
    "axios", "zustand", "react-hook-form", "zod",
    "@hookform/resolvers", "react-icons"
  ],
  "devDependencies": [
    "tailwindcss", "autoprefixer", "postcss", "eslint"
  ]
}
```

### Backend Dependencies (15 packages)
```json
{
  "production": [
    "express", "mongoose", "dotenv", "bcryptjs",
    "jsonwebtoken", "express-validator", "multer",
    "cors", "helmet", "express-rate-limit", "cloudinary"
  ],
  "devDependencies": [
    "typescript", "@types/express", "@types/node",
    "@types/bcryptjs", "@types/jsonwebtoken", "@types/multer",
    "tsx", "eslint"
  ]
}
```

---

## 🚀 Deployment Architecture

### Frontend - Vercel
```
Github Repo → Vercel Dashboard
↓
Build: next build
↓
Deploy: Next.js Serverless Functions
↓
Domain: plants-mall.vercel.app
```

### Backend - Railway/Render
```
Github Repo → Railway/Render Dashboard
↓
Build: npm install, npm run build
↓
Run: node dist/app.js on Port 5000
↓
Domain: plants-mall-api.railway.app
```

### Database - MongoDB Atlas
```
Cloud Hosted MongoDB
Automatic Backups
IP Whitelist
Connection Pooling
```

---

## 🔐 Security Layers

### Authentication Flow
```
User Input
    ↓
Form Validation (Client)
    ↓
API Request → POST /auth/login
    ↓
Backend Validation
    ↓
Password Verify (bcryptjs.compare)
    ↓
JWT Token Generation
    ↓
Token Stored (localStorage)
    ↓
Protected Routes with Authorization
```

### Protected Endpoints Pattern
```
Frontend Request
    ↓
Axios Interceptor Adds JWT
    ↓
Express Middleware Validates Token
    ↓
Role Check (RBAC)
    ↓
Controller Logic
    ↓
Database Query
    ↓
Response
```

---

## 🎯 API Endpoints Structure

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://plants-mall-api.railway.app/api`

### Endpoint Categories

**Authentication**
```
POST /auth/register
POST /auth/login
```

**Products**
```
GET    /products              (public)
GET    /products/:id          (public)
POST   /products              (admin/staff)
PUT    /products/:id          (admin/staff)
DELETE /products/:id          (admin)
```

**Health Check**
```
GET /health
```

---

## 📊 File Size Overview

### Frontend
- **node_modules:** ~500MB
- **dist/build:** ~3-5MB
- **source code:** ~150KB

### Backend
- **node_modules:** ~300MB
- **dist/build:** ~50KB
- **source code:** ~100KB

---

## 🔄 Development Workflow

### Frontend Development
```bash
npm run dev          # Hot reload at 3000
npm run build        # Production build
npm run lint         # Code quality
```

### Backend Development
```bash
npm run dev          # Watch mode with tsx at 5000
npm run build        # Compile TypeScript
npm run start        # Run compiled code
```

---

## 📈 Scalability Notes

### Ready for Growth
✅ Modular folder structure
✅ Separated concerns (MVC pattern)
✅ Database indexing ready
✅ Environment-based configuration
✅ Error handling middleware
✅ API rate limiting ready
✅ JWT for stateless auth

### Future Scaling
- Add caching (Redis)
- Implement API versioning
- Database sharding
- Microservices architecture
- Message queues (Bull, RabbitMQ)
- Search optimization (Elasticsearch)

---

## 🛠️ Development Tools

### Backend Testing (Ready to add)
- Jest for unit tests
- Supertest for API tests
- Postman collections

### Frontend Testing (Ready to add)
- Jest for unit tests
- React Testing Library
- Cypress for E2E tests

### Monitoring (Production)
- Sentry for error tracking
- New Relic for performance
- LogRocket for user sessions

---

## 📱 Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## ⚡ Performance Metrics

### Frontend
- Next.js automatic code splitting
- Image optimization
- CSS purging with Tailwind
- Lazy loading components
- API request caching ready

### Backend
- Connection pooling (Mongoose)
- Request compression ready
- Helmet.js for optimized headers
- Rate limiting ready
- Database indexing ready

---

## 🔗 Integration Points

### Frontend ↔ Backend
```
Axios → Express Routes → Mongoose → MongoDB
```

### Environment-Specific
- **Development:** localhost:5000 & localhost:3000
- **Production:** Different domain variables

### Token Management
```
Login → JWT Token → Axios Interceptor → Auto Headers
```

---

## 📚 Documentation Files

✅ `README.md` - Full project documentation
✅ `QUICKSTART.md` - 5-minute setup guide
✅ `COMPLETED.md` - What's been built
✅ `TECHSTACK.md` - This file (detailed tech info)

---

## 🎓 Learning Resources

### Tech Stack Docs
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

## ✅ Status: READY FOR DEVELOPMENT

All systems configured and tested. Ready to:
✅ Run the application
✅ Add admin dashboard
✅ Implement payment system
✅ Deploy to production

**Let's build! 🚀**
