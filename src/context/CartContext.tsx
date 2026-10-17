import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { CartItem, MenuItem } from '../types/index.ts';

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  description: string;
  discountType: string;
  discountValue: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  appliedCoupon: AppliedCoupon | null;
  couponError: string | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dinedesk_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('dinedesk_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [couponError, setCouponError] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('dinedesk_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('dinedesk_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('dinedesk_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (item: MenuItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { menuItem: item, quantity }];
    });
  };

  const removeFromCart = (menuItemId: number) => {
    setItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItem.id === menuItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = Math.round(
    items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0) * 100
  ) / 100;

  // Re-calculate coupon discount if subtotal changes
  let currentDiscount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      currentDiscount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      currentDiscount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }
  const discountAmount = Math.round(currentDiscount * 100) / 100;
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxable * 0.05 * 100) / 100;
  const totalAmount = Math.round((taxable + taxAmount) * 100) / 100;

  const applyCouponCode = async (code: string): Promise<boolean> => {
    setCouponError(null);
    if (!code || !code.trim()) {
      setCouponError('Please enter a coupon code');
      return false;
    }

    if (subtotal <= 0) {
      setCouponError('Add items to cart before applying coupon');
      return false;
    }

    try {
      const res = await api.coupons.apply({
        code: code.trim(),
        subtotal,
      });

      setAppliedCoupon({
        code: res.code,
        discountAmount: res.discountAmount,
        description: res.description,
        discountType: res.discountType,
        discountValue: res.discountValue,
      });
      return true;
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        appliedCoupon,
        couponError,
        applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
