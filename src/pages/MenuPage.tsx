import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Utensils,
  Leaf,
  Layers,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Category, MenuItem } from '../types/index.ts';
import { FoodCard } from '../components/FoodCard.tsx';
import { FoodDetailModal } from '../components/FoodDetailModal.tsx';
import { useCart } from '../context/CartContext.tsx';

interface MenuPageProps {
  onNavigate: (view: string) => void;
  selectedDish: MenuItem | null;
  onSelectDish: (dish: MenuItem | null) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onNavigate, selectedDish, onSelectDish }) => {
  const { itemCount, totalAmount } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('rating');

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.menu.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadMenu() {
      setLoading(true);
      try {
        const fetched = await api.menu.getItems({
          search: search || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          isVeg: vegOnly ? 'true' : undefined,
          sortBy,
        });
        setItems(fetched);
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadMenu();
    }, 200);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, vegOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full inline-block">
            Freshly Prepared Everyday
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Our Digital Menu
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Authentic culinary creations crafted from natural, locally-sourced ingredients. Select your favorites, customize spice levels, and order directly for Dine-In, Takeaway, or Delivery.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:flex items-center justify-center">
          <Utensils className="w-80 h-80" />
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes, ingredients, starters, pizza..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Veg Only Toggle */}
          <div className="md:col-span-3 flex items-center">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                vegOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${
                  vegOnly ? 'border-emerald-600' : 'border-slate-400'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    vegOnly ? 'bg-emerald-600' : 'bg-transparent'
                  }`}
                />
              </div>
              <span>Pure Veg Only</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3 relative">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent py-1.5 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="rating">Top Rated First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Alphabetical (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-84 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No food items found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            We couldn't find dishes matching your active filters or search terms.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setVegOnly(false);
              setSortBy('rating');
            }}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((dish) => (
            <FoodCard key={dish.id} item={dish} onSelect={onSelectDish} />
          ))}
        </div>
      )}

      {/* Food Details Modal */}
      {selectedDish && (
        <FoodDetailModal item={selectedDish} onClose={() => onSelectDish(null)} />
      )}

      {/* Floating Bottom Cart Bar (if items in cart) */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40 max-w-2xl mx-auto animate-in slide-in-from-bottom-5">
          <div className="bg-slate-950 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950">
                {itemCount}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">{itemCount} items in cart</p>
                <p className="text-base font-black text-white">₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('cart')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              View Cart & Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
