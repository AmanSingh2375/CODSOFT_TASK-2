import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  ShoppingBag,
  CalendarCheck,
  LayoutGrid,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  RefreshCw,
  UtensilsCrossed,
  DollarSign,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';
import { api } from '../services/api.ts';
import {
  Category,
  DashboardStats,
  MenuItem,
  Order,
  OrderStatus,
  Reservation,
  RestaurantTable,
} from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';

interface StaffDashboardPageProps {
  onNavigate: (view: string) => void;
}

export const StaffDashboardPage: React.FC<StaffDashboardPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'kitchen' | 'orders' | 'reservations' | 'menu' | 'tables'>('kitchen');

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menuItemsList, setMenuItemsList] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Menu Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState<number | ''>('');
  const [itemIsVeg, setItemIsVeg] = useState(true);
  const [itemImage, setItemImage] = useState('');

  // Table Modal State
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableNumberInput, setTableNumberInput] = useState('');
  const [tableCapacityInput, setTableCapacityInput] = useState(4);
  const [tableLocationInput, setTableLocationInput] = useState('Main Dining Hall');

  const loadData = async () => {
    try {
      const [fetchedStats, fetchedOrders, fetchedReservations, fetchedMenu, fetchedCats, fetchedTables] =
        await Promise.all([
          api.dashboard.getStats().catch(() => null),
          api.orders.getAll(),
          api.reservations.getAll(),
          api.menu.getItems(),
          api.menu.getCategories(),
          api.tables.getAll(),
        ]);

      if (fetchedStats) setStats(fetchedStats);
      setOrders(fetchedOrders);
      setReservations(fetchedReservations);
      setMenuItemsList(fetchedMenu);
      setCategories(fetchedCats);
      setTables(fetchedTables);
    } catch (err) {
      console.error('Failed to load staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh kitchen orders every 6 seconds
    const interval = setInterval(() => {
      loadData();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Update order status directly from Kitchen or Order Management
  const handleUpdateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await api.orders.updateStatus(orderId, { status: newStatus });
      await loadData();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Update reservation status
  const handleUpdateReservation = async (resId: number, status: string) => {
    try {
      await api.reservations.updateStatus(resId, status);
      await loadData();
    } catch (err: any) {
      alert('Failed to update reservation: ' + err.message);
    }
  };

  // Toggle item availability
  const handleToggleItemAvailability = async (item: MenuItem) => {
    try {
      await api.menu.updateItem(item.id, { isAvailable: !item.isAvailable });
      loadData();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  // Delete item
  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.menu.deleteItem(id);
      loadData();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  // Save / Add menu item
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: itemName.trim(),
        description: itemDescription.trim(),
        price: parseFloat(itemPrice),
        categoryId: itemCategory ? Number(itemCategory) : null,
        isVeg: itemIsVeg,
        image: itemImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      };

      if (editingItem) {
        await api.menu.updateItem(editingItem.id, payload);
      } else {
        await api.menu.createItem(payload);
      }

      setShowItemModal(false);
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      alert('Failed to save menu item: ' + err.message);
    }
  };

  // Create table
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.tables.create({
        tableNumber: tableNumberInput.trim(),
        capacity: tableCapacityInput,
        location: tableLocationInput.trim(),
      });
      setShowTableModal(false);
      setTableNumberInput('');
      loadData();
    } catch (err: any) {
      alert('Failed to add table: ' + err.message);
    }
  };

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemCategory(categories[0]?.id || '');
    setItemIsVeg(true);
    setItemImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setShowItemModal(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price.toString());
    setItemCategory(item.categoryId || '');
    setItemIsVeg(item.isVeg);
    setItemImage(item.image);
    setShowItemModal(true);
  };

  // Filter kitchen active orders: ORDER_PLACED, CONFIRMED, PREPARING, READY
  const kitchenOrders = orders.filter(
    (o) =>
      o.status === 'ORDER_PLACED' ||
      o.status === 'CONFIRMED' ||
      o.status === 'PREPARING' ||
      o.status === 'READY'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Restaurant Staff & Kitchen Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Live orders dispatch, kitchen ticket flow, table seatings & menu catalog control.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Live Data
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-semibold block">Total Orders</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {stats?.totalOrders || orders.length}
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <span className="text-xs text-amber-700 font-bold block">In Kitchen / Preparing</span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">
            {stats?.preparingOrders || orders.filter((o) => o.status === 'PREPARING').length}
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <span className="text-xs text-emerald-700 font-bold block">Ready for Pass</span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">
            {stats?.readyOrders || orders.filter((o) => o.status === 'READY').length}
          </span>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
          <span className="text-xs text-indigo-700 font-bold block">Today's Sales</span>
          <span className="text-2xl font-black text-indigo-900 mt-1 block">
            ₹{stats?.todaySales?.toFixed(0) || '0'}
          </span>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <span className="text-xs text-purple-700 font-bold block">Today's Bookings</span>
          <span className="text-2xl font-black text-purple-900 mt-1 block">
            {stats?.todayReservations || 0}
          </span>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-semibold block">Available Tables</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {tables.filter((t) => t.status === 'AVAILABLE').length} / {tables.length}
          </span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { key: 'kitchen', label: '🍳 Kitchen Live KDS', count: kitchenOrders.length },
          { key: 'orders', label: '📋 Order Management', count: orders.length },
          { key: 'reservations', label: '🍽️ Reservations', count: reservations.length },
          { key: 'menu', label: '🍲 Menu Catalog', count: menuItemsList.length },
          { key: 'tables', label: '🪑 Floor & Tables', count: tables.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: Kitchen Live KDS (Incoming active orders) */}
      {activeTab === 'kitchen' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Active Kitchen Tickets</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </h2>
            <span className="text-xs text-slate-500">Sorted newest first</span>
          </div>

          {kitchenOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-md mx-auto">
              <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-lg">All Kitchen Tickets Cleared!</h3>
              <p className="text-xs text-slate-500 mt-1">
                No orders waiting in line. New incoming orders will pop up here in real time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kitchenOrders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white border-2 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between ${
                    order.status === 'PREPARING'
                      ? 'border-amber-400 bg-amber-50/20'
                      : order.status === 'READY'
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                      <span className="font-bold text-slate-800">
                        {order.orderType === 'DINE_IN'
                          ? `Table: ${order.tableNumber || 'Assigned'}`
                          : order.orderType}
                      </span>
                      <span className="text-slate-500 font-semibold">{order.customerName}</span>
                    </div>

                    {order.notes && (
                      <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-950 font-bold">
                        ⚠️ Note: {order.notes}
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        Food Items:
                      </span>
                      {order.items?.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-50 font-semibold text-slate-800"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center font-black text-[10px]">
                              {it.quantity}x
                            </span>
                            <span>{it.name}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kitchen Action Transitions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {order.status === 'ORDER_PLACED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                          disabled={updatingId === order.id}
                          className="col-span-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                        >
                          Accept & Confirm Order
                        </button>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                          disabled={updatingId === order.id}
                          className="col-span-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                        >
                          Start Cooking / Preparing
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                          disabled={updatingId === order.id}
                          className="col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                        >
                          Mark Food Ready for Serving
                        </button>
                      )}

                      {order.status === 'READY' && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              order.id,
                              order.orderType === 'DELIVERY' ? 'SERVED_OUT_FOR_DELIVERY' : 'COMPLETED'
                            )
                          }
                          disabled={updatingId === order.id}
                          className="col-span-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                        >
                          {order.orderType === 'DELIVERY'
                            ? 'Dispatch to Delivery Driver'
                            : 'Mark Served / Completed'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Order Management (Full list & table) */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">All Restaurant Orders</h2>
            <span className="text-xs text-slate-500">{orders.length} total records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Type / Table</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Quick Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-black text-slate-900">{o.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{o.customerName}</span>
                      <span className="text-[11px] text-slate-400">{o.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {o.orderType} {o.tableNumber ? `(${o.tableNumber})` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ') || '1 dish'}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ₹{o.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={o.paymentStatus} type="payment" size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={o.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                        className="bg-slate-100 border border-slate-200 rounded-lg p-1 font-semibold text-slate-700 cursor-pointer text-xs"
                      >
                        <option value="ORDER_PLACED">Order Placed</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY">Ready</option>
                        <option value="SERVED_OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Reservation Management */}
      {activeTab === 'reservations' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Table Reservations</h2>
            <span className="text-xs text-slate-500">{reservations.length} bookings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Table</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Party</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Special Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      Table {r.tableNumber || 'Assigned'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <div>{r.reservationDate}</div>
                      <span className="text-slate-400 text-[11px]">{r.timeSlot}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{r.customerName}</td>
                    <td className="py-3.5 px-4 font-semibold">{r.guestCount} Guests</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{r.customerPhone}</div>
                      <span className="text-[11px] text-slate-400">{r.customerEmail}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 italic">
                      {r.specialNotes || 'Standard seating'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} type="reservation" size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {r.status !== 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateReservation(r.id, 'CONFIRMED')}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-md hover:bg-emerald-100"
                          >
                            Confirm
                          </button>
                        )}
                        {r.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateReservation(r.id, 'COMPLETED')}
                            className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded-md hover:bg-blue-100"
                          >
                            Complete
                          </button>
                        )}
                        {r.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleUpdateReservation(r.id, 'CANCELLED')}
                            className="px-2 py-1 bg-rose-50 text-rose-700 font-bold rounded-md hover:bg-rose-100"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Menu Management */}
      {activeTab === 'menu' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Food Menu Management</h2>
              <p className="text-xs text-slate-500">
                Add, edit prices, update descriptions, and toggle sold-out availability in real time.
              </p>
            </div>
            <button
              onClick={openAddItemModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Food Item
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItemsList.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-2xl p-4 flex gap-4 hover:shadow-sm transition-all"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                    <span className="text-xs font-black text-slate-900">₹{item.price}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleItemAvailability(item)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700'
                          : 'bg-rose-50 text-rose-700 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {item.isAvailable ? '✓ In Stock' : '✕ Out of Stock'}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditItemModal(item)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Table Management */}
      {activeTab === 'tables' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Restaurant Floor & Tables</h2>
              <p className="text-xs text-slate-500">Configure dining capacities and locations.</p>
            </div>
            <button
              onClick={() => setShowTableModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Table
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tables.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">{t.tableNumber}</span>
                  <StatusBadge status={t.status} type="table" size="sm" />
                </div>
                <p className="text-xs font-semibold text-slate-700">{t.capacity} Person Seating</p>
                <p className="text-[11px] text-slate-400">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Menu Item */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              {editingItem ? 'Edit Menu Item' : 'Add New Food Item'}
            </h3>

            <form onSubmit={handleSaveMenuItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Saffron Dumpling Delight"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Detailed description, spices, and ingredients..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="290"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vegCheck"
                  checked={itemIsVeg}
                  onChange={(e) => setItemIsVeg(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <label htmlFor="vegCheck" className="font-bold text-slate-700">
                  Vegetarian Dish
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Table */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Add Dining Table</h3>

            <form onSubmit={handleCreateTable} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Table Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-09"
                  value={tableNumberInput}
                  onChange={(e) => setTableNumberInput(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Capacity (Seats)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={tableCapacityInput}
                  onChange={(e) => setTableCapacityInput(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dining Location</label>
                <select
                  value={tableLocationInput}
                  onChange={(e) => setTableLocationInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                >
                  <option value="Main Dining Hall">Main Dining Hall</option>
                  <option value="Window Booth">Window Booth</option>
                  <option value="Outdoor Garden Terrace">Outdoor Garden Terrace</option>
                  <option value="VIP Executive Room">VIP Executive Room</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
