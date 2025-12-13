"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  CheckCircle,
  Loader2,
  Printer,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { shopService } from "@/services/shopService";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { OrderDetail } from "@/types/shop";

export default function ShopOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const orderId = Number(use(params).id);
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [openPopUp, setOpenPopUp] = useState<OrderDetail["status"] | null>(
    null
  );

  const [selectedRider, setSelectedRider] = useState<
    OrderDetail["driver"] | null
  >(null);

  useEffect(() => {
    (async () => {
      try {
        if (!orderId) return;
        const data = await shopService.getShopOrderById(orderId);
        if (!data) return;
        setOrder(data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to load order: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [orderId]);

  const handleAcceptOrder = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      await shopService.updateOrderStatus(order.id, "confirmed");
      setOrder({ ...order, status: "confirmed" });
      setOpenPopUp(null);
      toast.success("Order accepted successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to accept order: ${error.message}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignRider = async () => {
    if (!selectedRider || !order) return;
    setIsUpdating(true);
    try {
      await shopService.assignRider(
        order.id,
        selectedRider.id
      );

      setOrder({
        ...order,
        status: "shipped",
        driver: selectedRider,
        driverList: [],
      });

      setOpenPopUp(null);
      toast.success("Rider assigned and order marked as ready");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to assign rider: ${error.message}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      await shopService.updateOrderStatus(order.id, "cancelled");
      setOrder({ ...order, status: "cancelled" });
      setOpenPopUp(null);
      toast.success("Order rejected successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to reject order: ${error.message}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={24} className="text-gray-800 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Order # {orderId}
        </h1>
        <button className="ml-auto p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
          <Printer size={20} />
        </button>
      </div>

      {isLoading ? (
        <motion.div className="max-w-4xl mx-auto pb-24 md:pb-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6" />
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            </div>
          </div>
        </motion.div>
      ) : !order ? (
        <div className="p-8 text-center">Order not found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                Customer Details
              </h3>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Phone size={14} /> {order.customerPhone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-start gap-3">
                <MapPin className="text-gray-400 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {order.address}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                Order Items
              </h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="flex  items-center justify-center">
                      <span className="text-xs text-gray-500  mx-3">
                        {`${item.price} * ${item.quantity} =`}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ₹{item.price * item.quantity}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Total Amount</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-6">
            {/* Status Control */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                Order Status
              </h3>

              {order.status === "pending" && (
                <div className="space-y-3">
                  <button
                    onClick={() => setOpenPopUp("confirmed")}
                    disabled={isUpdating}
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Accept Order"
                    )}
                  </button>
                  {/* UPDATED: Connected Reject Button */}
                  <button
                    onClick={() => setOpenPopUp("cancelled")}
                    disabled={isUpdating}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Reject Order
                  </button>
                </div>
              )}

              {order.status === "confirmed" && (
                <button
                  onClick={() => setOpenPopUp("shipped")}
                  disabled={isUpdating}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Mark as Ready & Assign"
                  )}
                </button>
              )}

              {order.status === "shipped" && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900">
                  <p className="text-green-700 dark:text-green-400 font-bold mb-2">
                    Ready for Pickup
                  </p>
                  <p className="text-xs text-gray-500">
                    Waiting for delivery partner...
                  </p>
                </div>
              )}

              {/* NEW: Cancelled State */}
              {order.status === "cancelled" && (
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900">
                  <p className="text-red-700 dark:text-red-400 font-bold mb-2">
                    Order Cancelled
                  </p>
                  <p className="text-xs text-gray-500">
                    This order has been rejected/cancelled.
                  </p>
                </div>
              )}

              {/* Status Steps Visualization */}
              <div className="mt-6 relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
                {["pending", "preparing", "ready", "delivered"].map((step) => {
                  const stepsOrder = [
                    "pending",
                    "confirmed",
                    "shipped",
                    "delivered",
                  ];
                  const currentIdx = stepsOrder.indexOf(order.status);
                  const stepIdx = stepsOrder.indexOf(step);
                  const isCompleted = currentIdx >= stepIdx;

                  return (
                    <div key={step} className="relative">
                      <div
                        className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white dark:ring-gray-800 ${
                          isCompleted
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                      <p
                        className={`text-sm capitalize ${
                          isCompleted
                            ? "font-bold text-gray-900 dark:text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {step}
                        isCompleted: {isCompleted}
                        currentIdx: {currentIdx}
                        stepIdx:{stepIdx}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Driver Info (if assigned) */}
            {order.driver && (
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                  Delivery Partner
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {order.driver.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {order.driver.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.driver.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* PopUp Modals */}
      {order && (
        <AnimatePresence>
          {openPopUp == "confirmed" ? (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex flex-col items-center mb-6">
                  <CheckCircle
                    size={40}
                    className="text-green-500 mb-4 bg-green-100 rounded-full p-2"
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Accept Order
                  </h3>
                  <p className="text-center text-gray-600 dark:text-gray-300">
                    Are you sure you want to accept this order?
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setOpenPopUp(null)}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAcceptOrder}
                    disabled={isUpdating}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Accept Order"
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          ) : openPopUp == "shipped" ? (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Select Delivery Partner
                  </h3>
                  <button
                    onClick={() => setOpenPopUp(null)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {order.driverList.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar mb-6">
                    {order.driverList.map((rider) => (
                      <div
                        key={rider.id}
                        onClick={() => setSelectedRider(rider)}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                          selectedRider?.id === rider.id
                            ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10"
                            : "border-gray-100 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {rider.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-400">
                                Phone: {rider.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedRider?.id === rider.id && (
                          <CheckCircle
                            size={20}
                            className="text-yellow-500 fill-current"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No riders found
                  </div>
                )}

                <button
                  onClick={handleAssignRider}
                  disabled={!selectedRider || isUpdating}
                  className="w-full py-3.5 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Assign & Mark Ready"
                  )}
                </button>
              </motion.div>
            </div>
          ) : (
            openPopUp == "cancelled" && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl"
                >
                  <div className="flex flex-col items-center mb-6">
                    <X
                      size={40}
                      className="text-red-500 mb-4 bg-red-100 rounded-full p-2"
                    />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Reject Order
                    </h3>
                    <p className="text-center text-gray-600 dark:text-gray-300">
                      Are you sure you want to reject this order? This action
                      cannot be undone.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setOpenPopUp(null)}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectOrder}
                      disabled={isUpdating}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Reject Order"
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
