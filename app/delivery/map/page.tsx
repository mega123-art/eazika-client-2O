"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDeliveryStore } from "@/hooks/useDeliveryStore";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import {
  ArrowLeft,
  Navigation,
  Phone,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeliveryService } from "@/services/deliveryService";

// --- 1. DARK MODE MAP STYLE (Blinkit/Uber Style) ---
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 21.1458, // Nagpur
  lng: 79.0882,
};

export default function DeliveryMapPage() {
  const router = useRouter();
  const { queue, activeOrder, completeCurrentOrder, isSessionActive } =
    useDeliveryStore();

  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);

  // Use a Ref to control the map programmatically (for Auto-Zoom)
  const mapRef = useRef<google.maps.Map | null>(null);

  // UI States
  const [isArrived, setIsArrived] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries: ["places"],
  });

  // Redirect if no active session
  useEffect(() => {
    if (!isSessionActive || !activeOrder) {
      // Optional: Comment this out during testing if you want to stay on the page
      // toast.info("No active session.");
      // router.push('/delivery');
    }
  }, [isSessionActive, activeOrder, router]);



  // Track Location & Sync to Backend
  useEffect(() => {
    let watchId: number;
    let intervalId: NodeJS.Timeout;

    if (navigator.geolocation) {
      // 1. Watch Position for UI updates
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => console.warn("Location permission denied"),
        { enableHighAccuracy: true }
      );

      // 2. Sync to Backend every 10 seconds
      intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
             DeliveryService.updateLocation(pos.coords.latitude, pos.coords.longitude)
               .catch((err: any) => console.error("Location sync failed", err));
        });
      }, 10000);

      return () => {
        navigator.geolocation.clearWatch(watchId);
        clearInterval(intervalId);
      };
    }
  }, []);

  // --- 2. AUTO-ZOOM LOGIC (The "Smart" Camera) ---
  useEffect(() => {
    if (mapRef.current && currentLocation && directionsResponse) {
      const bounds = new window.google.maps.LatLngBounds();

      // Add Driver
      bounds.extend(currentLocation);

      // Add Destination (End of route)
      const route = directionsResponse.routes[0];
      if (route && route.legs.length > 0) {
        const lastLeg = route.legs[route.legs.length - 1];
        if (lastLeg.end_location) {
          bounds.extend(lastLeg.end_location);
        }
      }

      // Fit the map to these bounds (with some padding)
      mapRef.current.fitBounds(bounds, {
        top: 100,
        bottom: 300,
        left: 50,
        right: 50,
      });
    }
  }, [currentLocation, directionsResponse]);

  const calculateRoute = useCallback(async () => {
    if (!currentLocation || !window.google || queue.length === 0) return;

    const directionsService = new window.google.maps.DirectionsService();

    let destinationAddress = "";
    let waypoints: google.maps.DirectionsWaypoint[] = [];

    if (queue.length === 1) {
      destinationAddress = queue[0].deliveryAddress || "";
    } else {
      // Optimize: Last order is destination, others are waypoints
      const lastOrder = queue[queue.length - 1];
      destinationAddress = lastOrder.deliveryAddress || "";
      const intermediateOrders = queue.slice(0, queue.length - 1);
      waypoints = intermediateOrders.map((order) => ({
        location: order.deliveryAddress,
        stopover: true,
      }));
    }

    try {
      const results = await directionsService.route({
        origin: currentLocation,
        destination: destinationAddress,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirectionsResponse(results);
    } catch (error) {
      console.error("Route Error:", error);
    }
  }, [currentLocation, queue]);

  useEffect(() => {
    if (isLoaded && currentLocation && queue.length > 0) {
      calculateRoute();
    }
  }, [isLoaded, currentLocation, queue, calculateRoute]);

  const handleOpenMapsApp = () => {
    if (!activeOrder) return;
    const query = encodeURIComponent(activeOrder.deliveryAddress || "");
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${query}`,
      "_blank"
    );
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleCompleteOrder = async () => {
    const code = otp.join("");
    if (code.length !== 4) {
      toast.error("Enter valid 4-digit OTP");
      return;
    }
    setIsSubmitting(true);
    const success = await completeCurrentOrder(code);
    setIsSubmitting(false);

    if (success) {
      toast.success("Delivery Completed!");
      setOtp(["", "", "", ""]);
      setIsArrived(false);
    } else {
      toast.error("Invalid OTP");
    }
  };

  if (!isLoaded || !activeOrder)
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center text-green-500 font-bold animate-pulse">
        Locating Satellites...
      </div>
    );

  return (
    <div className="h-full w-full relative bg-gray-900">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation || defaultCenter}
        zoom={15}
        onLoad={(map) => {
          mapRef.current = map;
        }} // Capture map instance
        options={{
          disableDefaultUI: true,
          styles: darkMapStyle, // Apply Dark Mode
        }}
      >
        {/* --- 3. CUSTOM MARKERS --- */}

        {/* RIDER MARKER (Bike Icon) */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={{
              url: "https://cdn-icons-png.flaticon.com/512/3755/3755376.png", // 3D Delivery Bike Icon
              scaledSize: new window.google.maps.Size(50, 50),
              anchor: new window.google.maps.Point(25, 25),
            }}
          />
        )}

        {/* CUSTOMER MARKER (House/Pin) - We infer this from the route end location if available, or rely on DirectionsRenderer default */}
        {/* Note: DirectionsRenderer puts generic markers A, B, C. 
            To hide them and put custom ones, set suppressMarkers: true in options below, 
            then manually map over 'queue' to place <Marker /> components. 
        */}

        {directionsResponse && (
          <DirectionsRenderer
            options={{
              directions: directionsResponse,
              suppressMarkers: false, // Keep default letter markers for multi-stop logic
              polylineOptions: {
                strokeColor: "#22c55e", // Blinkit Green
                strokeWeight: 6,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top z-10 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
          <button
            onClick={() => router.back()}
            className="bg-gray-900/90 backdrop-blur-md p-3 rounded-full text-white shadow-lg border border-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg flex items-center gap-2 border border-gray-700">
            <Navigation size={14} className="text-green-500" />
            {queue.length} Stops
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl p-6 z-20 border-t border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-500 text-gray-900 text-[10px] font-extrabold px-2 py-0.5 rounded-sm tracking-wider">
                LIVE ORDER
              </span>
            </div>
            <h2 className="text-white font-bold text-2xl">
              {activeOrder.customerName || "Customer"}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-gray-400">
              <MapPin size={14} />
              <p className="text-sm truncate max-w-[250px]">
                {activeOrder.deliveryAddress}
              </p>
            </div>
          </div>
          <button className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-green-500 border border-gray-700 shadow-lg active:scale-95 transition-transform">
            <Phone size={24} />
          </button>
        </div>

        {!isArrived ? (
          <div className="grid grid-cols-5 gap-3">
            <button
              onClick={handleOpenMapsApp}
              className="col-span-1 bg-gray-800 border border-gray-700 text-white font-bold rounded-xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <Navigation size={22} className="text-blue-400" />
            </button>
            <button
              onClick={() => setIsArrived(true)}
              className="col-span-4 bg-green-500 text-gray-900 font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-transform text-lg"
            >
              Slide to Arrive &nbsp; &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-widest">
                Enter Delivery OTP
              </p>
              <div className="flex justify-center gap-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-14 h-16 bg-gray-800 border-2 border-gray-700 rounded-2xl text-center text-3xl font-bold text-white focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all shadow-inner"
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleCompleteOrder}
              disabled={isSubmitting}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 active:scale-95 transition-transform"
            >
              {isSubmitting ? (
                <span className="animate-spin">⌛</span>
              ) : (
                <CheckCircle size={22} />
              )}
              <span className="text-lg">Complete Delivery</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
