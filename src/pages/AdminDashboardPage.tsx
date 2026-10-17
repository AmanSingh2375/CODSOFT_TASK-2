import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ShoppingBag,
  CalendarCheck,
  Tag,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  RefreshCw,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Coupon, DashboardStats, User } from '../types/index.ts';

interface AdminDashboardPageProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'coupons'>('analytics');

  // Coupon form modal state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDescription, setCouponDescription] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [couponDiscountValue, setCouponDiscountValue] = useState('');
  const [couponMinOrder, setCouponMinOrder] = useState('');
  const [couponMaxDiscount, setCouponMaxDiscount] = useState('');

  const loadAdminData = async () => {
    try {
      const [fetchedStats, fetchedUsers, fetchedCoupons] = await Promise.all([
        api.dashboard.getStats(),
        api.dashboard.getUsers(),
        api.coupons.getAll(),
      ]);
      setStats(fetchedStats);
      setUsersList(fetchedUsers);
      setCouponsList(fetchedCoupons);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await api.dashboard.updateUserRole(userId, newRole);
      loadAdminData();
    } catch (err: any) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const handleToggleCoupon = async (c: Coupon) => {
    try {
      await api.coupons.update(c.id, { isActive: !c.isActive });
      loadAdminData();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.coupons.delete(id);
      loadAdminData();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.coupons.create({
        code: couponCode.trim().toUpperCase(),
        description: couponDescription.trim(),
        discountType: couponDiscountType,
        discountValue: parseFloat(couponDiscountValue),
        minOrderAmount: couponMinOrder ? parseFloat(couponMinOrder) : 0,
        maxDiscountAmount: couponMaxDiscount ? parseFloat(couponMaxDiscount) : null,
      });

      setShowCouponModal(false);
      setCouponCode('');
      setCouponDescription('');
      setCouponDiscountValue('');
      setCouponMinOrder('');
      setCouponMaxDiscount('');
      loadAdminData();
    } catch (err: any) {
      alert('Failed to create coupon: ' + err.message);
    }
  };

  // Find max daily order for chart scaling
  const maxOrdersCount = Math.max(...(stats?.dailyTrend?.map((d) => d.orders) || [1]), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-500 flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Admin & Business Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Revenue figures, user permissions, coupon management, and popular dish rankings.
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            ₹{stats?.totalRevenue?.toLocaleString('en-IN') || '0'}
          </p>
          <span className="text-xs text-emerald-600 font-semibold block">
            ₹{stats?.todaySales?.toFixed(0) || '0'} generated today
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalOrders || 0}</p>
          <span className="text-xs text-slate-500 font-medium block">
            {stats?.completedOrders || 0} successfully completed
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Reservations</span>
            <CalendarCheck className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalReservations || 0}</p>
          <span className="text-xs text-blue-600 font-semibold block">
            {stats?.todayReservations || 0} dining slots today
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{usersList.length}</p>
          <span className="text-xs text-purple-600 font-semibold block">
            Customers, staff & managers
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          📈 Performance & Charts
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          👥 User Role Management ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          🏷️ Promotional Coupons ({couponsList.length})
        </button>
      </div>

      {/* TAB 1: Analytics & Charts */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Daily Order Activity Bar Chart */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Weekly Order Volume</h3>
                <p className="text-xs text-slate-500">Daily completed and incoming dining tickets</p>
              </div>
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>

            {/* Custom Bar Chart Visualization */}
            <div className="pt-4">
              <div className="h-52 flex items-end gap-3 justify-between pb-3 border-b border-slate-100">
                {stats?.dailyTrend?.map((day, idx) => {
                  const heightPercent = Math.max(12, (day.orders / maxOrdersCount) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.orders}
                      </span>
                      <div className="w-full bg-slate-100 rounded-xl h-full flex items-end overflow-hidden p-1">
                        <div
                          className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-lg transition-all duration-500 group-hover:brightness-110"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold truncate w-full text-center">
                        {day.date.split(',')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Last 7 consecutive operating days
              </p>
            </div>
          </div>

          {/* Popular Food Items Leaderboard */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Top 5 Bestselling Dishes</h3>
                <p className="text-xs text-slate-500">Most ordered recipes by unit volume</p>
              </div>
              <Award className="w-5 h-5 text-amber-500" />
            </div>

            <div className="space-y-4">
              {stats?.popularDishes && stats.popularDishes.length > 0 ? (
                stats.popularDishes.map((dish, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-black text-[10px]">
                          #{idx + 1}
                        </span>
                        {dish.name}
                      </span>
                      <span className="font-extrabold text-slate-900">
                        {dish.count} ordered (₹{dish.revenue.toFixed(0)})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(15, (dish.count / (stats.popularDishes[0]?.count || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Order items will automatically build this leaderboard as customers place orders.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: User Role Management */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registered Accounts</h2>
              <p className="text-xs text-slate-500">
                Grant kitchen staff access, promote administrators, or review customer accounts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-8 h-8 rounded-xl object-cover bg-amber-100"
                      />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{u.email}</td>
                    <td className="py-3.5 px-4 text-slate-500">{u.phone || '–'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          u.role === 'ADMIN'
                            ? 'bg-slate-900 text-white'
                            : u.role === 'STAFF'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800 cursor-pointer"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="STAFF">STAFF (Kitchen)</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Coupon Management */}
      {activeTab === 'coupons' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Discount Coupons & Offers</h2>
              <p className="text-xs text-slate-500">
                Create promotional discount codes for customer checkout.
              </p>
            </div>
            <button
              onClick={() => setShowCouponModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {couponsList.map((cp) => (
              <div
                key={cp.id}
                className="border border-slate-200 rounded-2xl p-5 space-y-3 relative hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {cp.code}
                  </span>
                  <button
                    onClick={() => handleToggleCoupon(cp)}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                      cp.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {cp.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{cp.description}</p>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="font-bold text-slate-800">
                      {cp.discountType === 'PERCENTAGE'
                        ? `${cp.discountValue}% Off`
                        : `₹${cp.discountValue} Flat Off`}
                    </span>
                  </div>
                  {cp.minOrderAmount ? (
                    <div className="flex justify-between">
                      <span>Min Order:</span>
                      <span className="font-bold text-slate-800">₹{cp.minOrderAmount}</span>
                    </div>
                  ) : null}
                  {cp.maxDiscountAmount ? (
                    <div className="flex justify-between">
                      <span>Max Discount Cap:</span>
                      <span className="font-bold text-slate-800">₹{cp.maxDiscountAmount}</span>
                    </div>
                  ) : null}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleDeleteCoupon(cp.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Coupon */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Create Promotional Coupon</h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE30"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="30% discount on celebration feast orders"
                  value={couponDescription}
                  onChange={(e) => setCouponDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={couponDiscountType}
                    onChange={(e) => setCouponDiscountType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="20"
                    value={couponDiscountValue}
                    onChange={(e) => setCouponDiscountValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="300"
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={couponMaxDiscount}
                    onChange={(e) => setCouponMaxDiscount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
