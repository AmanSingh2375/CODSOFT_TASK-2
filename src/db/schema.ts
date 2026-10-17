import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(), // Firebase auth UID or custom
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  password: text('password'), // hashed password for JWT auth
  role: text('role').notNull().default('CUSTOMER'), // 'CUSTOMER' | 'STAFF' | 'ADMIN'
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Menu Items table
export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  categoryName: text('category_name'),
  isVeg: boolean('is_veg').notNull().default(true),
  isAvailable: boolean('is_available').notNull().default(true),
  rating: doublePrecision('rating').default(4.6),
  ratingCount: integer('rating_count').default(18),
  image: text('image').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Restaurant Tables
export const restaurantTables = pgTable('restaurant_tables', {
  id: serial('id').primaryKey(),
  tableNumber: text('table_number').notNull().unique(),
  capacity: integer('capacity').notNull(),
  location: text('location').notNull().default('Main Dining Area'),
  status: text('status').notNull().default('AVAILABLE'), // 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'
  createdAt: timestamp('created_at').defaultNow(),
});

// Table Reservations
export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  tableId: integer('table_id').references(() => restaurantTables.id),
  tableNumber: text('table_number'),
  reservationDate: text('reservation_date').notNull(), // 'YYYY-MM-DD'
  timeSlot: text('time_slot').notNull(), // e.g. '18:00 - 19:30'
  guestCount: integer('guest_count').notNull().default(2),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  specialNotes: text('special_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Coupons
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description').notNull(),
  discountType: text('discount_type').notNull().default('PERCENTAGE'), // 'PERCENTAGE' | 'FIXED'
  discountValue: doublePrecision('discount_value').notNull(),
  minOrderAmount: doublePrecision('min_order_amount').default(0),
  maxDiscountAmount: doublePrecision('max_discount_amount'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  orderType: text('order_type').notNull().default('DINE_IN'), // 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  tableNumber: text('table_number'),
  deliveryAddress: text('delivery_address'),
  subtotal: doublePrecision('subtotal').notNull(),
  discountAmount: doublePrecision('discount_amount').notNull().default(0),
  taxAmount: doublePrecision('tax_amount').notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  couponCode: text('coupon_code'),
  status: text('status').notNull().default('ORDER_PLACED'), // 'ORDER_PLACED' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED_OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED'
  paymentStatus: text('payment_status').notNull().default('PENDING'), // 'PENDING' | 'PAID' | 'FAILED' | 'PAY_AT_RESTAURANT'
  paymentMethod: text('payment_method').notNull().default('ONLINE'), // 'ONLINE' | 'CASH_ON_DELIVERY' | 'PAY_AT_RESTAURANT'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Order Items
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  menuItemId: integer('menu_item_id').references(() => menuItems.id),
  name: text('name').notNull(),
  price: doublePrecision('price').notNull(),
  quantity: integer('quantity').notNull(),
  total: doublePrecision('total').notNull(),
  image: text('image'),
});

// Payments
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  transactionId: text('transaction_id').notNull(),
  amount: doublePrecision('amount').notNull(),
  status: text('status').notNull().default('SUCCESS'), // 'SUCCESS' | 'PENDING' | 'FAILED'
  paymentMethod: text('payment_method').notNull(),
  paymentDetails: text('payment_details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  reservations: many(reservations),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
}));

export const restaurantTablesRelations = relations(restaurantTables, ({ many }) => ({
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  table: one(restaurantTables, {
    fields: [reservations.tableId],
    references: [restaurantTables.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));
