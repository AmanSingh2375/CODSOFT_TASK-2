import React from 'react';
import { Plus, Minus, Star, AlertCircle } from 'lucide-react';
import { MenuItem } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface FoodCardProps {
  item: MenuItem;
  onSelect?: (item: MenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onSelect }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const cartEntry = items.find((i) => i.menuItem.id === item.id);
  const qty = cartEntry ? cartEntry.quantity : 0;

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Image container */}
      <div
        className="relative h-48 w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onSelect && onSelect(item)}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Veg / Non-Veg badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1.5 rounded-md shadow-xs flex items-center justify-center">
          <div
            className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${
              item.isVeg ? 'border-emerald-600' : 'border-rose-600'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </div>
        </div>

        {/* Category tag */}
        {item.categoryName && (
          <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-xs">
            {item.categoryName}
          </span>
        )}

        {/* Rating */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{item.rating || 4.5}</span>
          <span className="text-slate-400 font-normal">({item.ratingCount || 10})</span>
        </div>

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
              <AlertCircle className="w-4 h-4" /> Sold Out Today
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3
            className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
            onClick={() => onSelect && onSelect(item)}
          >
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Price</span>
            <span className="text-lg font-extrabold text-slate-900">
              ₹{item.price.toFixed(2)}
            </span>
          </div>

          <div>
            {!item.isAvailable ? (
              <span className="text-xs font-medium text-slate-400 italic">Unavailable</span>
            ) : qty === 0 ? (
              <button
                type="button"
                onClick={() => addToCart(item, 1)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            ) : (
              <div className="inline-flex items-center bg-amber-50 border border-amber-200 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, qty - 1)}
                  className="w-7 h-7 flex items-center justify-center text-amber-900 hover:bg-amber-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-amber-950">{qty}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, qty + 1)}
                  className="w-7 h-7 flex items-center justify-center text-amber-900 hover:bg-amber-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
