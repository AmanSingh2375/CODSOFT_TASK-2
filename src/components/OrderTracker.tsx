import React from 'react';
import { CheckCircle2, Clock, ChefHat, BellRing, Sparkles, XCircle, Truck } from 'lucide-react';
import { OrderStatus, OrderType } from '../types/index.ts';

interface OrderTrackerProps {
  status: OrderStatus;
  orderType?: OrderType;
  updatedAt?: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ status, orderType = 'DINE_IN', updatedAt }) => {
  const steps: Array<{
    key: OrderStatus;
    title: string;
    description: string;
    icon: React.ElementType;
  }> = [
    {
      key: 'ORDER_PLACED',
      title: 'Order Placed',
      description: 'Received by DineDesk',
      icon: Clock,
    },
    {
      key: 'CONFIRMED',
      title: 'Confirmed',
      description: 'Accepted by manager',
      icon: CheckCircle2,
    },
    {
      key: 'PREPARING',
      title: 'Preparing',
      description: 'Chefs are cooking fresh',
      icon: ChefHat,
    },
    {
      key: 'READY',
      title: 'Ready',
      description: orderType === 'DELIVERY' ? 'Packed for driver' : 'Hot & plated at pass',
      icon: BellRing,
    },
    {
      key: 'SERVED_OUT_FOR_DELIVERY',
      title: orderType === 'DELIVERY' ? 'Out for Delivery' : 'Serving',
      description: orderType === 'DELIVERY' ? 'On its way to your door' : 'Dispatched to table',
      icon: Truck,
    },
    {
      key: 'COMPLETED',
      title: 'Completed',
      description: 'Bon Appétit! Enjoy your meal',
      icon: Sparkles,
    },
  ];

  if (status === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <XCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-rose-900">Order Has Been Cancelled</h3>
        <p className="text-sm text-rose-700 mt-1 max-w-md mx-auto">
          This order was cancelled. Any online payment has been initiated for an automatic refund within 3-5 business days.
        </p>
      </div>
    );
  }

  // Determine active step index
  const statusHierarchy: Record<OrderStatus, number> = {
    ORDER_PLACED: 0,
    CONFIRMED: 1,
    PREPARING: 2,
    READY: 3,
    SERVED_OUT_FOR_DELIVERY: 4,
    COMPLETED: 5,
    CANCELLED: -1,
  };

  const currentIdx = statusHierarchy[status] ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-2">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Live Kitchen Tracking
          </span>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            {steps[currentIdx]?.title || 'Processing'}
            <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          </h3>
        </div>
        {updatedAt && (
          <p className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            Last update: {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Steps visualization */}
      <div className="relative">
        {/* Progress line */}
        <div className="hidden md:block absolute top-6 left-8 right-8 h-1 bg-slate-100 -z-0">
          <div
            className="h-full bg-amber-500 transition-all duration-700 ease-out"
            style={{
              width: `${(currentIdx / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-2 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isUpcoming = idx > currentIdx;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`flex md:flex-col items-center md:text-center gap-4 md:gap-3 transition-opacity ${
                  isUpcoming ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? 'bg-amber-500 text-white shadow-amber-200'
                      : isCurrent
                      ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-amber-300 scale-110'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="text-left md:text-center">
                  <h4
                    className={`text-sm font-bold ${
                      isCurrent ? 'text-amber-900' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
