"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronRight, Package, CheckCircle, RefreshCw, XCircle, Loader2, Truck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartService, Order } from '@/app/services/cartService';

// --- Helper to get Status Icon ---
const getStatusInfo = (status: string) => {
    switch(status) {
        case 'pending':
        case 'confirmed':
        case 'preparing':
        case 'ready':
            return { icon: Package, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', animate: false, label: 'Processing' };
        case 'shipped':
            return { icon: Truck, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', animate: true, label: 'On the way' };
        case 'delivered':
            return { icon: CheckCircle, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', animate: false, label: 'Delivered' };
        case 'cancelled':
            return { icon: XCircle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', animate: false, label: 'Cancelled' };
        default:
            return { icon: Package, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', animate: false, label: status };
    }
};

// --- Order Card Sub-Component ---
const OrderCard = ({ order }: { order: Order }) => {
  const router = useRouter();
  const isLive = !['delivered', 'cancelled'].includes(order.status);

  const handleCardClick = () => {
    if (isLive) {
      router.push(`/orders/track-order?id=${order.id}`);
    } else {
      router.push(`/orders/${order.id}`);
    }
  };
  
  const statusInfo = getStatusInfo(order.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between pb-3 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${statusInfo.color} flex items-center justify-center shrink-0`}>
            <statusInfo.icon className={`w-6 h-6 ${statusInfo.animate ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Order #{order.id}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
               <Clock size={10} /> {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span 
          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </div>
      <div className="pt-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {order.totalProducts} Items • {order.paymentMethod.replace('_', ' ')}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900 dark:text-white">₹{order.totalAmount}</span>
          <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500">
            <span>{isLive ? 'Track Order' : 'View Details'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---
export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState<'Live' | 'Completed'>('Live');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await CartService.getOrders();
            // Sort newest first
            const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
            setOrders(sorted);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'Live') {
      return orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    }
    return orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  }, [activeTab, orders]);

  return (
    <div className="w-full max-w-5xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
      {/* Header */}
      <header className="px-4 md:px-6 py-4 flex items-center space-x-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
        <Link href="/profile" aria-label="Go back to profile">
          <ArrowLeft className="w-6 h-6 text-gray-800 dark:text-white" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Order History</h1>
      </header>

      {/* Tab Navigation */}
      <nav className="p-4 md:px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-[65px] z-10">
        <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-full">
          <button
            onClick={() => setActiveTab('Live')}
            className={`w-1/2 rounded-full py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'Live' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
            } relative`}
          >
            {activeTab === 'Live' && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-md"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">Live Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('Completed')}
            className={`w-1/2 rounded-full py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'Completed' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
            } relative`}
          >
            {activeTab === 'Completed' && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-md"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">Completed</span>
          </button>
        </div>
      </nav>

      {/* Order List */}
      <main className="grow overflow-y-auto p-4 md:p-6">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading orders...</p>
            </div>
        ) : (
            <motion.div layout className="space-y-4">
            <AnimatePresence mode='popLayout'>
                {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                ))
                ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20"
                >
                    <CheckCircle className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">No {activeTab} Orders</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {activeTab === 'Live' 
                        ? 'You have no orders currently on the way.'
                        : 'Your completed and cancelled orders will appear here.'
                    }
                    </p>
                    <Link href="/home">
                        <button className="mt-6 px-6 py-2.5 bg-yellow-500 text-white font-bold rounded-full hover:bg-yellow-600 transition-colors">
                            Start Shopping
                        </button>
                    </Link>
                </motion.div>
                )}
            </AnimatePresence>
            </motion.div>
        )}
      </main>
    </div>
  );
}