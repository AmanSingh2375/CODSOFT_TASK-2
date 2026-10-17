import React, { useState } from 'react';
import { UtensilsCrossed, Lock, Mail, User as UserIcon, Phone, ArrowRight, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccess: () => void;
  onNavigate: (view: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onSuccess, onNavigate }) => {
  const { login, register, quickLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (role: 'CUSTOMER' | 'STAFF' | 'ADMIN') => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(role);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-amber-200">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLogin ? 'Welcome Back to DineDesk' : 'Create Customer Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {isLogin
              ? 'Sign in to order food, track kitchen tickets, and manage reservations.'
              : 'Join DineDesk to enjoy speedy ordering, offers, and table bookings.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Rohan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="customer@dinedesk.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Password * (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-60 text-white font-black text-sm rounded-xl shadow-md shadow-amber-200 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Account' : 'Register Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {isLogin ? "Don't have an account yet?" : 'Already have an existing account?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="ml-1 text-amber-600 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

        {/* Quick Testing Accounts Section for College Grading */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Shield className="w-4 h-4 text-amber-500" />
            <span>One-Click Test Credentials (Evaluator Demo):</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleTestLogin('CUSTOMER')}
              className="p-2 bg-white hover:bg-amber-50 border border-slate-200 rounded-xl text-center cursor-pointer transition-all"
            >
              <span className="font-bold text-slate-800 block text-[11px]">Customer</span>
              <span className="text-[10px] text-slate-400">Rohan Sharma</span>
            </button>
            <button
              type="button"
              onClick={() => handleTestLogin('STAFF')}
              className="p-2 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-center cursor-pointer transition-all"
            >
              <span className="font-bold text-indigo-700 block text-[11px]">Kitchen/Staff</span>
              <span className="text-[10px] text-slate-400">Chef Amit</span>
            </button>
            <button
              type="button"
              onClick={() => handleTestLogin('ADMIN')}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-center cursor-pointer transition-all"
            >
              <span className="font-bold text-slate-900 block text-[11px]">Admin</span>
              <span className="text-[10px] text-slate-400">Priya Patel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
