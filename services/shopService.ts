import axiosInstance from '@/lib/axios';
// Added imports for the specific icons requested
import { ShoppingBasket, Smartphone, Sofa, Shirt, Cake, Refrigerator, Boxes } from 'lucide-react';

// --- Interfaces ---

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
  globalProductId: number;
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
  price: number; 
  prices?: ProductPrice[]; 
  rating?: number;
  isTrending?: boolean;
}

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

export interface Category {
  id: number | string;
  name: string;
  slug: string;
  image?: string;
  icon?: any;
  itemCount?: number;
}

export interface ShopAnalytics {
  revenueChart: { label: string; value: number }[];
  ordersChart: { label: string; value: number }[];
  metrics: {
    revenue: string;
    orders: string;
    customers: string;
    aov: string;
    revenueTrend?: string;
    ordersTrend?: string;
    customersTrend?: string;
    aovTrend?: string;
  };
  products: {
    name: string;
    sales: number;
    revenue: string;
  }[];
}

// --- Service Implementation ---

export const ShopService = {
  
  // --- SHOP MANAGEMENT ---
  createShop: async (data: CreateShopPayload) => {
    const response = await axiosInstance.post('/shops/create-shop', data);
    return response.data;
  },

  updateShop: async (data: Partial<CreateShopPayload>) => {
    const response = await axiosInstance.put('/shops/update-shop', data);
    return response.data;
  },

  getShopProfile: async () => {
    const response = await axiosInstance.get<ShopProfile>('/shops/profile');
    return response.data;
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<{ url: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  },

  // --- PRODUCT MANAGEMENT ---

  getInventory: async () => {
    try {
        const response = await axiosInstance.get<ShopProduct[]>('/shops/products');
        return response.data;
    } catch (error) {
        console.warn("Access denied or Endpoint Missing (Inventory). Returning Empty.");
        return [];
    }
  },

  getAllProducts: async () => {
    try {
        const response = await axiosInstance.get<ShopProduct[]>('/products'); 
        return response.data;
    } catch (error) {
        console.warn("Failed to fetch public products, trying global catalog fallback...");
        return ShopService.getGlobalCatalog();
    }
  },

  getGlobalCatalog: async () => {
    try {
        const response = await axiosInstance.get<ShopProduct[]>('/products/global');
        return response.data;
    } catch (error) {
         console.warn("Global Catalog 404. Using Static Mock.");
         return [
            { id: 101, name: 'Coca Cola (750ml)', description: 'Carbonated drink', price: 40, stock: 0, isActive: true, isGlobal: true, images: ['https://placehold.co/400x400?text=Coke'], category: 'Beverages' },
            { id: 102, name: 'Lays Classic Salted', description: 'Potato chips', price: 20, stock: 0, isActive: true, isGlobal: true, images: ['https://placehold.co/400x400?text=Lays'], category: 'Snacks' },
         ] as ShopProduct[];
    }
  },

  getProductById: async (id: number) => {
    try {
        const response = await axiosInstance.get<ShopProduct>(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.warn(`Product ${id} not found. Returning placeholder.`);
        return {
            id: id,
            name: "Product Not Found",
            description: "This product details could not be loaded.",
            price: 0,
            stock: 0,
            isActive: false,
            isGlobal: false,
            category: "Unknown",
            images: []
        } as ShopProduct;
    }
  },

  getTrendingProducts: async () => {
    const response = await axiosInstance.get<ShopProduct[]>('/products/trending');
    return response.data;
  },

  // UPDATED: Get All Categories with requested list
  getCategories: async () => {
    // Using the specific static list you requested
    return [
      { id: 'cat-01', name: 'Grocery',          slug: 'grocery',          icon: ShoppingBasket },
      { id: 'cat-02', name: 'Electronics',      slug: 'electronics',      icon: Smartphone },
      { id: 'cat-03', name: 'Furniture',        slug: 'furniture',        icon: Sofa },
      { id: 'cat-04', name: 'Clothing',         slug: 'clothing',         icon: Shirt },
      { id: 'cat-05', name: 'Bakery',           slug: 'bakery',           icon: Cake },
      { id: 'cat-06', name: 'Home Appliances',  slug: 'home-appliances',  icon: Refrigerator },
      { id: 'cat-07', name: 'Others',            slug: 'others',           icon: Boxes },
    ] as Category[];
  },

  addProduct: async (data: any) => {
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

  updateStock: async (productId: number, stock: number) => {
    const response = await axiosInstance.put(`/shops/update-shop-product-stock/${productId}`, { stock });
    return response.data;
  },

  updateProductDetails: async (productId: number, data: Partial<UpdateProductPayload>) => {
    const response = await axiosInstance.put(`/shops/update-shop-product/${productId}`, data);
    return response.data;
  },

  deleteProduct: async (productId: number) => {
    const response = await axiosInstance.delete(`/shops/products/${productId}`);
    return response.data;
  },

  // --- ORDER MANAGEMENT ---
  getShopOrders: async (status?: string) => {
    const params = status && status !== 'all' ? { status } : {};
    const response = await axiosInstance.get<ShopOrder[]>('/shops/orders', { params });
    return response.data;
  },

  getShopOrderById: async (id: number) => {
    const response = await axiosInstance.get<ShopOrderDetail>(`/shops/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await axiosInstance.put(`/shops/orders/${id}/status`, { status });
    return response.data;
  },

  // --- RIDER MANAGEMENT ---
  getShopRiders: async () => {
    const response = await axiosInstance.get<ShopRider[]>('/shops/riders');
    return response.data;
  },

  searchUserByPhone: async (phone: string) => {
    const response = await axiosInstance.get<UserProfile>('/shops/get-user', { params: { phone } });
    return response.data;
  },

  sendRiderInvite: async (userId: number) => {
    const response = await axiosInstance.patch('/shops/send-invite-to-delivery', { userId });
    return response.data;
  },

  assignRider: async (orderId: number, riderId: number) => {
    const response = await axiosInstance.post(`/shops/orders/${orderId}/assign`, { riderId });
    return response.data;
  },

  removeRider: async (riderId: number) => {
    const response = await axiosInstance.delete(`/shops/riders/${riderId}`);
    return response.data;
  },

  // --- ANALYTICS ---
  getAnalytics: async (range: string) => {
    const response = await axiosInstance.get<ShopAnalytics>('/shops/analytics', { params: { range } });
    return response.data;
  }
};