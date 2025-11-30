"use client";

import React, { useState, useEffect, Suspense } from 'react';
import {
  ArrowLeft,
  MapPin,
  Phone,
  X,
  Star,
  Loader2,
  Clock
} from 'lucide-react';
import { motion, PanInfo, useAnimation, AnimatePresence, useDragControls } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartService, TrackingDetails } from '@/services/cartService';

// --- Components ---

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <Loader2 className="animate-spin text-yellow-500" size={32} />
  </div>
);

const MapPlaceholder = ({ orderId }: { orderId: number }) => (
  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800">
    <div className="w-full h-full relative overflow-hidden bg-[#e5e7eb] dark:bg-[#1f2937]">
      <div className="absolute inset-0 opacity-30" style={{ 
          backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }} 
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-64 border-4 border-dashed border-blue-300/50 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 animate-bounce">
                <MapPin className="h-8 w-8 text-white fill-current" />
            </div>
            <div className="mt-4 bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-full shadow-md backdrop-blur-sm">
                <p className="text-xs font-bold text-gray-900 dark:text-white">Order #{orderId}</p>
                <p className="text-[10px] text-gray-500 text-center">Live Tracking</p>
            </div>
        </div>
      </div>
    </div>
  </div>
);

const OrderDetailsContent = ({
  tracking,
  onCancel,
}: {
  tracking: TrackingDetails;
  onCancel: () => void;
}) => {
  const handleCall = () => {
    if (tracking.deliveryBoy?.phone) {
        navigator.clipboard.writeText(tracking.deliveryBoy.phone);
        alert(`Copied ${tracking.deliveryBoy.phone} to clipboard!`);
    }
  };

  return (
    <div className="px-6 pb-6 space-y-6">
      {/* Driver Info */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-xl ring-4 ring-yellow-50 dark:ring-yellow-900/20 shadow-sm shrink-0">
            {tracking.deliveryBoy?.name.charAt(0) || 'D'}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {tracking.deliveryBoy?.name || "Assigning Driver..."}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center text-yellow-500 font-bold">
                  <Star size={14} className="fill-current mr-1" />
                  {tracking.deliveryBoy?.rating || "4.9"}
              </div>
              <span>•</span>
              <span>{tracking.deliveryBoy?.vehicle || "Standard Delivery"}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wide">
              {tracking.status}
            </span>
        </div>
      </div>

      {/* OTP & ETA */}
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Clock size={12} /> ETA
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                  15 <span className="text-sm font-normal text-gray-500">mins</span>
              </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl p-4 text-center border border-yellow-100 dark:border-yellow-900/30">
              <p className="text-xs font-bold text-yellow-600/70 dark:text-yellow-500/70 uppercase tracking-wider mb-1">Delivery OTP</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-500 tracking-widest">
                  4829
              </p>
          </div>
      </div>

      {/* Status Timeline */}
      <div className="space-y-4">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Delivery Status</h4>
          <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-8 ml-1">
              <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-gray-900" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Order Confirmed</p>
                  <p className="text-xs text-gray-500 mt-0.5">Your order has been received</p>
              </div>
              <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-gray-900" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Order Picked Up</p>
                  <p className="text-xs text-gray-500 mt-0.5">Driver is on the way to you</p>
              </div>
              <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-yellow-500 ring-4 ring-white dark:ring-gray-900 animate-pulse" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">On the way</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tracking.currentLocation}</p>
              </div>
          </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button
          onClick={handleCall}
          className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <Phone size={20} />
          <span>Call Driver</span>
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <X size={20} />
          <span>Cancel Order</span>
        </button>
      </div>
    </div>
  );
};

