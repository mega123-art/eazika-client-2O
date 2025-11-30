"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Bell, 
    Package, 
    Tag, 
    Info, 
    CheckCircle, 
    Loader2,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserService, Notification } from '@/services/userService';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
        try {
            const data = await UserService.getNotifications();
            // Sort by date descending
            const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(sorted);
        } catch (error) {
            console.error("Failed to load notifications");
        } finally {
            setIsLoading(false);
        }
    };
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      await UserService.markNotificationRead(id);
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'order': return <Package size={20} className="text-blue-500" />;
          case 'promo': return <Tag size={20} className="text-green-500" />;
          case 'system': return <Info size={20} className="text-gray-500" />;
          case 'alert': return <Bell size={20} className="text-red-500" />;
          default: return <Bell size={20} className="text-yellow-500" />;
      }
  };

  const getBgColor = (type: string) => {
      switch(type) {
          case 'order': return 'bg-blue-100 dark:bg-blue-900/20';
          case 'promo': return 'bg-green-100 dark:bg-green-900/20';
          case 'system': return 'bg-gray-100 dark:bg-gray-800';
          case 'alert': return 'bg-red-100 dark:bg-red-900/20';
          default: return 'bg-yellow-100 dark:bg-yellow-900/20';
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-800 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        {isLoading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-yellow-500" size={32} />
            </div>
        ) : notifications.length > 0 ? (
            <div className="space-y-3">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                            className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                                notification.isRead 
                                ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700' 
                                : 'bg-white dark:bg-gray-800 border-l-4 border-l-yellow-500 border-y-gray-100 dark:border-y-gray-700 border-r-gray-100 dark:border-r-gray-700 shadow-sm'
                            }`}
                        >
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getBgColor(notification.type)}`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-bold ${notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-xs leading-relaxed ${notification.isRead ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300 font-medium'}`}>
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-500 rounded-full" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Bell size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Notifications</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                    You're all caught up! Check back later for updates on your orders and offers.
                </p>
            </div>
        )}
      </main>
    </div>
  );
}