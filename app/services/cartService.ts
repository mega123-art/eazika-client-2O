import axiosInstance from '@/app/lib/axios';

// --- Types ---

export interface CartItem {
  id: number;
  userId: number;
  shopProductId: number;
  productPriceId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  productDetails?: {
    name: string;
    image: string;
    price: number;
  };
}

export interface OrderItem {
  id: number;
  shopProductId: number;
  productPriceId: number;
  quantity: number;
  orderId: number;
  productDetails?: {
    name: string;
    image: string;
    price: number;
  };
}

export interface Order {
  id: number;
  userId: number;
  assignedDeliveryBoyId?: number;
  totalProducts: number;
  totalAmount: number;
  addressId: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  cancelBy?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export interface TrackingDetails {
  orderId: number;
  status: string;
  currentLocation: string;
  estimatedDelivery: string;
  deliveryBoy?: {
    name: string;
    phone: string;
    vehicle?: string;
    rating?: number;
  };
}

export interface AddToCartPayload {
  shopProductId: number;
  productPriceId: number;
  quantity: number;
}

export interface UpdateCartPayload {
  quantity: number;
}

export interface OrderPayload {
  addressId: number;
  paymentMethod: string;
}

export const CartService = {
  addToCart: async (data: AddToCartPayload) => {
    const response = await axiosInstance.post('/customers/add-to-cart', data);
    return response.data;
  },

  getCart: async () => {
    const response = await axiosInstance.get<CartItem[]>('/customers/get-cart');
    return response.data;
  },

  updateCartItem: async (itemId: number, data: UpdateCartPayload) => {
    const response = await axiosInstance.put(`/customers/update-cart-item/${itemId}`, data);
    return response.data;
  },

  removeCartItem: async (itemId: number) => {
    const response = await axiosInstance.delete(`/customers/remove-cart-item/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await axiosInstance.delete('/customers/clear-cart');
    return response.data;
  },

  createOrder: async (data: OrderPayload) => {
    const response = await axiosInstance.post('/customers/create-order', data);
    return response.data;
  },

  getOrders: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await axiosInstance.get<Order[]>('/customers/get-orders', { params });
    return response.data;
  },

  getOrderById: async (orderId: number) => {
    const response = await axiosInstance.get<Order>(`/customers/get-order/${orderId}`);
    return response.data;
  },

  trackOrder: async (orderId: number) => {
    const response = await axiosInstance.get<TrackingDetails>(`/customers/track-order/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId: number, reason: string) => {
    const response = await axiosInstance.put(`/customers/cancel-order-by-customer/${orderId}`, { reason });
    return response.data;
  }
};