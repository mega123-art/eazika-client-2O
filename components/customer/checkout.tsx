"use client";
import { isAxiosError } from "@/lib/axios";
import React, { useState } from "react";

import { Loader2, Crosshair } from "lucide-react";
import { userStore } from "@/store";
import { toast } from "sonner";
import { NewAddressPayload } from "@/types/user";
import { cn } from "@/lib/utils";

const AddressList = ({
  selectedAddressId,
  setSelectedAddressId,
}: {
  selectedAddressId: number | null;
  setSelectedAddressId: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const { addresses } = userStore();

  if (addresses.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No addresses found. Please add one.
      </div>
    );
  }
  return addresses.map((addr) => (
    <div
      key={addr.id}
      onClick={() => setSelectedAddressId(Number(addr.id))}
      className={`p-4 mt-1 md:mt-2 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
        selectedAddressId === addr.id
          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10"
          : "border-gray-100 dark:border-gray-700 hover:border-gray-300"
      }`}
    >
      <div
        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selectedAddressId === addr.id
            ? "border-yellow-500"
            : "border-gray-300"
        }`}
      >
        {selectedAddressId === addr.id && (
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
        )}
      </div>
      <div>
        <p className="font-bold text-gray-900 dark:text-white">{addr.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {addr.line1}, {addr.street}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {addr.city}, {addr.pinCode}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Phone: {addr.phone}
        </p>
      </div>
    </div>
  ));
};

const AddAddressFrom = ({
  setIsShowingAddAddress,
  setSelectedAddressId,
}: {
  setIsShowingAddAddress: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedAddressId: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const { user, addNewAddress } = userStore();
  const [isLoading, setIsLoading] = useState(false);

  const [newAddress, setNewAddress] = useState<NewAddressPayload>({
    name: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    line2: "",
    street: "",
    country: "India",
    state: "Maharashtra",
    city: "",
    pinCode: "",
    geoLocation: "",
  });

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

      try {
        const response = await fetch(url);

        const data = await response.json();

        // Map OpenStreetMap fields to our form fields
        setNewAddress((prev) => ({
          ...prev,
          name: user?.name || "",
          phone: user?.phone || "",
          line1: data.address.road || "",
          street:
            (data.address.suburb ? data.address.suburb + ", " : "") +
            (data.address.city_district
              ? data.address.city_district + ", "
              : "") +
            (data.address.city || ""),
          city: data.address.city || "",
          state: data.address.state || "",
          country: data.address.country || "",
          pinCode: data.address.postcode || "",
          geoLocation: `${latitude},${longitude}`,
        }));
      } catch (error) {
        console.error("Failed to get address details", error);
        toast.error(
          "Unable to retrieve address from your location. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const add = await addNewAddress(newAddress);
      setIsShowingAddAddress(true);
      setSelectedAddressId(Number(add.id));
      toast.success("Address added successfully!");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message || error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <form
      onSubmit={handleAddNewAddress}
      className="space-y-4 animate-in fade-in slide-in-from-top-4"
    >
      {/* Use Current Location Button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLoading}
        className="w-full py-3 rounded-xl border-2 border-dashed border-yellow-500/50 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 font-semibold flex items-center justify-center gap-2 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Crosshair size={18} />
        )}
        Use My Current Location
      </button>

      <div className="grid grid-cols-2 gap-4">
        <input
          required
          placeholder="Full Name"
          className="input-field"
          value={newAddress.name}
          onChange={(e) =>
            setNewAddress({ ...newAddress, name: e.target.value })
          }
        />
        <input
          required
          placeholder="Phone Number"
          className="input-field"
          value={newAddress.phone}
          onChange={(e) =>
            setNewAddress({
              ...newAddress,
              phone: e.target.value,
            })
          }
        />
      </div>
      <input
        required
        placeholder="Address Line 1 (Flat/House No)"
        className="input-field"
        value={newAddress.line1}
        onChange={(e) =>
          setNewAddress({ ...newAddress, line1: e.target.value })
        }
      />
      <input
        required
        placeholder="Street / Area"
        className="input-field"
        value={newAddress.street}
        onChange={(e) =>
          setNewAddress({ ...newAddress, street: e.target.value })
        }
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          required
          placeholder="City"
          className="input-field"
          value={newAddress.city}
          onChange={(e) =>
            setNewAddress({ ...newAddress, city: e.target.value })
          }
        />
        <input
          required
          placeholder="Pincode"
          className="input-field"
          value={newAddress.pinCode}
          onChange={(e) =>
            setNewAddress({
              ...newAddress,
              pinCode: e.target.value,
            })
          }
        />
      </div>
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          // disabled={!isLocating}
          onClick={() => setIsShowingAddAddress(true)}
          className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={cn(
            "flex-1 py-3 rounded-xl font-semibold bg-yellow-500 text-white",
            !newAddress.name ||
              !newAddress.phone ||
              !newAddress.line1 ||
              !newAddress.street ||
              !newAddress.city ||
              !newAddress.pinCode
              ? "opacity-50 cursor-not-allowed hover:bg-yellow-500"
              : "hover:bg-yellow-600"
          )}
          disabled={
            !newAddress.name ||
            !newAddress.phone ||
            !newAddress.line1 ||
            !newAddress.street ||
            !newAddress.city ||
            !newAddress.pinCode
          }
        >
          Save Address
        </button>
      </div>
      {/* Tailwind Custom Styles for Inputs */}
      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background-color: var(--bg-color, #f9fafb);
          border: 1px solid #e5e7eb;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: #eab308;
          ring: 2px solid #eab308;
        }
        :global(.dark) .input-field {
          background-color: #374151;
          border-color: #4b5563;
          color: white;
        }
      `}</style>
    </form>
  );
};

export { AddressList, AddAddressFrom };
