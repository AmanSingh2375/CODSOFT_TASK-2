import React, { useState } from 'react';
import { X, Star, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { MenuItem } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ item, onClose }) => {
  const { addToCart, items, updateQuantity } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!item) return null;

  const cartEntry = items.find((i) => i.menuItem.id === item.id);
  const qty = cartEntry ? cartEntry.quantity : 0;

  const handleAdd = () => {
    addToCart(item, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-md backdrop-blur-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 w-full bg-slate-100">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="bg-white/95 backdrop-blur-xs p-1.5 rounded-lg shadow-sm">
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
            {item.categoryName && (
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {item.categoryName}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-black drop-shadow-md">{item.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-current" />
                {item.rating || 4.5}
              </div>
              <span className="text-xs text-white/80">({item.ratingCount || 10} verified reviews)</span>
            </div>
          </div>
        </div>

        {/* Body Details */}
        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {item.description}
          </p>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 mb-6 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Preparation</span>
              <span className="text-slate-800 font-bold mt-0.5 block">15 - 20 mins</span>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-slate-400 block font-medium">Dietary</span>
              <span className="text-slate-800 font-bold mt-0.5 block">
                {item.isVeg ? '100% Vegetarian' : 'Non-Vegetarian'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Chef Pick</span>
              <span className="text-amber-600 font-bold mt-0.5 block flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> Signature
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-slate-400 block">Total Price</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{item.price.toFixed(2)}
              </span>
            </div>

            <div>
              {!item.isAvailable ? (
                <span className="text-rose-600 font-bold text-sm bg-rose-50 px-4 py-2 rounded-xl border border-rose-200">
                  Item Sold Out
                </span>
              ) : qty === 0 ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-2xl shadow-md shadow-amber-200 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-1.5">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, qty - 1)}
                    className="w-9 h-9 flex items-center justify-center bg-white text-amber-900 rounded-xl shadow-xs hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-base font-bold text-amber-950">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, qty + 1)}
                    className="w-9 h-9 flex items-center justify-center bg-amber-500 text-white rounded-xl shadow-xs hover:bg-amber-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
