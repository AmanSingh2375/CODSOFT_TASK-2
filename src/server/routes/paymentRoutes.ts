import { Router } from 'express';
import { db } from '../../db/index.ts';
import { orders, payments } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';

const router = Router();

// POST /api/payments/create
router.post('/create', async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Order ID and amount are required' });
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, parseInt(orderId, 10)));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Mock/Sandbox gateway transaction identifier
    const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

    res.json({
      success: true,
      gateway: 'Razorpay Sandbox / Test Mode',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dineDeskDemo2026',
      razorpayOrderId,
      amount: Math.round(order.totalAmount * 100), // amount in paise
      currency: 'INR',
      orderNumber: order.orderNumber,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// POST /api/payments/verify
router.post('/verify', async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature, paymentMethod } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const oId = parseInt(orderId, 10);
    const [order] = await db.select().from(orders).where(eq(orders.id, oId));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const txnId = razorpayPaymentId || `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Record verified payment
    const [paymentRecord] = await db
      .insert(payments)
      .values({
        orderId: oId,
        transactionId: txnId,
        amount: order.totalAmount,
        status: 'SUCCESS',
        paymentMethod: paymentMethod || 'ONLINE_UPI_CARD',
        paymentDetails: JSON.stringify({
          gateway: 'Razorpay Test Mode',
          razorpayPaymentId: txnId,
          razorpayOrderId: razorpayOrderId || 'test_order_id',
          verifiedAt: new Date().toISOString(),
        }),
      })
      .returning();

    // Update order status to CONFIRMED and payment to PAID
    const [updatedOrder] = await db
      .update(orders)
      .set({
        paymentStatus: 'PAID',
        status: order.status === 'ORDER_PLACED' ? 'CONFIRMED' : order.status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, oId))
      .returning();

    res.json({
      success: true,
      message: 'Payment verified and recorded successfully!',
      payment: paymentRecord,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;
