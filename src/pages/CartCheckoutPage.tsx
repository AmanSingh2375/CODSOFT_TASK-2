import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Check,
  X,
  CreditCard,
  Banknote,
  Utensils,
  Truck,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { RestaurantTable } from '../types/index.ts';

interface CartCheckoutPageProps {
  onNavigate: (view: string, param?: any) => void;
  onOrderSuccess: (orderId: number) => void;
}

export const CartCheckoutPage: React.FC<CartCheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    appliedCoupon,
    couponError,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const { user } = useAuth();

  // Checkout form fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN');
  const [tableNumber, setTableNumber] = useState<string>('T-01');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH_ON_DELIVERY' | 'PAY_AT_RESTAURANT'>('ONLINE');
  const [notes, setNotes] = useState<string>('');

  // Tables list for Dine-In
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);

  // Coupon input
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payment sandbox modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  // Pre-fill user data when available
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Load tables for dine-in selection
  useEffect(() => {
    async function loadTables() {
      try {
        const tbls = await api.tables.getAll();
        setAvailableTables(tbls);
        if (tbls.length > 0 && !tableNumber) {
          setTableNumber(tbls[0].tableNumber);
        }
      } catch (err) {
        console.error('Failed to load tables:', err);
      }
    }
    loadTables();
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    await applyCouponCode(couponInput);
    setApplyingCoupon(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Add food items before checking out.');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMessage('Please fill in your name, email, and contact phone number.');
      return;
    }

    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      setErrorMessage('Delivery address is required for home delivery.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create order in PostgreSQL
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber : null,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
        })),
        couponCode: appliedCoupon?.code || null,
        paymentMethod: paymentMethod === 'ONLINE' ? 'ONLINE' : paymentMethod,
        notes: notes.trim() || null,
      };

      const res = await api.orders.create(payload);
      const newOrder = res.order;

      if (paymentMethod === 'ONLINE') {
        // Open payment sandbox simulation modal
        setPendingOrderId(newOrder.id);
        setShowPaymentModal(true);
        setSubmitting(false);
      } else {
        // Cash on Delivery / Pay at counter completes order directly
        clearCart();
        setSubmitting(false);
        onOrderSuccess(newOrder.id);
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  // Simulate Razorpay Sandbox Payment Verification
  const handleVerifySandboxPayment = async () => {
    if (!pendingOrderId) return;
    setPaymentProcessing(true);

    try {
      const mockTxn = `PAY_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await api.payments.verify({
        orderId: pendingOrderId,
        razorpayPaymentId: mockTxn,
        razorpayOrderId: `order_${Math.random().toString(36).substring(2, 8)}`,
        paymentMethod: 'ONLINE_UPI_CARDS',
      });

      clearCart();
      setShowPaymentModal(false);
      setPaymentProcessing(false);
      onOrderSuccess(pendingOrderId);
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      setErrorMessage('Payment simulation failed: ' + (err.message || 'Error'));
      setPaymentProcessing(false);
    }
  };

  if (items.length === 0 && !showPaymentModal) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm mt-2 mb-8 max-w-sm mx-auto">
          Explore our menu and discover appetizing dishes, crispy starters, and chef specialties.
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 transition-all cursor-pointer"
        >
          Browse Digital Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Checkout & Payment</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your items, apply promotional discount coupons, and choose your dining preferences.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Cart Items & Dining Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cart Items Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Cart Items ({items.length})
              </h2>
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map(({ menuItem, quantity }) => (
                <div key={menuItem.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={menuItem.image}
                      alt={menuItem.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-slate-100"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-3 h-3 border flex items-center justify-center shrink-0 ${
                            menuItem.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${
                              menuItem.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {menuItem.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ₹{menuItem.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-slate-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-sm font-extrabold text-slate-900 w-16 text-right">
                      ₹{(menuItem.price * quantity).toFixed(2)}
                    </span>

                    <button
                      onClick={() => removeFromCart(menuItem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dining / Order Type Options */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-500" />
              Dining Preference
            </h2>

            {/* Order Type Tabs */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'DINE_IN', label: 'Dine-In', icon: Utensils, desc: 'Served at Table' },
                { type: 'TAKEAWAY', label: 'Takeaway', icon: Clock, desc: 'Self Pickup' },
                { type: 'DELIVERY', label: 'Delivery', icon: Truck, desc: 'Doorstep Courier' },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = orderType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setOrderType(opt.type as any)}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm font-bold block">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 block">{opt.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic inputs based on order type */}
            {orderType === 'DINE_IN' && (
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                <label className="block text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Select Table Number
                </label>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {availableTables.map((t) => (
                    <option key={t.id} value={t.tableNumber}>
                      Table {t.tableNumber} ({t.capacity} Seats) – {t.location}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Chefs and service staff will plate and deliver this order directly to your table.
                </p>
              </div>
            )}

            {orderType === 'DELIVERY' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Delivery Address & Apartment / Landmark
                </label>
                <textarea
                  rows={2}
                  placeholder="Flat/House no., building, street address, and nearby landmark..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Special Chef Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                Special Preparation Requests (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. less spicy, cutlery please, no onions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Customer Contact Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Customer Contact Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rohan Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Email Address * (For order receipts and live updates)
                </label>
                <input
                  type="email"
                  required
                  placeholder="customer@dinedesk.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Coupon & Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coupon / Offer Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" />
              Apply Promotional Coupon
            </h3>

            {appliedCoupon ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {appliedCoupon.code}
                  </span>
                  <p className="text-xs text-emerald-700 font-semibold mt-1">
                    Saved ₹{appliedCoupon.discountAmount.toFixed(2)} on this order!
                  </p>
                  <p className="text-[11px] text-emerald-600">{appliedCoupon.description}</p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="p-1.5 text-emerald-700 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (WELCOME10, SAVE50)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {applyingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>

                {couponError && (
                  <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}

                {/* Quick Sample Coupon Pills */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    Available Offers (Click to try):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['WELCOME10', 'SAVE50', 'FEAST20'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCouponInput(c);
                          applyCouponCode(c);
                        }}
                        className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-lg border border-amber-200 cursor-pointer"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900">Payment Method</h3>
            <div className="space-y-2">
              <label
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Online Payment (UPI, Cards, NetBanking)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Razorpay Sandbox Test Gateway (Zero real charge)
                    </span>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'ONLINE' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'ONLINE' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod(orderType === 'DELIVERY' ? 'CASH_ON_DELIVERY' : 'PAY_AT_RESTAURANT')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod !== 'ONLINE'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      {orderType === 'DELIVERY' ? 'Cash on Delivery (COD)' : 'Pay at Counter / Table'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Settle your bill after your food is served
                    </span>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod !== 'ONLINE' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod !== 'ONLINE' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </label>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-black tracking-tight">Order Bill Summary</h3>

            <div className="space-y-2.5 text-sm text-slate-300 pb-4 border-b border-slate-800">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Restaurant GST / Tax (5%)</span>
                <span className="font-semibold text-white">₹{taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Packaging & Service Fee</span>
                <span className="text-emerald-400 font-bold">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Grand Total</span>
                <p className="text-2xl font-black text-amber-400">₹{totalAmount.toFixed(2)}</p>
              </div>
              <span className="text-[11px] text-slate-400">Inclusive of all taxes</span>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-60 text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {submitting ? (
                <span>Placing Your Order...</span>
              ) : (
                <>
                  <span>Place Order • ₹{totalAmount.toFixed(2)}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted SSL checkout & verified kitchen routing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Sandbox Test Payment Simulation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                  RZP
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Razorpay Test Gateway</h3>
                  <p className="text-[11px] text-purple-600 font-semibold">Sandbox Simulation Mode</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">Payable Amount</span>
              <p className="text-3xl font-black text-slate-950">₹{totalAmount.toFixed(2)}</p>
              <p className="text-xs text-slate-500">Order ID: #{pendingOrderId}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span className="font-semibold text-slate-900">{customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dining Mode:</span>
                <span className="font-semibold text-slate-900">{orderType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Test Mode:</span>
                <span className="font-semibold text-emerald-600">Instant Verification Ready</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleVerifySandboxPayment}
                disabled={paymentProcessing}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {paymentProcessing ? (
                  <span>Verifying Payment...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Simulate Successful Payment (Test)
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  if (pendingOrderId) onOrderSuccess(pendingOrderId);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Pay at Restaurant Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
