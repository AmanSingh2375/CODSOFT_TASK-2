import { Router } from 'express';
import { db } from '../../db/index.ts';
import { coupons, menuItems, orders, orderItems, payments, users } from '../../db/schema.ts';
import { optionalAuth, requireAuth, requireRole, AuthenticatedRequest } from '../auth.ts';
import { desc, eq, inArray, or } from 'drizzle-orm';

const router = Router();

// GET /api/orders
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const isStaffOrAdmin = req.user && (req.user.role === 'STAFF' || req.user.role === 'ADMIN');
    const { status, limit } = req.query;

    let orderList = [];

    if (isStaffOrAdmin) {
      orderList = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt));

      if (status && typeof status === 'string') {
        const statuses = status.split(',').map((s) => s.trim());
        orderList = orderList.filter((o) => statuses.includes(o.status));
      }
    } else if (req.user) {
      orderList = await db
        .select()
        .from(orders)
        .where(
          or(
            eq(orders.userId, req.user.userId),
            eq(orders.customerEmail, req.user.email)
          )
        )
        .orderBy(desc(orders.createdAt));
    } else if (req.query.email && typeof req.query.email === 'string') {
      orderList = await db
        .select()
        .from(orders)
        .where(eq(orders.customerEmail, req.query.email.toLowerCase().trim()))
        .orderBy(desc(orders.createdAt));
    } else {
      return res.json([]);
    }

    if (limit && !isNaN(parseInt(limit as string, 10))) {
      orderList = orderList.slice(0, parseInt(limit as string, 10));
    }

    // Attach order items for each order
    const orderIds = orderList.map((o) => o.id);
    let itemsByOrder: Record<number, any[]> = {};

    if (orderIds.length > 0) {
      const allItems = await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds));

      allItems.forEach((item) => {
        if (!itemsByOrder[item.orderId]) {
          itemsByOrder[item.orderId] = [];
        }
        itemsByOrder[item.orderId].push(item);
      });
    }

    const populated = orderList.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    }));

    res.json(populated);
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id (Live Tracking & Details)
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    const paymentRecords = await db.select().from(payments).where(eq(payments.orderId, id));

    res.json({
      ...order,
      items,
      payments: paymentRecords,
    });
  } catch (error: any) {
    console.error('Fetch order detail error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// POST /api/orders (Create Order)
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      tableNumber,
      deliveryAddress,
      items,
      couponCode,
      paymentMethod,
      notes,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer contact and at least one item are required' });
    }

    if (orderType === 'DELIVERY' && !deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required for delivery orders' });
    }

    // Verify items against DB
    const itemIds = items.map((i: any) => parseInt(i.menuItemId, 10)).filter((id: number) => !isNaN(id));
    const dbMenuItems = await db.select().from(menuItems).where(inArray(menuItems.id, itemIds));
    const menuItemMap = new Map(dbMenuItems.map((m) => [m.id, m]));

    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      menuItemId: number;
      name: string;
      price: number;
      quantity: number;
      total: number;
      image: string;
    }> = [];

    for (const item of items) {
      const mItem = menuItemMap.get(parseInt(item.menuItemId, 10));
      if (!mItem) {
        return res.status(400).json({ error: `Menu item with ID ${item.menuItemId} not found` });
      }
      if (!mItem.isAvailable) {
        return res.status(400).json({ error: `'${mItem.name}' is currently out of stock` });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const lineTotal = mItem.price * qty;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        menuItemId: mItem.id,
        name: mItem.name,
        price: mItem.price,
        quantity: qty,
        total: lineTotal,
        image: mItem.image,
      });
    }

    // Calculate coupon discount
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const [cp] = await db.select().from(coupons).where(eq(coupons.code, cleanCode));
      if (cp && cp.isActive && (!cp.minOrderAmount || calculatedSubtotal >= cp.minOrderAmount)) {
        appliedCoupon = cp.code;
        if (cp.discountType === 'PERCENTAGE') {
          discountAmount = (calculatedSubtotal * cp.discountValue) / 100;
          if (cp.maxDiscountAmount && discountAmount > cp.maxDiscountAmount) {
            discountAmount = cp.maxDiscountAmount;
          }
        } else {
          discountAmount = Math.min(cp.discountValue, calculatedSubtotal);
        }
      }
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount);
    // Standard 5% restaurant GST/tax
    const taxAmount = Math.round(taxableAmount * 0.05 * 100) / 100;
    const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

    // Generate unique order number (e.g. DD-2026-X8B9)
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `DD-${new Date().getFullYear()}-${randomSuffix}`;

    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: req.user ? req.user.userId : null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        orderType: orderType || 'DINE_IN',
        tableNumber: orderType === 'DINE_IN' ? tableNumber || null : null,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress?.trim() : null,
        subtotal: calculatedSubtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        couponCode: appliedCoupon,
        status: 'ORDER_PLACED',
        paymentStatus: paymentMethod === 'ONLINE' ? 'PAID' : 'PAY_AT_RESTAURANT',
        paymentMethod: paymentMethod || 'ONLINE',
        notes: notes?.trim() || null,
      })
      .returning();

    // Insert order items
    for (const vItem of validatedItems) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        menuItemId: vItem.menuItemId,
        name: vItem.name,
        price: vItem.price,
        quantity: vItem.quantity,
        total: vItem.total,
        image: vItem.image,
      });
    }

    // Insert payment record if marked paid
    if (newOrder.paymentStatus === 'PAID') {
      await db.insert(payments).values({
        orderId: newOrder.id,
        transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        amount: totalAmount,
        status: 'SUCCESS',
        paymentMethod: paymentMethod || 'ONLINE',
        paymentDetails: JSON.stringify({ mode: 'Test Sandbox Gateway', verified: true }),
      });
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        ...newOrder,
        items: validatedItems,
      },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// PUT /api/orders/:id/status (Staff, Kitchen & Admin)
router.put('/:id/status', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { status, paymentStatus } = req.body;
    const validStatuses = [
      'ORDER_PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'SERVED_OUT_FOR_DELIVERY',
      'COMPLETED',
      'CANCELLED',
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid order status: ${status}` });
    }

    const [existing] = await db.select().from(orders).where(eq(orders.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [updated] = await db
      .update(orders)
      .set({
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    res.json({
      message: `Order status updated to ${status || updated.status}`,
      order: updated,
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
