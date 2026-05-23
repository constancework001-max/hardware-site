# TechFix Pro — Hardware Sales & Repairs Website

A full-stack web application for hardware repair bookings, service management, and hardware parts shopping.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Supabase recommended) |
| Auth | JWT + bcryptjs |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| Images | Cloudinary |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway / Render |

---

## Project Structure

```
hardware-site/
├── backend/
│   ├── db/index.js          # DB connection + schema init
│   ├── middleware/auth.js    # JWT middleware
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile
│   │   ├── services.js      # Repair service bookings
│   │   ├── products.js      # Hardware products
│   │   ├── orders.js        # Purchase orders
│   │   └── payments.js      # Razorpay integration
│   ├── utils/email.js       # Booking confirmation emails
│   ├── server.js            # Express entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/axios.js     # Axios instance with JWT
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Services.jsx  # Book & cancel repairs
    │   │   ├── Shop.jsx      # Browse & buy products
    │   │   ├── Cart.jsx      # Cart + Razorpay checkout
    │   │   └── Dashboard.jsx # User bookings, orders, profile
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Local Development Setup

### Step 1: Database (Supabase — free)

1. Go to https://supabase.com and create a new project
2. Copy your connection string from Settings → Database → Connection String (URI mode)
3. It looks like: `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres`

### Step 2: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

Your backend runs at http://localhost:5000
The database tables are created automatically on first start.

### Step 3: Frontend Setup

```bash
cd frontend
npm install
# Create frontend/.env file:
echo "VITE_API_URL=/api" > .env
npm run dev
```

Your frontend runs at http://localhost:5173

---

## Environment Variables (backend/.env)

```env
DATABASE_URL=postgresql://...       # From Supabase
JWT_SECRET=any_long_random_string   # Make this strong!
RAZORPAY_KEY_ID=rzp_test_xxx        # From razorpay.com dashboard
RAZORPAY_KEY_SECRET=xxx             # From razorpay.com dashboard
CLOUDINARY_CLOUD_NAME=xxx           # From cloudinary.com
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
EMAIL_USER=yourshop@gmail.com       # Gmail account
EMAIL_PASS=xxxx xxxx xxxx xxxx      # Gmail App Password (NOT your real password)
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Getting Gmail App Password:
1. Enable 2FA on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password for "Mail"
4. Use the 16-character code as EMAIL_PASS

### Getting Razorpay Keys:
1. Sign up at https://razorpay.com
2. Dashboard → Settings → API Keys → Generate Test Key
3. Use Test keys for development, Live keys for production

---

## Deployment

### Deploy Backend on Railway

```bash
# 1. Push your backend to GitHub

# 2. Go to https://railway.app
# 3. New Project → Deploy from GitHub repo → select backend folder
# 4. Add all environment variables in Railway dashboard
# 5. Railway gives you a URL like: https://your-app.railway.app

# Set FRONTEND_URL to your Vercel frontend URL in Railway env vars
```

### Deploy Frontend on Vercel

```bash
# 1. Push your frontend to GitHub

# 2. Go to https://vercel.com
# 3. New Project → Import from GitHub → select frontend folder
# 4. Set environment variable:
#    VITE_API_URL = https://your-backend.railway.app/api
# 5. Deploy — Vercel gives you https://your-app.vercel.app
```

### Connect Custom Domain

In Vercel Dashboard → your project → Settings → Domains:
- Add your domain (e.g. techfixpro.com)
- Vercel shows you DNS records to add in Namecheap/GoDaddy:
  - Type: A, Name: @, Value: 76.76.19.61
  - Type: CNAME, Name: www, Value: cname.vercel-dns.com

SSL is automatically handled by Vercel.

---

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile (auth required) |
| PUT | /api/auth/profile | Update profile (auth required) |

### Services
| Method | Route | Description |
|---|---|---|
| GET | /api/services | List all repair services |
| GET | /api/services/bookings | Get user's bookings (auth) |
| POST | /api/services/book | Create booking (auth) |
| DELETE | /api/services/bookings/:id | Cancel booking (auth) |

### Products
| Method | Route | Description |
|---|---|---|
| GET | /api/products | List products (with filters) |
| GET | /api/products/categories | List categories |
| GET | /api/products/:id | Single product |

### Orders
| Method | Route | Description |
|---|---|---|
| POST | /api/orders | Place order (auth) |
| GET | /api/orders | Get user's orders (auth) |
| DELETE | /api/orders/:id | Cancel order (auth) |

### Payments
| Method | Route | Description |
|---|---|---|
| POST | /api/payments/create-order | Create Razorpay order |
| POST | /api/payments/verify | Verify payment signature |

---

## Features Summary

- ✅ User registration & login (JWT auth)
- ✅ Browse repair services with prices
- ✅ Book repair services with date/time selection
- ✅ Cancel bookings
- ✅ Email confirmation on booking
- ✅ Browse & search hardware products
- ✅ Shopping cart (persisted in localStorage)
- ✅ Place orders with Razorpay payment
- ✅ Cancel orders
- ✅ User dashboard with all bookings & orders
- ✅ Profile editing
- ✅ Admin-ready routes (set role='admin' in DB)
- ✅ Responsive dark theme UI
- ✅ Product stock management

---

## Making Someone Admin

Run this SQL in Supabase or your PostgreSQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'youremail@example.com';
```

Admin can then access `/api/services/admin/all`, `/api/orders/admin/all`, etc.
