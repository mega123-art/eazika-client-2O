import axiosInstance from '@/app/lib/axios';

// --- 1. COMMON INTERFACES ---

export interface BankDetail {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  bankPassbookImage: string;
}

export interface ShopDocuments {
  aadharImage: string;
  electricityBillImage: string;
  businessCertificateImage: string;
  panImage: string;
}

// --- 2. SHOP & PROFILE PAYLOADS ---

export interface CreateShopPayload {
  shopName: string;
  shopCategory: string;
  shopImage: string[];
  fssaiNumber: string;
  gstNumber: string;
  bankDetail: BankDetail;
  documents: ShopDocuments;
}

export interface ShopProfile extends CreateShopPayload {
  id: number;
  userId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- 3. PRODUCT INTERFACES ---

export interface ProductPrice {
  id?: number;
  price: number;
  discount: number;
  weight: number;
  unit: string;
  currency: string;
}

export interface AddProductPayload {
  productCategoryId: number;
  globalProductId: number; // 0 if custom
  isGlobalProduct: boolean;
  name: string;
  description: string;
  images: string[];
  stock: number;
  prices: ProductPrice[];
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  images?: string[];
  isActive?: boolean;
}

export interface ShopProduct {
  id: number;
  name: string;
  description: string;
  images: string[];
  stock: number;
  isActive: boolean;
  isGlobal: boolean;
  category: string;
  // Mapped for UI convenience, usually derived from 'prices' array
  price: number; 
  prices?: ProductPrice[]; 
}

// --- 4. ORDER INTERFACES ---

export interface ShopOrder {
  id: number;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  itemCount: number;
  createdAt: string;
  paymentMethod: string;
}

export interface ShopOrderDetail extends ShopOrder {
  customerId: number;
  customerPhone: string;
  address: string;
  products: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  driver?: {
    id: number;
    name: string;
    phone: string;
  };
}

// --- 5. RIDER INTERFACES ---

export interface ShopRider {
  id: number;
  name: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  activeOrders: number;
  image?: string;
  totalDeliveries?: number;
  rating?: number;
}

export interface UserProfile {
  id: number;
  name: string;
  phone: string;
  email: string;
  image: string;
  role: string;
}


// ==========================================
//              SERVICE IMPLEMENTATION
// ==========================================

export const ShopService = {
  
  // --- SHOP MANAGEMENT ---

  // POST /shops/create-shop
  createShop: async (data: CreateShopPayload) => {
    const response = await axiosInstance.post('/shops/create-shop', data);
    return response.data;
  },

  // PUT /shops/update-shop
  updateShop: async (data: Partial<CreateShopPayload>) => {
    const response = await axiosInstance.put('/shops/update-shop', data);
    return response.data;
  },

  // GET /shops/profile (Assumed Endpoint - Required for Profile Page)
  getShopProfile: async () => {
    // NOTE: Endpoint assumed based on standard REST practices
    const response = await axiosInstance.get<ShopProfile>('/shops/profile');
    return response.data;
  },

  // POST /upload (Assumed Endpoint for Images)
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<{ url: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  },

  // --- PRODUCT MANAGEMENT ---

  // GET /shops/products (Assumed Endpoint - Required for Products Page)
  getInventory: async () => {
    const response = await axiosInstance.get<ShopProduct[]>('/shops/products');
    return response.data;
  },

  // GET /products/global (Assumed Endpoint - Required for Global Catalog Tab)
  getGlobalCatalog: async () => {
    const response = await axiosInstance.get<ShopProduct[]>('/products/global');
    return response.data;
  },

  // POST /shops/add-shop-product
  addProduct: async (data: any) => {
    // Transforming UI data to API Payload structure if needed
    const payload: AddProductPayload = {
        productCategoryId: data.productCategoryId || 1,
        globalProductId: data.globalProductId || 0,
        isGlobalProduct: data.isGlobalProduct || false,
        name: data.name,
        description: data.description,
        images: data.images,
        stock: Number(data.stock),
        prices: [{
            price: Number(data.price),
            discount: 0,
            weight: 1,
            unit: 'kg',
            currency: 'INR'
        }]
    };
    const response = await axiosInstance.post('/shops/add-shop-product', payload);
    return response.data;
  },

  // PUT /shops/update-shop-product-stock/{productId}
  updateStock: async (productId: number, stock: number) => {
    const response = await axiosInstance.put(`/shops/update-shop-product-stock/${productId}`, { stock });
    return response.data;
  },

  // PUT /shops/update-shop-product/{productId}
  updateProductDetails: async (productId: number, data: Partial<UpdateProductPayload>) => {
    const response = await axiosInstance.put(`/shops/update-shop-product/${productId}`, data);
    return response.data;
  },

  // DELETE /shops/products/{id} (Assumed Endpoint)
  deleteProduct: async (productId: number) => {
    const response = await axiosInstance.delete(`/shops/products/${productId}`);
    return response.data;
  },

  // --- ORDER MANAGEMENT ---
  
  // GET /shops/orders (Assumed Endpoint - Required for Orders List)
  getShopOrders: async (status?: string) => {
    const params = status && status !== 'all' ? { status } : {};
    const response = await axiosInstance.get<ShopOrder[]>('/shops/orders', { params });
    return response.data;
  },

  // GET /shops/orders/{id} (Assumed Endpoint - Required for Order Details)
  getShopOrderById: async (id: number) => {
    const response = await axiosInstance.get<ShopOrderDetail>(`/shops/orders/${id}`);
    return response.data;
  },

  // PUT /shops/orders/{id}/status (Assumed Endpoint)
  updateOrderStatus: async (id: number, status: string) => {
    const response = await axiosInstance.put(`/shops/orders/${id}/status`, { status });
    return response.data;
  },

  // --- RIDER MANAGEMENT ---

  // GET /shops/riders (Assumed Endpoint)
  getShopRiders: async () => {
    const response = await axiosInstance.get<ShopRider[]>('/shops/riders');
    return response.data;
  },

  // GET /shops/get-user?phone=...
  searchUserByPhone: async (phone: string) => {
    const response = await axiosInstance.get<UserProfile>('/shops/get-user', { params: { phone } });
    return response.data;
  },

  // PATCH /shops/send-invite-to-delivery
  sendRiderInvite: async (userId: number) => {
    const response = await axiosInstance.patch('/shops/send-invite-to-delivery', { userId });
    return response.data;
  },

  // POST /shops/orders/{orderId}/assign (Assumed Endpoint)
  assignRider: async (orderId: number, riderId: number) => {
    const response = await axiosInstance.post(`/shops/orders/${orderId}/assign`, { riderId });
    return response.data;
  },

  // DELETE /shops/riders/{riderId} (Assumed Endpoint)
  removeRider: async (riderId: number) => {
    const response = await axiosInstance.delete(`/shops/riders/${riderId}`);
    return response.data;
  },

  // --- ANALYTICS ---

  // GET /shops/analytics (Assumed Endpoint)
  getAnalytics: async (range: string) => {
    const response = await axiosInstance.get('/shops/analytics', { params: { range } });
    return response.data;
  }
};