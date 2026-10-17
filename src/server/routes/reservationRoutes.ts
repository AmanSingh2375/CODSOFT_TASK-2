import { Router } from 'express';
import { db } from '../../db/index.ts';
import { reservations, restaurantTables, users } from '../../db/schema.ts';
import { optionalAuth, requireAuth, requireRole, AuthenticatedRequest } from '../auth.ts';
import { and, desc, eq, or } from 'drizzle-orm';

const router = Router();

// GET /api/reservations
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const isStaffOrAdmin = req.user && (req.user.role === 'STAFF' || req.user.role === 'ADMIN');

    if (isStaffOrAdmin) {
      const all = await db
        .select()
        .from(reservations)
        .orderBy(desc(reservations.createdAt));
      return res.json(all);
    }

    // Customer flow: if authenticated, return reservations for their user ID or email
    if (req.user) {
      const userBookings = await db
        .select()
        .from(reservations)
        .where(
          or(
            eq(reservations.userId, req.user.userId),
            eq(reservations.customerEmail, req.user.email)
          )
        )
        .orderBy(desc(reservations.createdAt));
      return res.json(userBookings);
    }

    // Unauthenticated guest lookup by email query
    const email = req.query.email;
    if (email && typeof email === 'string') {
      const guestBookings = await db
        .select()
        .from(reservations)
        .where(eq(reservations.customerEmail, email.toLowerCase().trim()))
        .orderBy(desc(reservations.createdAt));
      return res.json(guestBookings);
    }

    res.json([]);
  } catch (error: any) {
    console.error('Fetch reservations error:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// POST /api/reservations (Customer or Guest)
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      tableId,
      reservationDate,
      timeSlot,
      guestCount,
      specialNotes,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !tableId || !reservationDate || !timeSlot) {
      return res.status(400).json({ error: 'All reservation details including table, date, and time slot are required' });
    }

    const tId = parseInt(tableId, 10);
    const [table] = await db.select().from(restaurantTables).where(eq(restaurantTables.id, tId));

    if (!table) {
      return res.status(404).json({ error: 'Selected table not found' });
    }

    // Check if table is already booked for this date and time slot
    const existingReservations = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.tableId, tId),
          eq(reservations.reservationDate, reservationDate),
          eq(reservations.timeSlot, timeSlot)
        )
      );

    const isConflict = existingReservations.some(
      (r) => r.status === 'CONFIRMED' || r.status === 'PENDING'
    );

    if (isConflict) {
      return res.status(409).json({
        error: `Table ${table.tableNumber} is already reserved for ${timeSlot} on ${reservationDate}. Please select another table or time slot.`,
      });
    }

    const [newReservation] = await db
      .insert(reservations)
      .values({
        userId: req.user ? req.user.userId : null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        tableId: tId,
        tableNumber: table.tableNumber,
        reservationDate,
        timeSlot,
        guestCount: guestCount ? parseInt(guestCount, 10) : 2,
        status: 'CONFIRMED', // Immediately confirmed with table lock
        specialNotes: specialNotes?.trim() || null,
      })
      .returning();

    res.status(201).json({
      message: 'Table reserved successfully!',
      reservation: newReservation,
    });
  } catch (error: any) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Failed to create table reservation' });
  }
});

// PUT /api/reservations/:id/status
router.put('/:id/status', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid reservation ID' });
    }

    const { status } = req.body;
    const allowed = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
    }

    const [existing] = await db.select().from(reservations).where(eq(reservations.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // If customer cancels their own reservation
    if (req.user && req.user.role === 'CUSTOMER' && existing.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: Cannot modify another user reservation' });
    }

    const [updated] = await db
      .update(reservations)
      .set({ status })
      .where(eq(reservations.id, id))
      .returning();

    res.json({
      message: `Reservation updated to ${status}`,
      reservation: updated,
    });
  } catch (error: any) {
    console.error('Update reservation status error:', error);
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
});

export default router;
