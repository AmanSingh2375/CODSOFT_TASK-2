import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  CalendarCheck,
  Clock,
  User,
  LogOut,
  LayoutDashboard,
  ChefHat,
  ShieldAlert,
  Menu as MenuIcon,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout, quickLogin } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { key: 'home', label: 'Home' },
    { key: 'menu', label: 'Menu' },
    { key: 'reservations', label: 'Book a Table' },
    { key: 'orders', label: 'My Orders & Tracking' },
  ];

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      {/* Top Testing Credentials Helper Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white">Full-Stack Demo:</span>
            <span className="text-slate-300 hidden sm:inline">PostgreSQL + Express + JWT Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">Quick Test Switcher:</span>
            <button
              onClick={() => quickLogin('CUSTOMER')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                user?.role === 'CUSTOMER'
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => quickLogin('STAFF')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                user?.role === 'STAFF'
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Kitchen/Staff
            </button>
            <button
              onClick={() => quickLogin('ADMIN')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                user?.role === 'ADMIN'
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-amber-200 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                  Dine<span className="text-amber-500">Desk</span>
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                Restaurant & Kitchen
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Role specific quick tabs */}
            {user?.role === 'STAFF' && (
              <button
                onClick={() => handleNav('staff')}
                className={`px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentView === 'staff'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <ChefHat className="w-4 h-4" /> Staff Portal
              </button>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => handleNav('admin')}
                className={`px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Admin Portal
              </button>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => handleNav('cart')}
              className="relative p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl transition-all cursor-pointer border border-amber-200/60"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover bg-amber-100"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                    <span className="text-[10px] font-semibold text-amber-600 leading-none">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in-50 slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav('profile')}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Profile & Account
                    </button>

                    <button
                      onClick={() => handleNav('orders')}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-slate-400" /> Order History & Tracking
                    </button>

                    <button
                      onClick={() => handleNav('reservations')}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <CalendarCheck className="w-4 h-4 text-slate-400" /> My Table Bookings
                    </button>

                    {user.role === 'STAFF' && (
                      <button
                        onClick={() => handleNav('staff')}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer"
                      >
                        <ChefHat className="w-4 h-4" /> Staff / Kitchen Portal
                      </button>
                    )}

                    {user.role === 'ADMIN' && (
                      <>
                        <button
                          onClick={() => handleNav('staff')}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ChefHat className="w-4 h-4" /> Staff / Kitchen Portal
                        </button>
                        <button
                          onClick={() => handleNav('admin')}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin Management
                        </button>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-2 animate-in fade-in-50">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  currentView === item.key ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
            {user?.role === 'STAFF' && (
              <button
                onClick={() => handleNav('staff')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-indigo-50 text-indigo-700"
              >
                Staff Portal
              </button>
            )}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => handleNav('admin')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-900"
              >
                Admin Portal
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
