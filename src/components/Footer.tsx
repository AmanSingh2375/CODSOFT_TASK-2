import React from 'react';
import { UtensilsCrossed, Phone, Mail, MapPin, Clock, Heart, Award, ShieldCheck, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div>
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group mb-4 inline-flex"
            >
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Dine<span className="text-amber-500">Desk</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              A modern digital restaurant management platform bridging customer dining, online ordering, live kitchen displays, and table reservations into one unified experience.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Hygienic
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" /> Award Winning
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Explore DineDesk
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Digital Menu & Ordering
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reservations')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Reserve a Dining Table
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('orders')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Live Order Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cart')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Shopping Cart & Offers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('staff')}
                  className="text-amber-400/90 hover:text-amber-300 font-medium transition-colors cursor-pointer"
                >
                  Staff & Kitchen Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Operations */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Opening Hours
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-200 block font-semibold">Lunch Service</span>
                  <span className="text-xs">Monday – Sunday: 12:00 PM – 03:30 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2 pt-2 border-t border-slate-800">
                <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-200 block font-semibold">Dinner Service</span>
                  <span className="text-xs">Monday – Sunday: 06:30 PM – 11:30 PM</span>
                </div>
              </li>
              <li className="pt-2 text-xs text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Late Night Delivery until 01:00 AM
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Contact & Location
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
                <span>42 Heritage Boulevard, Gourmet Street, City Center</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 98765 43210 / 022-45891234</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>support@dinedesk.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DineDesk Restaurant Ordering Platform. College Full Stack Project.</p>
          <p className="flex items-center gap-1">
            Built with React, Express, PostgreSQL & Tailwind CSS <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};
