import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { CartCheckoutPage } from './pages/CartCheckoutPage.tsx';
import { OrdersPage } from './pages/OrdersPage.tsx';
import { ReservationsPage } from './pages/ReservationsPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { StaffDashboardPage } from './pages/StaffDashboardPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { MenuItem } from './types/index.ts';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const { user, quickLogin } = useAuth();

  const handleNavigate = (view: string, param?: any) => {
    if (view === 'orders' && typeof param === 'number') {
      setActiveOrderId(param);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderId: number) => {
    setActiveOrderId(orderId);
    setCurrentView('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* Global Navigation Header */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectDish={(dish) => setSelectedDish(dish)}
          />
        )}

        {currentView === 'menu' && (
          <MenuPage
            onNavigate={handleNavigate}
            selectedDish={selectedDish}
            onSelectDish={setSelectedDish}
          />
        )}

        {currentView === 'cart' && (
          <CartCheckoutPage
            onNavigate={handleNavigate}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentView === 'orders' && (
          <OrdersPage onNavigate={handleNavigate} activeOrderId={activeOrderId} />
        )}

        {currentView === 'reservations' && (
          <ReservationsPage onNavigate={handleNavigate} />
        )}

        {currentView === 'login' && (
          <AuthPage
            initialMode="login"
            onSuccess={() => handleNavigate('menu')}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'register' && (
          <AuthPage
            initialMode="register"
            onSuccess={() => handleNavigate('menu')}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'profile' && <ProfilePage onNavigate={handleNavigate} />}

        {currentView === 'staff' && (
          <>
            {user?.role === 'STAFF' || user?.role === 'ADMIN' ? (
              <StaffDashboardPage onNavigate={handleNavigate} />
            ) : (
              <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
                  🛡️
                </div>
                <h2 className="text-xl font-black text-slate-900">Staff Access Required</h2>
                <p className="text-sm text-slate-600">
                  This portal is reserved for kitchen cooks, managers, and service staff.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => quickLogin('STAFF')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                  >
                    Switch to Staff Demo Account (Chef Amit)
                  </button>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {currentView === 'admin' && (
          <>
            {user?.role === 'ADMIN' ? (
              <AdminDashboardPage onNavigate={handleNavigate} />
            ) : (
              <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-900 text-amber-500 rounded-3xl flex items-center justify-center mx-auto text-2xl">
                  🔒
                </div>
                <h2 className="text-xl font-black text-slate-900">Administrator Access Required</h2>
                <p className="text-sm text-slate-600">
                  Full administrative permissions are needed to inspect revenue analytics and alter roles.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => quickLogin('ADMIN')}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                  >
                    Switch to Admin Demo Account (Priya Patel)
                  </button>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
