# DineDesk – Restaurant Ordering Platform

A modern, full-stack digital restaurant management and ordering platform built for customers, kitchen staff, and restaurant managers.

DineDesk connects customer dining, online food ordering, table reservations, live kitchen ticket displays, and sales analytics into a unified real-time application.

---

## 🚀 Key Features

### 1. Digital Menu & Ordering
- **Categorized Menu**: Starters, Main Course, Pizza, Burgers, Beverages, Desserts.
- **Search & Filters**: Instant full-text search, category switcher, vegetarian filter, and price/rating sorting.
- **Add to Cart**: Real-time quantity adjustments, cart badge, and persistent storage.
- **Detailed Dish Modal**: Full ingredient breakdowns, spice notes, and chef recommendations.

### 2. Coupon & Offer Engine
- Dynamic coupon codes (e.g. `WELCOME10` for 10% off, `SAVE50` for ₹50 off, `FEAST20` for 20% off).
- Validated on the backend against minimum order rules and discount caps.
- Instant savings calculation in checkout summary.

### 3. Smart Table Reservations
- Interactive booking by date, dining time slots, party size, and table location.
- **Conflict Prevention**: Backend query verifies existing reservations to prevent double-booking the same table for overlapping slots.
- Real-time slot availability indicators across indoor booths, outdoor terrace, and VIP rooms.

### 4. Checkout & Sandbox Payments
- Supports **Dine-In** (with table selection), **Takeaway**, and **Home Delivery**.
- Online Payment integration with **Razorpay Sandbox / Test Mode simulation**.
- Pay at Restaurant / Cash on Delivery (COD) options.

### 5. Live Kitchen Display (KDS) & Order Tracking
- **Live Stepper Tracker**: `Order Placed` ➔ `Confirmed` ➔ `Preparing` ➔ `Ready` ➔ `Served / Out for Delivery` ➔ `Completed`.
- Automated polling so customer status updates instantly when the kitchen marks dishes cooking or plated.
- Dedicated staff KDS cards with order tickets, elapsed time, and one-click status transitions.

### 6. Staff & Admin Portals
- **Staff Operations**: Real-time KDS, reservation approvals, menu item editor (add dishes, update prices, toggle out-of-stock items), and table capacity controls.
- **Admin Dashboard**: Revenue charts, daily order volumes, bestselling dish leaderboards, user role assignment (Customer, Staff, Admin), and coupon management.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion |
| **Backend** | Node.js, Express.js REST APIs |
| **Database** | PostgreSQL (Relational Database) |
| **ORM & Migrations** | Drizzle ORM (Runtime & Cloud SQL) + Prisma Schema (`prisma/schema.prisma`) |
| **Authentication** | JWT (JSON Web Tokens) with `bcryptjs` password hashing |
| **Payment Gateway** | Razorpay Sandbox / Test Payment API structure |

---

## 📁 Project Architecture & Folder Structure

```
├── /
│   ├── .env.example              # Template environment variables
│   ├── server.ts                 # Full-stack Express server with Vite middleware
│   ├── package.json              # Scripts & dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── vite.config.ts            # Vite & Tailwind configuration
│   ├── prisma/
│   │   └── schema.prisma         # Prisma Schema for college database submission
│   ├── src/
│   │   ├── App.tsx               # App routing and view assembly
│   │   ├── main.tsx              # DOM entry point
│   │   ├── index.css             # Tailwind CSS imports
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces (User, MenuItem, Order, etc.)
│   │   ├── services/
│   │   │   └── api.ts            # Centralized API service with JWT authorization
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # User authentication & role management
│   │   │   └── CartContext.tsx   # Shopping cart, subtotal, and coupons
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Responsive navigation with role switcher
│   │   │   ├── Footer.tsx        # Restaurant footer & business details
│   │   │   ├── FoodCard.tsx      # Food item card with quantity controls
│   │   │   ├── FoodDetailModal.tsx # Food details popup
│   │   │   ├── OrderTracker.tsx  # Live visual status progress bar
│   │   │   └── StatusBadge.tsx   # Reusable status tags
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Modern restaurant homepage
│   │   │   ├── MenuPage.tsx      # Digital menu with live filters
│   │   │   ├── CartCheckoutPage.tsx # Cart review & payment
│   │   │   ├── OrdersPage.tsx    # Order history & live tracking
│   │   │   ├── ReservationsPage.tsx # Table reservation & floor map
│   │   │   ├── AuthPage.tsx      # Sign in & registration
│   │   │   ├── ProfilePage.tsx   # User profile settings
│   │   │   ├── StaffDashboardPage.tsx # Kitchen KDS & staff management
│   │   │   └── AdminDashboardPage.tsx # Admin analytics & coupons
│   │   ├── db/
│   │   │   ├── index.ts          # PostgreSQL pool connection
│   │   │   ├── schema.ts         # Relational schema (tables, foreign keys)
│   │   │   ├── drizzle.config.ts # Schema migration config
│   │   │   └── seed.ts           # Seeder for users, menu, tables & coupons
│   │   └── server/
│   │       ├── auth.ts           # JWT utilities & role middleware
│   │       └── routes/           # REST API routes (auth, menu, orders, etc.)
```

---

## 🗄️ Database Schema & Relational Design

