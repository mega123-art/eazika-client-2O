import axiosInstance from '@/lib/axios';

// --- Types ---

export interface CreateDeliveryProfilePayload {
  shopkeeperId: number;
  aadharNumber: string;
  panNumber: string;
  licenseNumber: string;
  licenseImage: string[];
  vechicleOwnerName: string;
  vehicleName: string;
  vehicleNo: string;
}

export interface UpdateDeliveryProfilePayload {
  panNumber?: string;
  licenseImage?: string[];
  vehicleName?: string;
  vehicleNo?: string;
  vehicleOwnerName?: string;
  licenseNumber?: string;
  image?: string; 
}

export interface DeliveryProfile {
  id: number;
  userId: number;
  shopkeeperId: number;
  aadharNumber: string;
  panNumber: string;
  licenseNumber: string;
  licenseImage: string[];
  vechicleOwnerName: string;
  vehicleName: string;
  vehicleNo: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  phone?: string;
  image?: string;
}

export interface DeliveryOrder {
  id: number;
  userId: number;
  assignedDeliveryBoyId: number;
  totalProducts: number;
  totalAmount: number;
  addressId: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  cancelBy?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
}

export const DeliveryService = {
  // POST /delivery/create-delivery-profile
  createProfile: async (data: CreateDeliveryProfilePayload) => {
    const response = await axiosInstance.post('/delivery/create-delivery-profile', data);
    return response.data;
  },

  // PUT /delivery/update-delivery-profile
  updateProfile: async (data: UpdateDeliveryProfilePayload) => {
    const response = await axiosInstance.put('/delivery/update-delivery-profile', data);
    return response.data;
  },

  // Assumed Endpoint: GET /delivery/profile
  getProfile: async () => {
    const response = await axiosInstance.get<DeliveryProfile>('/delivery/profile');
    return response.data;
  },

  // GET /delivery/get-assigned-orders
  getAssignedOrders: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await axiosInstance.get<DeliveryOrder[]>('/delivery/get-assigned-orders', { params });
    return response.data;
  },

  // PATCH /delivery/update-order-status
  updateOrderStatus: async (orderId: number, status: string) => {
    const response = await axiosInstance.patch(`/delivery/update-order-status`, { orderId, status });
    return response.data;
  },

  // PATCH /delivery/update-location
  updateLocation: async (lat: number, lng: number) => {
    const response = await axiosInstance.patch('/delivery/update-location', { lat, lng });
    return response.data;
  },

  // Assumed Endpoint: POST /upload
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<{ url: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  },

  // Assumed Endpoint: PATCH /delivery/availability
  toggleAvailability: async (status: boolean) => {
    const response = await axiosInstance.patch('/delivery/availability', { isOnline: status });
    return response.data;
  },

  // Get nearby shops for registration
  getNearbyShops: async (lat: number, lng: number) => {
    // Assuming an endpoint exists or using a general shop search
    const response = await axiosInstance.get('/delivery/shops/nearby', { 
        params: { lat, lng } 
    });
    return response.data;
  }
};