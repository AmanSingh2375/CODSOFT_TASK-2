import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, ShieldCheck, LogOut, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface ProfilePageProps {
  onNavigate: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Please log in to view your profile</h2>
        <button
          onClick={() => onNavigate('login')}
          className="mt-4 px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Your DineDesk Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details and view your account credentials.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover bg-amber-100 border-2 border-amber-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Contact Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Email Address (Fixed)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Profile Updated
                </>
              ) : (
                'Save Changes'
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </form>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-amber-500 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Track Active Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live status progression & order receipts</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-500" />
        </div>

        <div
          onClick={() => onNavigate('reservations')}
          className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-amber-500 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Table Reservations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage and view your seated table slots</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-500" />
        </div>
      </div>
    </div>
  );
};
