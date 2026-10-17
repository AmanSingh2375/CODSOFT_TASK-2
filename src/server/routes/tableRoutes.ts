import { Router } from 'express';
import { db } from '../../db/index.ts';
import { reservations, restaurantTables } from '../../db/schema.ts';
import { requireAuth, requireRole } from '../auth.ts';
import { and, eq, notInArray } from 'drizzle-orm';

const router = Router();

// GET /api/tables
router.get('/', async (req, res) => {
  try {
    const { date, timeSlot } = req.query;

    const allTables = await db.select().from(restaurantTables).orderBy(restaurantTables.tableNumber);

    // If date and timeSlot are provided, calculate availability for that slot
    if (date && timeSlot && typeof date === 'string' && typeof timeSlot === 'string') {
      const activeBookings = await db
        .select()
        .from(reservations)
        .where(
          and(
            eq(reservations.reservationDate, date),
            eq(reservations.timeSlot, timeSlot)
          )
        );

      const bookedTableIds = new Set(
        activeBookings
          .filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING')
          .map((b) => b.tableId)
          .filter(Boolean)
      );

      const tablesWithSlotStatus = allTables.map((t) => ({
        ...t,
        isSlotAvailable: !bookedTableIds.has(t.id) && t.status !== 'OCCUPIED',
      }));

      return res.json(tablesWithSlotStatus);
    }

    res.json(allTables);
  } catch (error: any) {
    console.error('Fetch tables error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant tables' });
  }
});

// POST /api/tables (Staff / Admin)
router.post('/', requireAuth, requireRole(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const { tableNumber, capacity, location, status } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({ error: 'Table number and capacity are required' });
    }

    const cleanNumber = tableNumber.trim().toUpperCase();
    const existing = await db
      .select()
      .from(restaurantTables)
      .where(eq(restaurantTables.tableNumber, cleanNumber));

    if (existing.length > 0) {
      return res.status(409).json({ error: `Table '${cleanNumber}' already exists` });
    }

    const [newTable] = await db
      .insert(restaurantTables)
      .values({
        tableNumber: cleanNumber,
        capacity: parseInt(capacity, 10),
        location: location?.trim() || 'Main Dining Area',
        status: status || 'AVAILABLE',
      })
      .returning();

    res.status(201).json(newTable);
  } catch (error: any) {
    console.error('Create table error:', error);
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// PUT /api/tables/:id (Staff / Admin)
router.put('/:id', requireAuth, requireRole(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid table ID' });
    }

    const { tableNumber, capacity, location, status } = req.body;

    const [updated] = await db
      .update(restaurantTables)
      .set({
        ...(tableNumber ? { tableNumber: tableNumber.trim().toUpperCase() } : {}),
        ...(capacity !== undefined ? { capacity: parseInt(capacity, 10) } : {}),
        ...(location ? { location: location.trim() } : {}),
        ...(status ? { status } : {}),
      })
      .where(eq(restaurantTables.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Update table error:', error);
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// DELETE /api/tables/:id (Staff / Admin)
router.delete('/:id', requireAuth, requireRole(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid table ID' });
    }

    const [deleted] = await db
      .delete(restaurantTables)
      .where(eq(restaurantTables.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json({ message: 'Table deleted successfully' });
  } catch (error: any) {
    console.error('Delete table error:', error);
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

export default router;