// --- Main Content Component ---
function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [tracking, setTracking] = useState<TrackingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Animation controls
  const controls = useAnimation();
  const dragControls = useDragControls(); 
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelFullHeight, setPanelFullHeight] = useState(600);
  const PEEK_HEIGHT = 120; 

  useEffect(() => {
    if (!orderId) return;

    const loadTracking = async () => {
      try {
        const data = await CartService.trackOrder(Number(orderId));
        setTracking(data);
      } catch (error) {
        console.error("Failed to track order", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracking();
    const interval = setInterval(loadTracking, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    const updateHeight = () => {
      setPanelFullHeight(window.innerHeight * 0.85);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // --- Panel Logic ---
  const togglePanel = () => {
    if (isPanelOpen) {
        controls.start({ y: panelFullHeight - PEEK_HEIGHT });
        setIsPanelOpen(false);
    } else {
        controls.start({ y: 0 });
        setIsPanelOpen(true);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    // Dragged Up
    if (info.offset.y < -threshold || info.velocity.y < -500) {
        controls.start({ y: 0 });
        setIsPanelOpen(true);
    } 
    // Dragged Down
    else if (info.offset.y > threshold || info.velocity.y > 500) {
        controls.start({ y: panelFullHeight - PEEK_HEIGHT });
        setIsPanelOpen(false);
    } 
    // Snap to closest state
    else {
        if (info.point.y < window.innerHeight / 2) {
            controls.start({ y: 0 });
            setIsPanelOpen(true);
        } else {
            controls.start({ y: panelFullHeight - PEEK_HEIGHT });
            setIsPanelOpen(false);
        }
    }
  };

  const handleCancelConfirm = async () => {
    if (!tracking) return;
    try {
        await CartService.cancelOrder(tracking.orderId, cancelReason || "Changed my mind");
        alert("Order cancelled successfully");
        router.push('/');
    } catch (error) {
        console.warn("Cancel failed (network error), redirecting for demo");
        router.push('/');
    }
  };

  if (isLoading) return <LoadingFallback />;

  if (!tracking) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-4">
              <p className="text-gray-500 mb-4">Order not found or tracking unavailable.</p>
              <button onClick={() => router.push('/')} className="text-yellow-600 font-bold">Go Home</button>
          </div>
      );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900 font-sans">
      
      {/* --- Desktop Layout --- */}
      <div className="hidden md:flex h-full">
        <div className="flex-1 h-full relative">
          <MapPlaceholder orderId={tracking.orderId} />
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <button
              onClick={() => router.back()}
              className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:scale-105 transition-transform text-gray-800 dark:text-white"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>

        <div className="w-[400px] h-full bg-white dark:bg-gray-900 shadow-2xl border-l dark:border-gray-800 overflow-y-auto relative z-20">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
             <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tracking Order #{tracking.orderId}</h1>
          </div>
          <OrderDetailsContent tracking={tracking} onCancel={() => setIsCancelling(true)} />
        </div>
      </div>

      {/* --- Mobile Layout --- */}
      <div className="md:hidden h-full w-full relative">
        <div className="absolute inset-0 z-0">
           <MapPlaceholder orderId={tracking.orderId} />
        </div>

        <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center z-10 pointer-events-none">
            <button
              onClick={() => router.back()}
              className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg backdrop-blur-md pointer-events-auto text-gray-800 dark:text-white"
            >
              <ArrowLeft size={20} />
            </button>
        </div>

        {/* Sliding Panel */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-20 bg-white dark:bg-gray-900 rounded-t-4xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          initial={{ y: panelFullHeight - PEEK_HEIGHT }}
          animate={controls}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          drag="y"
          dragListener={false} 
          dragControls={dragControls} 
          dragConstraints={{ top: 0, bottom: panelFullHeight - PEEK_HEIGHT }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ height: panelFullHeight }}
        >
           {/* Tap/Drag Handle Zone */}
           <div 
              className="w-full pt-4 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={(e) => dragControls.start(e)}
              onClick={togglePanel} 
           >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
           </div>

           <div className="h-full overflow-y-auto no-scrollbar pb-[100px] rounded-t-4xl">
              <OrderDetailsContent tracking={tracking} onCancel={() => setIsCancelling(true)} />
           </div>
        </motion.div>
      </div>

      {/* --- Cancel Modal --- */}
      <AnimatePresence>
        {isCancelling && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl"
             >
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Cancel Order?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                    Are you sure you want to cancel? This action cannot be undone.
                </p>
                <div className="space-y-2 mb-6">
                    {['Changed my mind', 'Found better price', 'Taking too long'].map(r => (
                        <button 
                            key={r} 
                            onClick={() => setCancelReason(r)}
                            className={`w-full p-3.5 text-left text-sm rounded-xl border-2 transition-all ${
                                cancelReason === r 
                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-200 font-medium' 
                                : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsCancelling(false)} className="flex-1 py-3.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Keep Order</button>
                    <button onClick={handleCancelConfirm} disabled={!cancelReason} className="flex-1 py-3.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel It</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

const TrackOrderPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TrackOrderContent />
    </Suspense>
  );
};

export default TrackOrderPage;