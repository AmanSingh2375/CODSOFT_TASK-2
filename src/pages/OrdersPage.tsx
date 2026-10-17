import React, { useState, useEffect } from 'react';
import {
  Clock,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Calendar,
  Utensils,
  Truck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Order } from '../types/index.ts';
import { OrderTracker } from '../components/OrderTracker.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface OrdersPageProps {
  onNavigate: (view: string, param?: any) => void;
  activeOrderId?: number | null;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate, activeOrderId }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Email search fallback for guest orders
  const [guestEmail, setGuestEmail] = useState('');

  const loadOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const emailQuery = user?.email || (guestEmail.trim() ? guestEmail.trim() : undefined);
      const fetched = await api.orders.getAll({ email: emailQuery });
      setOrders(fetched);

      // If activeOrderId was passed or there is already a selected order, update it
      const targetId = activeOrderId || selectedOrder?.id;
      if (targetId) {
        const found = fetched.find((o: Order) => o.id === targetId);
        if (found) {
          setSelectedOrder(found);
        } else if (fetched.length > 0 && !selectedOrder) {
          setSelectedOrder(fetched[0]);
        }
      } else if (fetched.length > 0 && !selectedOrder) {
        setSelectedOrder(fetched[0]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadOrders();
  }, [user, activeOrderId]);

  // Polling every 5 seconds for live status updates if there's an ongoing active order
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedOrder && selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED') {
        loadOrders();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedOrder?.id, selectedOrder?.status]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Live Order Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status progression from our kitchen line straight to your table.
          </p>
        </div>

        <button
          onClick={() => loadOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Checking Kitchen...' : 'Refresh Status'}
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            You haven't placed any food orders yet. Browse our menu to satisfy your cravings.
          </p>
          <button
            onClick={() => onNavigate('menu')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Explore Menu & Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual Tracker & Order Details */}
          {selectedOrder && (
            <div className="lg:col-span-8 space-y-6">
              {/* Stepper Component */}
              <OrderTracker
                status={selectedOrder.status}
                orderType={selectedOrder.orderType}
                updatedAt={selectedOrder.updatedAt}
              />

              {/* Order Meta Info Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">
                      Order Reference
                    </span>
                    <h3 className="text-xl font-black text-slate-900">
                      {selectedOrder.orderNumber}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedOrder.status} />
                    <StatusBadge status={selectedOrder.paymentStatus} type="payment" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-semibold">Dining Type</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                      {selectedOrder.orderType === 'DINE_IN'
                        ? `Dine-In (Table ${selectedOrder.tableNumber || 'Assigned'})`
                        : selectedOrder.orderType === 'DELIVERY'
                        ? 'Doorstep Delivery'
                        : 'Takeaway / Self-Pickup'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold">Placed Time</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                      {new Date(selectedOrder.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold">Payment</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Delivery Address if Delivery */}
                {selectedOrder.deliveryAddress && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                    <span className="font-bold block">Delivery Address:</span>
                    <span>{selectedOrder.deliveryAddress}</span>
                  </div>
                )}

                {/* Items Breakdown */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Items Ordered</h4>
                  <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((it) => (
                        <div key={it.id} className="py-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                              {it.quantity}x
                            </span>
                            <span className="font-semibold text-slate-800">{it.name}</span>
                          </div>
                          <span className="font-bold text-slate-900">₹{it.total.toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="py-2 text-xs text-slate-400">Order item details loaded.</p>
                    )}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="space-y-1.5 text-xs text-slate-500 pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">
                      ₹{selectedOrder.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promo Discount ({selectedOrder.couponCode})</span>
                      <span>-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (5% GST)</span>
                    <span className="font-semibold text-slate-800">
                      ₹{selectedOrder.taxAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                    <span>Total Bill</span>
                    <span className="text-amber-600 font-black">
                      ₹{selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Col: Past Orders List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Your Recent Orders</h3>
            <div className="space-y-3">
              {orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-400'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-900">
                        {order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-500 mb-2">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-700">
                        {order.items?.length || 1} items • ₹{order.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        Track <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
