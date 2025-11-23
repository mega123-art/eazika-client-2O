"use client";

import React, { useState, useEffect } from 'react';
import { 
    User, 
    ChevronRight, 
    MapPin, 
    CreditCard, 
    Package, 
    Bell, 
    Moon, 
    Sun, 
    LogOut,
    AlertTriangle,
    FileText,
    LifeBuoy,
    Loader2,
    Store // Added Store icon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useUserStore } from '@/app/hooks/useUserStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Logout Confirmation Modal ---
const LogoutConfirmationModal = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4 backdrop-blur-sm"
    >
        <motion.div 
            initial={{ scale: 0.9, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.9, y: 20 }} 
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700"
        >
            <div className="mx-auto h-12 w-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Log Out?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3 mt-6">
                <button 
                    onClick={onCancel} 
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm} 
                    className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-colors text-sm"
                >
                    Log Out
                </button>
            </div>
        </motion.div>
    </motion.div>
);

// --- Main Page Component ---
export default function ProfilePage() {
  const router = useRouter();
  const { user, fetchUser, logout, isLoading } = useUserStore();
  const [isClient, setIsClient] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsClient(true);
    // Fetch user data when page loads
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    router.push('/login'); // Redirect to login after logout
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const menuItems = [
    { name: 'Edit Profile', icon: User, href: '/profile/edit' },
    { name: 'Delivery Addresses', icon: MapPin, href: '/profile/addresses' },
    { name: 'Payment Methods', icon: CreditCard, href: '/profile/payment' },
    { name: 'Order History', icon: Package, href: '/orders' },
    { name: 'Notifications', icon: Bell, href: '/notifications' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"></div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
      </header>

      {/* Profile Content */}
      <main className="p-4 md:p-6">
        <motion.div
          className="max-w-lg mx-auto space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* User Info Card */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
                    <Loader2 className="animate-spin text-yellow-500" />
                </div>
            )}
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 border-2 border-white dark:border-gray-600 shadow-sm overflow-hidden relative">
              {user?.image ? (
                  <Image src={user.image} alt={user.name} layout="fill" objectFit="cover" />
              ) : (
                  <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || 'Guest User'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'Sign in to view profile'}</p>
            </div>
            <Link href="/profile/edit" className="ml-auto p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                 <ChevronRight size={20} />
            </Link>
          </motion.div>

          {/* Menu Items */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              ))}
              {/* Dark Mode Toggle */}
              <li>
                <button 
                  onClick={handleThemeToggle}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                         {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </div>
                  {/* Toggle Switch UI */}
                  <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    theme === 'dark' ? 'bg-yellow-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                      layout
                      transition={{ type: "spring", stiffness: 700, damping: 30 }}
                      animate={{ x: theme === 'dark' ? 20 : 0 }}
                    />
                  </div>
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Register as Shopkeeper Banner */}
          <motion.div variants={itemVariants}>
            <Link 
                href="/shop/register" 
                className="w-full flex items-center justify-between p-4 bg-linear-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg shadow-gray-200 dark:shadow-none hover:scale-[1.02] transition-all group border border-gray-200 dark:border-gray-600"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white shadow-md">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Register as Shopkeeper</h3>
                        <p className="text-gray-300 text-xs">Grow your business with Eazika</p>
                    </div>
                </div>
                <div className="bg-white/10 p-2 rounded-full">
                    <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
          </motion.div>

          {/* Log Out Button */}
          <motion.div variants={itemVariants}>
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-100 dark:hover:border-red-900/30 transition-all group"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-red-500">Log Out</span>
            </button>
          </motion.div>

          {/* Legal & Support Links */}
          <motion.div
            variants={itemVariants}
            className="pt-4 pb-8 text-center"
          >
            <div className="flex justify-center items-center gap-4">
              <Link
                href="/privacy-policy"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <Link
                href="/terms-and-condition"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <Link
                href="/support"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Support
              </Link>
            </div>
            <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-4">
                Version 2.0.1 • Eazika
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <LogoutConfirmationModal 
            onConfirm={handleLogout}
            onCancel={() => setShowLogoutModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}