The PostgreSQL database enforces relational constraints across 9 tables:

1. **`users`**: Customer and staff accounts (`id`, `name`, `email`, `phone`, `password`, `role`, `avatar`, `created_at`).
2. **`categories`**: Menu groups (`id`, `name`, `slug`, `description`, `image`, `display_order`).
3. **`menu_items`**: Dish catalog (`id`, `name`, `description`, `price`, `category_id`, `is_veg`, `is_available`, `rating`, `image`).
4. **`restaurant_tables`**: Physical tables (`id`, `table_number`, `capacity`, `location`, `status`).
5. **`reservations`**: Dining reservations (`id`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `table_id`, `reservation_date`, `time_slot`, `guest_count`, `status`, `special_notes`).
6. **`coupons`**: Discount vouchers (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `is_active`).
7. **`orders`**: Customer tickets (`id`, `order_number`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `order_type`, `table_number`, `delivery_address`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `coupon_code`, `status`, `payment_status`, `payment_method`, `notes`).
8. **`order_items`**: Items linked to an order (`id`, `order_id`, `menu_item_id`, `name`, `price`, `quantity`, `total`, `image`).
9. **`payments`**: Payment transaction logs (`id`, `order_id`, `transaction_id`, `amount`, `status`, `payment_method`, `payment_details`).

---

## 🌐 REST API Endpoints

### Authentication
- `POST /api/auth/register` – Create customer account
- `POST /api/auth/login` – Authenticate with email and password
- `GET /api/auth/me` – Retrieve currently logged in profile
- `PUT /api/auth/profile` – Update name, phone, or avatar

### Menu & Categories
- `GET /api/menu` – Filterable menu query (`search`, `category`, `isVeg`, `sortBy`)
- `GET /api/menu/categories` – List all food categories
- `GET /api/menu/:id` – Fetch single item details
- `POST /api/menu` – Add new food item (*Staff/Admin*)
- `PUT /api/menu/:id` – Update price, details, or stock availability (*Staff/Admin*)
- `DELETE /api/menu/:id` – Remove food item (*Staff/Admin*)

### Shopping & Coupons
- `GET /api/coupons` – Fetch active discount coupons
- `POST /api/coupons/apply` – Validate coupon against subtotal and compute discount
- `POST /api/coupons` – Create new coupon (*Admin/Staff*)
- `PUT /api/coupons/:id` – Update or toggle coupon (*Admin/Staff*)
- `DELETE /api/coupons/:id` – Delete coupon (*Admin/Staff*)

### Tables & Reservations
- `GET /api/tables` – Fetch tables with date/time slot availability
- `POST /api/tables` – Add a new table (*Staff/Admin*)
- `GET /api/reservations` – Fetch customer reservations (or all for staff)
- `POST /api/reservations` – Book a table with conflict prevention
- `PUT /api/reservations/:id/status` – Update booking status (*Confirmed, Completed, Cancelled*)

### Orders & Kitchen KDS
- `POST /api/orders` – Place order (Dine-In, Takeaway, or Delivery)
- `GET /api/orders` – List user orders or all staff tickets
- `GET /api/orders/:id` – Fetch live order tracker status and item receipt
- `PUT /api/orders/:id/status` – Transition order status along kitchen stages

### Payments & Dashboard
- `POST /api/payments/create` – Initialize test payment transaction
- `POST /api/payments/verify` – Verify test payment signature and mark order paid
- `GET /api/dashboard/stats` – Metrics, revenue, sales, and weekly order volume
- `GET /api/admin/users` – User list and role promotion/demotion

---

## 🔑 Test Login Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Customer** | `customer@dinedesk.com` | `customer123` | Browsing, ordering, tracking, reserving tables |
| **Kitchen / Staff** | `staff@dinedesk.com` | `staff123` | Kitchen live KDS, order status updates, menu stock management, table reservations |
| **Admin** | `admin@dinedesk.com` | `admin123` | Revenue analytics, user role administration, coupon manager |

*Tip: You can also use the one-click "Quick Test Switcher" at the top of the app bar or in the login form to switch roles instantly.*

---

## ⚡ How Frontend, Backend & Database Communicate

1. **Client Layer (React)**: Handles interactive state (`AuthContext`, `CartContext`), collects user inputs, and sends HTTP requests with JWT tokens in `Authorization: Bearer <token>` headers.
2. **Server Layer (Express.js)**: Runs on `server.ts`. Intercepts `/api/*` routes, validates tokens using `jsonwebtoken`, verifies user roles via `requireRole(['STAFF', 'ADMIN'])`, and executes business logic. In development, Vite middleware is attached to serve HMR frontend seamlessly.
3. **Database Layer (PostgreSQL)**: Connected via a persistent `pg.Pool` connection pool managed through Drizzle ORM. Enforces unique indexes, checks foreign key constraints, and persists orders, tables, and reservations.
4. **Live Polling**: The customer order tracking page (`/orders`) polls `/api/orders/:id` every 5 seconds. As soon as a chef changes an order status from "Preparing" to "Ready" on the Kitchen KDS, the customer's visual tracker animates forward immediately.

---

## 💻 Local Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Seed Database**:
   ```bash
   npm run seed
   ```

4. **Start Full-Stack Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.
