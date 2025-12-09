"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDeliveryStore } from "@/hooks/useDeliveryStore";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Marker
} from "@react-google-maps/api";
import { ArrowLeft, Navigation, MapPin, Phone, CheckCircle, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090, 
};

export default function DeliveryMapPage() {
  const router = useRouter();
  // We need 'queue' for the map route, and 'activeOrder' for the bottom panel
  const { queue, activeOrder, completeCurrentOrder, isSessionActive } = useDeliveryStore();

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  
  // Interaction States
  const [isArrived, setIsArrived] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "", 
    libraries: ["places"],
  });

  // 1. Redirect if no session
  useEffect(() => {
    if (!isSessionActive || !activeOrder) {
        toast.info("No active session. Redirecting to home.");
        router.push('/delivery');
    }
  }, [isSessionActive, activeOrder, router]);

  // 2. Get Location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => console.warn("Loc permit denied"),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // 3. Calculate Route (OPTIMIZED FOR MULTIPLE ORDERS)
  const calculateRoute = useCallback(async () => {
    if (!currentLocation || !window.google || queue.length === 0) return;

    const directionsService = new window.google.maps.DirectionsService();

    // Logic:
    // If we have > 1 order, we use Waypoints to optimize.
    // Origin: Driver
    // Destination: The LAST order in the list (you can logic this differently if needed)
    // Waypoints: Everyone else
    
    let destinationAddress = "";
    let waypoints: google.maps.DirectionsWaypoint[] = [];

    if (queue.length === 1) {
        // Simple A -> B
        destinationAddress = queue[0].deliveryAddress || "";
    } else {
        // A -> B -> C -> D (Optimized)
        // We pick the last one in the array as the "final" destination for the API call
        const lastOrder = queue[queue.length - 1];
        destinationAddress = lastOrder.deliveryAddress || "";

        const intermediateOrders = queue.slice(0, queue.length - 1);
        waypoints = intermediateOrders.map(order => ({
            location: order.deliveryAddress,
            stopover: true
        }));
    }

    try {
      const results = await directionsService.route({
        origin: currentLocation,
        destination: destinationAddress,
        waypoints: waypoints,
        optimizeWaypoints: true, // <--- ENABLES 4-5 ORDER OPTIMIZATION
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirectionsResponse(results);
      
      // OPTIONAL: You can inspect 'results.routes[0].waypoint_order' 
      // to see the optimized order indices and update your store if needed.
      
    } catch (error) {
      console.error("Route Error:", error);
    }
  }, [currentLocation, queue]);

  // Trigger calculation
  useEffect(() => {
    if (isLoaded && currentLocation && queue.length > 0) {
      calculateRoute();
    }
  }, [isLoaded, currentLocation, queue, calculateRoute]);

  // 4. Handlers
  const handleOpenMapsApp = () => {
    if (!activeOrder) return;
    const query = encodeURIComponent(activeOrder.deliveryAddress || "");
    // Opens external Google Maps app for turn-by-turn navigation
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCompleteOrder = async () => {
    const code = otp.join("");
    if (code.length !== 4) {
        toast.error("Please enter the 4-digit OTP");
        return;
    }

    setIsSubmitting(true);
    const success = await completeCurrentOrder(code);
    setIsSubmitting(false);

    if (success) {
        toast.success("Order Delivered Successfully!");
        setOtp(["", "", "", ""]);
        setIsArrived(false);
        // The store will remove this order from 'queue'.
        // The 'useEffect' above will see 'queue' changed and Re-Calculate the route for remaining orders!
    } else {
        toast.error("Invalid OTP. Try '1234'");
    }
  };

  if (!isLoaded || !activeOrder) return <div className="h-screen bg-gray-900 text-white flex items-center justify-center">Loading Mission Control...</div>;

  return (
    <div className="h-full w-full relative bg-gray-900">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation || defaultCenter}
        zoom={15}
        options={{ disableDefaultUI: true, styles: [/* Add dark styles here if needed */] }}
      >
        {currentLocation && <Marker position={currentLocation} />}
        
        {directionsResponse && (
          <DirectionsRenderer 
            options={{ 
                directions: directionsResponse, 
                polylineOptions: { strokeColor: "#22c55e", strokeWeight: 6 },
                suppressMarkers: false // Keeps A, B, C markers visible
            }} 
          />
        )}
      </GoogleMap>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top z-10 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
            <button onClick={() => router.back()} className="bg-gray-900/90 p-3 rounded-full text-white shadow-lg">
                <ArrowLeft size={20} />
            </button>
            <div className="bg-gray-900/90 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg flex items-center gap-2">
                <Navigation size={14} className="text-green-500" />
                {queue.length} Stops Left
            </div>
        </div>
      </div>

      {/* Bottom Panel - FOCUSED ON ACTIVE ORDER */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl p-6 z-20 border-t border-gray-800 shadow-2xl">
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6" />

        {/* Active Order Info */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-green-500 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">CURRENT STOP</span>
                </div>
                <h2 className="text-white font-bold text-xl">{activeOrder.customerName || "Customer"}</h2>
                <p className="text-gray-400 text-sm mt-1 max-w-[200px] truncate">{activeOrder.deliveryAddress}</p>
            </div>
            <div className="flex gap-3">
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-green-500 hover:bg-gray-700 transition-colors">
                    <Phone size={20} />
                </button>
            </div>
        </div>

        {/* Action Buttons */}
        {!isArrived ? (
            <div className="grid grid-cols-4 gap-3">
                 <button 
                    onClick={handleOpenMapsApp}
                    className="col-span-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-colors"
                >
                    <Navigation size={20} />
                </button>
                <button 
                    onClick={() => setIsArrived(true)}
                    className="col-span-3 bg-green-500 hover:bg-green-600 text-gray-900 font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
                >
                    I've Arrived at Location
                </button>
            </div>
        ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <div className="text-center mb-2">
                    <p className="text-white font-bold mb-4">Ask Customer for OTP</p>
                    <div className="flex justify-center gap-3">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                id={`otp-${i}`}
                                type="tel" 
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                className="w-14 h-14 bg-gray-800 border-2 border-gray-700 rounded-xl text-center text-2xl font-bold text-white focus:border-green-500 focus:outline-none transition-colors"
                            />
                        ))}
                    </div>
                </div>
                <button 
                    onClick={handleCompleteOrder}
                    disabled={isSubmitting}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {isSubmitting ? <span className="animate-spin">⌛</span> : <CheckCircle size={20} />}
                    Verify & Complete Delivery
                </button>
                <button 
                    onClick={() => setIsArrived(false)}
                    className="w-full text-gray-500 text-xs font-medium py-2 hover:text-white transition-colors"
                >
                    Wait, I haven't arrived yet
                </button>
            </div>
        )}
      </div>
    </div>
  );
}