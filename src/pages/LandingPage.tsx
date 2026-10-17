import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  ArrowRight,
  CalendarCheck,
  ShoppingBag,
  CreditCard,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight,
  Flame,
  Star,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { MenuItem } from '../types/index.ts';
import { FoodCard } from '../components/FoodCard.tsx';

interface LandingPageProps {
  onNavigate: (view: string, param?: any) => void;
  onSelectDish: (dish: MenuItem) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectDish }) => {
  const [featuredDishes, setFeaturedDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const items = await api.menu.getItems({ sortBy: 'rating' });
        // Pick top 4 signature dishes
        setFeaturedDishes(items.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured dishes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const features = [
    {
      title: 'Digital Menu',
      description: 'Explore our multi-category menu with real-time dietary filters, ratings, and allergen tags.',
      icon: UtensilsCrossed,
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      title: 'Online Ordering',
      description: 'Effortless Dine-In, Takeaway, and Home Delivery orders with custom notes and live cart updates.',
      icon: ShoppingBag,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Table Reservation',
      description: 'Instant table booking with conflict prevention, time slots, guest counts, and special booth requests.',
      icon: CalendarCheck,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Secure Payments',
      description: 'Integrated test sandbox for Razorpay online payments alongside cash on delivery & counter payment.',
      icon: CreditCard,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: 'Live Order Tracking',
      description: 'Real-time kitchen status progression from Placed to Preparing, Ready, Out for Delivery, and Served.',
      icon: Clock,
      color: 'bg-rose-500/10 text-rose-600',
    },
  ];

  return (
    <div className="space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 to-white pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200/80 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Next-Gen Dining Experience & Kitchen Operations</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                Culinary Perfection, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700">
                  Seamlessly Served.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Welcome to <strong>DineDesk</strong>, where gourmet handcrafted meals meet modern digital convenience. Browse our interactive digital menu, book dining tables with zero wait times, and track your kitchen orders in real time.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('menu')}
                  className="px-7 py-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-amber-500/25 flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Order Food Now
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('reservations')}
                  className="px-7 py-4 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-bold text-base rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5 text-amber-600" />
                  Reserve a Table
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/70 max-w-lg text-slate-700">
                <div>
                  <span className="text-2xl font-black text-slate-950 block">4.9 ★</span>
                  <span className="text-xs text-slate-500">Over 5,000+ happy diners</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-950 block">20 min</span>
                  <span className="text-xs text-slate-500">Average prep & serve time</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-950 block">100%</span>
                  <span className="text-xs text-slate-500">Farm fresh ingredients</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Imagery Composite */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Background Glow */}
                <div className="absolute -inset-4 bg-amber-400/20 rounded-3xl blur-2xl -z-10" />

                {/* Main Hero Restaurant Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 sm:aspect-square">
                  <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                    alt="DineDesk Restaurant Interior"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Signature Dining
                    </span>
                    <h3 className="text-xl font-bold mt-2">DineDesk Main Hall & Garden Patio</h3>
                    <p className="text-xs text-slate-200 mt-0.5">Atmospheric dining with open-flame kitchen view</p>
                  </div>
                </div>

                {/* Floating Dish Badge */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-3 shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce duration-1000 hidden sm:flex">
                  <img
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80"
                    alt="Cheeseburger"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Truffle Cheeseburger</span>
                    <span className="text-xs text-amber-600 font-extrabold">Chef’s Recommendation</span>
                  </div>
                </div>

                {/* Floating Reservation Badge */}
                <div className="absolute -bottom-6 -right-6 bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex items-center gap-3 hidden sm:flex">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">Instant Seating</span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Tables Available Tonight
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Restaurant Platform Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Integrated Restaurant Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            Engineered for Diners and Kitchen Staff
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3">
            Every component of DineDesk is designed to eliminate friction, whether you are picking appetizers from home or coordinating table orders on the kitchen line.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured & Popular Dishes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 tracking-wider uppercase mb-1">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Chef's Specialties</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Customer Favorites
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Hand-picked bestsellers prepared fresh to order with house-ground spices.
            </p>
          </div>

          <button
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer group"
          >
            Browse Full Menu ({loading ? '...' : '6 Categories'})
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDishes.map((dish) => (
              <FoodCard key={dish.id} item={dish} onSelect={onSelectDish} />
            ))}
          </div>
        )}
      </section>

      {/* 4. About DineDesk Section */}
      <section className="bg-slate-900 text-white rounded-3xl max-w-7xl mx-auto overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 space-y-6">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">
              The DineDesk Story
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Honest Craft, Fresh Produce, & Heartfelt Hospitality.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Founded with the vision to modernize neighborhood dining, DineDesk pairs time-honored artisanal recipes with state-of-the-art kitchen workflow automation. From 24-hour slow simmered lentils to wood-fired hand-tossed sourdough crusts, we never cut corners on flavor.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Farm Sourcing</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Vegetables and herbs harvested daily from local growers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Master Chefs</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Led by executive culinary artists with over 15+ years experience.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('reservations')}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20"
              >
                Experience DineDesk In-Person
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 h-full min-h-[360px] relative">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
              alt="Chefs plating gourmet dishes"
              className="w-full h-full object-cover min-h-[360px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent lg:block hidden" />
          </div>
        </div>
      </section>

      {/* 5. Contact & Booking CTA Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-8 sm:p-14 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-left">
            <h3 className="text-2xl sm:text-3xl font-black">
              Planning a Celebration or Family Dinner?
            </h3>
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
              Reserve our private booths or outdoor terrace online. Enjoy instant seating with no phone hold times.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <button
              onClick={() => onNavigate('reservations')}
              className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              Book a Table Online
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="px-6 py-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white font-bold rounded-2xl transition-all cursor-pointer"
            >
              Order Takeaway / Delivery
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
