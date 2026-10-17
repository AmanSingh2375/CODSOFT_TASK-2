export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatar?: string | null;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  displayOrder?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId?: number | null;
  categoryName?: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  rating?: number;
  ratingCount?: number;
  image: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface RestaurantTable {
  id: number;
  tableNumber: string;
  capacity: number;
  location: string;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED';
  isSlotAvailable?: boolean;
}

export interface Reservation {
  id: number;
  userId?: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tableId?: number | null;
  tableNumber?: string | null;
  reservationDate: string;
  timeSlot: string;
  guestCount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  specialNotes?: string | null;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  isActive: boolean;
}

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED_OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'PAY_AT_RESTAURANT';
export type PaymentMethod = 'ONLINE' | 'CASH_ON_DELIVERY' | 'PAY_AT_RESTAURANT';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId?: number | null;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image?: string | null;
}

export interface Payment {
  id: number;
  orderId: number;
  transactionId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentDetails?: string | null;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: OrderType;
  tableNumber?: string | null;
  deliveryAddress?: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  totalRevenue: number;
  todaySales: number;
  todayReservations: number;
  totalReservations: number;
  totalUsers: number;
  totalTables: number;
  availableTables: number;
  popularDishes: Array<{ name: string; count: number; revenue: number }>;
  dailyTrend: Array<{ date: string; orders: number; revenue: number }>;
}
