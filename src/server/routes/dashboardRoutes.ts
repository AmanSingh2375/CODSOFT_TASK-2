import { Router } from 'express';
import { db } from '../../db/index.ts';
import { menuItems, orders, orderItems, reservations, restaurantTables, users } from '../../db/schema.ts';
import { requireAuth, requireRole, AuthenticatedRequest } from '../auth.ts';
import { desc, eq, sql } from 'drizzle-orm';

const router = Router();

// GET /api/dashboard/stats (Staff and Admin)
router.get('/stats', requireAuth, requireRole(['STAFF', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  try {
    const allOrders = await db.select().from(orders);
    const allReservations = await db.select().from(reservations);
    const allUsers = await db.select().from(users);
    const allTables = await db.select().from(restaurantTables);
    const allItems = await db.select().from(orderItems);

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.status === 'ORDER_PLACED' || o.status === 'CONFIRMED').length;
    const preparingOrders = allOrders.filter((o) => o.status === 'PREPARING').length;
    const readyOrders = allOrders.filter((o) => o.status === 'READY').length;
    const completedOrders = allOrders.filter((o) => o.status === 'COMPLETED' || o.status === 'SERVED_OUT_FOR_DELIVERY').length;

    const totalRevenue = allOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = allOrders.filter(
      (o) => o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === todayStr
    );
    const todaySales = todayOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const todayReservations = allReservations.filter((r) => r.reservationDate === todayStr).length;

    // Item popularity calculation
    const itemMap = new Map<string, { name: string; count: number; revenue: number }>();
    allItems.forEach((it) => {
      const existing = itemMap.get(it.name) || { name: it.name, count: 0, revenue: 0 };
      existing.count += it.quantity;
      existing.revenue += it.total;
      itemMap.set(it.name, existing);
    });

    const popularDishes = Array.from(itemMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent 7 days breakdown for analytics chart
    const last7Days: Record<string, { date: string; orders: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const shortLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      last7Days[dStr] = { date: shortLabel, orders: 0, revenue: 0 };
    }

    allOrders.forEach((o) => {
      if (o.createdAt) {
        const dStr = new Date(o.createdAt).toISOString().split('T')[0];
        if (last7Days[dStr]) {
          last7Days[dStr].orders += 1;
          if (o.paymentStatus === 'PAID') {
            last7Days[dStr].revenue += o.totalAmount;
          }
        }
      }
    });

    res.json({
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      todaySales: Math.round(todaySales * 100) / 100,
      todayReservations,
      totalReservations: allReservations.length,
      totalUsers: allUsers.length,
      totalTables: allTables.length,
      availableTables: allTables.filter((t) => t.status === 'AVAILABLE').length,
      popularDishes,
      dailyTrend: Object.values(last7Days),
    });
  } catch (error: any) {
    console.error('Fetch dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET /api/admin/users (Admin only)
router.get('/users', requireAuth, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res) => {
  try {
    const list = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json(list);
  } catch (error: any) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch user list' });
  }
});

// PUT /api/admin/users/:id/role (Admin only)
router.put('/users/:id/role', requireAuth, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!['CUSTOMER', 'STAFF', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated', user: updated });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
