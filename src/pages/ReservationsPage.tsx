import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Reservation, RestaurantTable } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface ReservationsPageProps {
  onNavigate: (view: string) => void;
}

export const ReservationsPage: React.FC<ReservationsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  // Booking form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState('19:30 - 21:00');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [specialNotes, setSpecialNotes] = useState('');

  // Data state
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timeSlots = [
    '12:00 - 13:30',
    '13:30 - 15:00',
    '18:00 - 19:30',
    '19:30 - 21:00',
    '21:00 - 22:30',
  ];

  // Update profile fields
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Load tables with slot availability for the selected date & timeSlot
  const loadTableAvailability = async () => {
    setLoadingTables(true);
    try {
      const fetched = await api.tables.getAll({ date, timeSlot });
      setTables(fetched);

      // Auto-select first available table with matching capacity
      const firstAvailable = fetched.find(
        (t) => (t.isSlotAvailable !== false) && t.capacity >= guestCount
      );
      if (firstAvailable) {
        setSelectedTableId(firstAvailable.id);
      } else {
        const anyAvail = fetched.find((t) => t.isSlotAvailable !== false);
        setSelectedTableId(anyAvail ? anyAvail.id : null);
      }
    } catch (err) {
      console.error('Failed to load table availability:', err);
    } finally {
      setLoadingTables(false);
    }
  };

  const loadMyReservations = async () => {
    try {
      const email = user?.email;
      const res = await api.reservations.getAll({ email });
      setMyReservations(res);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    }
  };

  useEffect(() => {
    loadTableAvailability();
  }, [date, timeSlot, guestCount]);

  useEffect(() => {
    loadMyReservations();
  }, [user]);

  const handleBookTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedTableId) {
      setErrorMessage('Please select an available dining table from the floor map below.');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMessage('Name, email, and phone number are required to secure your reservation.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.reservations.create({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        tableId: selectedTableId,
        reservationDate: date,
        timeSlot,
        guestCount,
        specialNotes: specialNotes.trim() || null,
      });

      setSuccessMessage('Table successfully booked! Your reservation is confirmed.');
      loadTableAvailability();
      loadMyReservations();
      setSpecialNotes('');
    } catch (err: any) {
      console.error('Booking failed:', err);
      setErrorMessage(err.message || 'Failed to book table. It may have just been booked by another guest.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReservation = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.reservations.updateStatus(id, 'CANCELLED');
      loadMyReservations();
      loadTableAvailability();
    } catch (err: any) {
      alert('Failed to cancel: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full inline-block">
            Guaranteed Seating • Instant Confirmation
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Reserve a Dining Table
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Reserve your preferred dining booth, outdoor garden table, or VIP family room. Our system prevents double-booking so your table is prepared and waiting.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Step-by-step Booking Form */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
          <form onSubmit={handleBookTable} className="space-y-8">
            {/* Step 1: Date & Time Slot */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                Choose Date, Time & Party Size
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Time Slot Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Dining Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Guests / Party
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5 justify-between">
                    <button
                      type="button"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="w-9 h-9 rounded-xl bg-white text-slate-800 font-bold shadow-xs hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm text-slate-900">
                      {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                      className="w-9 h-9 rounded-xl bg-amber-500 text-white font-bold shadow-xs hover:bg-amber-600 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Visual Table Selector Grid */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  Select an Available Table ({date} • {timeSlot})
                </h3>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Click a table to reserve
                </span>
              </div>

              {loadingTables ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {tables.map((tbl) => {
                    const isAvailable = tbl.isSlotAvailable !== false;
                    const isSelected = selectedTableId === tbl.id;
                    const isAdequate = tbl.capacity >= guestCount;

                    return (
                      <div
                        key={tbl.id}
                        onClick={() => isAvailable && setSelectedTableId(tbl.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          !isAvailable
                            ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                            : isSelected
                            ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-300 cursor-pointer'
                            : 'border-slate-200 bg-white hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-black text-slate-900">
                            {tbl.tableNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              !isAvailable
                                ? 'bg-rose-100 text-rose-800'
                                : isSelected
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isAvailable ? 'Free' : 'Booked'}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-700">
                          {tbl.capacity} Seats
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {tbl.location}
                        </p>

                        {!isAdequate && isAvailable && (
                          <span className="text-[10px] text-amber-700 font-bold block mt-1">
                            Smaller table
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Contact & Special Requests */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black">
                  3
                </span>
                Guest Contact & Special Requests
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Your Full Name *
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

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Email Address *
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

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Special Notes / Occasion (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday anniversary dinner, high chair needed, quiet booth..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedTableId}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {submitting ? (
                  <span>Reserving Table...</span>
                ) : (
                  <>
                    <CalendarCheck className="w-5 h-5" />
                    Confirm Table Reservation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: My Reservations History */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-400" />
              My Bookings
            </h3>
            <p className="text-xs text-slate-400">
              Active table reservations tied to your account ({user?.email || 'Guest Session'}).
            </p>

            {myReservations.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No past reservations found. Book a table using the form!
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {myReservations.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-sm">
                        Table {r.tableNumber || 'Assigned'}
                      </span>
                      <StatusBadge status={r.status} size="sm" />
                    </div>

                    <div className="text-slate-300 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{r.reservationDate}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{r.timeSlot}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>{r.guestCount} Guests</span>
                      </p>
                    </div>

                    {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                      <div className="pt-2 border-t border-slate-800 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleCancelReservation(r.id)}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
