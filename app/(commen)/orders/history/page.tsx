"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Box, ChevronRight, Loader2, Clock, Package, CheckCircle, XCircle, Truck } from "lucide-react";
import { CartService, Order } from "@/services/cartService";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Helper for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'shipped': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'confirmed': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

// Helper for status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered': return <CheckCircle size={16} />;
    case 'shipped': return <Truck size={16} />;
    case 'cancelled': return <XCircle size={16} />;
    default: return <Clock size={16} />;
  }
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await CartService.getOrders();
        // Sort by date (newest first)
        const sortedData = Array.isArray(data) 
          ? data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) 
          : [];
        setOrders(sortedData);
      } catch (error) {
        console.warn("Failed to load orders", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders based on tab
  const liveOrders = orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status));
  const historyOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const displayedOrders = activeTab === 'live' ? liveOrders : historyOrders;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-800 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Orders</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 relative">
            {/* Animated Background for Tab */}
            <motion.div 
                className="absolute top-1 bottom-1 rounded-lg bg-yellow-500 shadow-sm z-0"
                initial={false}
                animate={{ 
                    left: activeTab === 'live' ? '4px' : '50%', 
                    width: 'calc(50% - 4px)',
                    x: activeTab === 'live' ? 0 : 0 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            <button 
                onClick={() => setActiveTab('live')}
                className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-200 ${
                    activeTab === 'live' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
            >
                Live Tracking ({liveOrders.length})
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-200 ${
                    activeTab === 'history' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
            >
                History ({historyOrders.length})
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 space-y-4 min-h-[50vh]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-yellow-500" size={32} />
            <p className="text-gray-500 text-sm">Loading your orders...</p>
          </div>
        ) : displayedOrders.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {displayedOrders.map((order) => {
              // LOGIC UPDATE: Determine target link based on status
              const isCompleted = ['delivered', 'cancelled'].includes(order.status);
              const targetLink = isCompleted 
                ? `/orders/history/${order.id}` 
                : `/orders/track-order?id=${order.id}`;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    href={targetLink}
                    className="block bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-yellow-500/50 dark:hover:border-yellow-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 dark:text-white">Order #{order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={12} />
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-gray-900 dark:text-white">₹{order.totalAmount}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{order.totalProducts} Items</span>
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-3" />

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Box size={16} className="text-gray-400" />
                        <span>Standard Delivery</span>
                      </div>
                      <div className="flex items-center text-yellow-600 dark:text-yellow-500 font-medium text-sm gap-1 group-hover:translate-x-1 transition-transform">
                        {activeTab === 'live' ? 'Track Live' : 'View Invoice'} <ChevronRight size={16} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Package size={40} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {activeTab === 'live' ? 'No active orders' : 'No order history'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-2 mb-6">
                {activeTab === 'live' 
                    ? "You don't have any ongoing orders right now." 
                    : "You haven't placed any orders yet."}
            </p>
            <Link href="/">
                <button className="bg-yellow-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-600 transition-colors">
                    Start Shopping
                </button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}