import React from 'react';
import { OrderStatus, PaymentStatus, ReservationStatus } from '../types/index.ts';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | ReservationStatus | string;
  type?: 'order' | 'payment' | 'reservation' | 'table';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order', size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      // Order statuses
      case 'ORDER_PLACED':
        return { label: 'Order Placed', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'CONFIRMED':
        return { label: 'Confirmed', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'PREPARING':
        return { label: 'In Kitchen / Preparing', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'READY':
        return { label: 'Ready to Serve', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'SERVED_OUT_FOR_DELIVERY':
        return { label: 'Out for Delivery / Serving', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'COMPLETED':
        return { label: 'Completed', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'CANCELLED':
        return { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200' };

      // Payment statuses
      case 'PAID':
      case 'SUCCESS':
        return { label: 'Paid Online', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PENDING':
        return { label: 'Pending Payment', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'PAY_AT_RESTAURANT':
        return { label: 'Pay at Counter / COD', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'FAILED':
        return { label: 'Payment Failed', bg: 'bg-rose-50 text-rose-700 border-rose-200' };

      // Table statuses
      case 'AVAILABLE':
        return { label: 'Available', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'RESERVED':
        return { label: 'Reserved', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'OCCUPIED':
        return { label: 'Occupied', bg: 'bg-rose-50 text-rose-700 border-rose-200' };

      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const { label, bg } = getBadgeConfig();
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
};
