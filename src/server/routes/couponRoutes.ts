import { Router } from 'express';
import { db } from '../../db/index.ts';
import { coupons } from '../../db/schema.ts';
import { optionalAuth, requireAuth, requireRole, AuthenticatedRequest } from '../auth.ts';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/coupons
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const isStaffOrAdmin = req.user && (req.user.role === 'STAFF' || req.user.role === 'ADMIN');
    const allCoupons = await db.select().from(coupons);

    if (isStaffOrAdmin) {
      return res.json(allCoupons);
    }

    // Customers only see active coupons
    const active = allCoupons.filter((c) => c.isActive);
    res.json(active);
  } catch (error: any) {
    console.error('Fetch coupons error:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// POST /api/coupons/apply
router.post('/apply', async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal === undefined) {
      return res.status(400).json({ error: 'Coupon code and subtotal are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, cleanCode));

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: 'This coupon is no longer active' });
    }

    const orderAmount = parseFloat(subtotal);
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon ${cleanCode}`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      // FIXED
      discount = Math.min(coupon.discountValue, orderAmount);
    }

    discount = Math.round(discount * 100) / 100;

    res.json({
      valid: true,
      code: coupon.code,
      discountAmount: discount,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error: any) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
});

// POST /api/coupons (Admin / Staff)
router.post('/', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, isActive } = req.body;

    if (!code || !description || discountValue === undefined) {
      return res.status(400).json({ error: 'Code, description, and discount value are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await db.select().from(coupons).where(eq(coupons.code, cleanCode));
    if (existing.length > 0) {
      return res.status(409).json({ error: `Coupon code '${cleanCode}' already exists` });
    }

    const [newCoupon] = await db
      .insert(coupons)
      .values({
        code: cleanCode,
        description: description.trim(),
        discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        isActive: isActive === undefined ? true : Boolean(isActive),
      })
      .returning();

    res.status(201).json(newCoupon);
  } catch (error: any) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// PUT /api/coupons/:id (Admin / Staff)
router.put('/:id', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, isActive } = req.body;

    const [updated] = await db
      .update(coupons)
      .set({
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(description ? { description: description.trim() } : {}),
        ...(discountType ? { discountType } : {}),
        ...(discountValue !== undefined ? { discountValue: parseFloat(discountValue) } : {}),
        ...(minOrderAmount !== undefined ? { minOrderAmount: parseFloat(minOrderAmount) } : {}),
        ...(maxDiscountAmount !== undefined
          ? { maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null }
          : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      })
      .where(eq(coupons.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// DELETE /api/coupons/:id (Admin / Staff)
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    const [deleted] = await db.delete(coupons).where(eq(coupons.id, id)).returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

export default router;
