import axiosInstance from "@/lib/axios";
import axios from "@/lib/axios";
import { ProductDetailType } from "@/types";
import type {
  CreateShopPayload,
  NewProductFormData,
  ProductPriceType,
  ShopProductListType,
  GlobalProductListType,
  OrderDetail,
} from "@/types/shop";

// Added imports for the specific icons requested
import {
  ShoppingBasket,
  Smartphone,
  Sofa,
  Shirt,
  Cake,
  Refrigerator,
  Boxes,
} from "lucide-react";

// --- Interfaces ---

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
  status:
    | "pending"
    | "preparing"
    | "ready"
    | "shipped"
    | "delivered"
    | "cancelled";
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
  status: "available" | "busy" | "offline";
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

// export interface Category {
//   id: number | string;
//   name: string;
//   slug: string;
//   image?: string;
//   icon?: any;
//   itemCount?: number;
// }

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
    const response = await axios.post("/shops/create-shop", data);
    return response.data;
  },

  updateShop: async (data: Partial<CreateShopPayload>) => {
    const response = await axios.put("/shops/update-shop", data);
    return response.data;
  },

  getShopProfile: async () => {
    const response = await axios.get<ShopProfile>("/shops/profile");
    return response.data;
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post<{ url: string }>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url;
  },

  // --- PRODUCT MANAGEMENT ---

  getInventory: async () => {
    try {
      const response = await axios.get<ShopProduct[]>("/shops/products");
      return response.data;
    } catch (error) {
      console.warn(
        "Access denied or Endpoint Missing (Inventory). Returning Empty."
      );
      return [];
    }
  },

  getProductById: async (id: number) => {
    try {
      const response = await axios.get<ShopProduct>(
        `/customers/products/${id}`
      );
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
        images: [],
      } as ShopProduct;
    }
  },

  getTrendingProducts: async () => {
    const response = await axios.get<ShopProduct[]>("/products/trending");
    return response.data;
  },

  // --- Additional Product Management Methods ---

  getCategories: async () => {
    const response = await axios.get("/shops/products/get-all-categories");
    return response.data.data;
  },

  getShopProducts: async (): Promise<ShopProductListType> => {
    const response = await axios.get("/shops/products/get-all-product");
    return response.data.data;
  },

  getGlobalProducts: async (): Promise<GlobalProductListType> => {
    const response = await axios.get("/shops/products/get-all-global-product");
    return response.data.data;
  },

  addProduct: async (data: NewProductFormData) => {
    const response = await axios.post("/shops/products/add-shop-product", data);
    return response.data.data;
  },

  updateStock: async (productId: number, data: ProductPriceType) => {
    const response = await axiosInstance.put(
      `/shops/products//update-shop-product-stock-and-price/${productId}`,
      data
    );
    return response.data.data;
  },

  updateProductDetails: async (
    productId: number,
    data: Partial<UpdateProductPayload>
  ) => {
    const response = await axiosInstance.put(
      `/shops/update-shop-product/${productId}`,
      data
    );
    return response.data;
  },

  deleteProduct: async (productId: number) => {
    const response = await axiosInstance.delete(
      `/shops/products/delete-shop-product/${productId}`
    );
    return response.data.data;
  },

  // --- ORDER MANAGEMENT ---
  getShopOrders: async (page: number | string, limit: number | string) => {
    const response = await axios.get(
      `/shops/get-shop-orders?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  getShopOrderById: async (id: number | string): Promise<OrderDetail> => {
    const response = await axios.get(`/shops/orders/order/${id}`);
    // console.log("Order Detail Response:", response);
    return response.data.data.order;
  },

  updateOrderStatus: async (
    id: OrderDetail["id"],
    status: OrderDetail["status"],
    rider: number | string | null = null
  ) => {
    // If rider is provided, use assign-order
    if (rider) {
      const response = await axiosInstance.post(
        `/shops/assign-order`,
        { orderId: id, deliveryBoyId: rider }
      );
      return response.data.data;
    }
    
    const response = await axios.patch(`/shops/update-order-status`, {
      orderId: id,
      status,
    });
    return response.data.data;
  },

  // --- RIDER MANAGEMENT ---
  getShopRiders: async () => {
    const response = await axiosInstance.get<ShopRider[]>("/shops/riders");
    return response.data;
  },

  searchUserByPhone: async (phone: string) => {
    const response = await axiosInstance.get<UserProfile>("/shops/get-user", {
      params: { phone },
    });
    return response.data;
  },

  sendRiderInvite: async (userId: number) => {
    const response = await axiosInstance.patch(
      "/shops/send-invite-to-delivery",
      { userId }
    );
    return response.data;
  },

  assignRider: async (orderId: number | string, riderId: number | string) => {
    const response = await axiosInstance.post(
      `/shops/assign-order`,
      { orderId, deliveryBoyId: riderId }
    );
    return response.data.data;
  },

  removeRider: async (riderId: number) => {
    const response = await axiosInstance.delete(`/shops/riders/${riderId}`);
    return response.data;
  },

  // --- ANALYTICS ---
  getAnalytics: async (range: string) => {
    const response = await axiosInstance.get<ShopAnalytics>(
      "/shops/analytics",
      { params: { range } }
    );
    return response.data;
  },
};

export default ShopService;
export { ShopService as shopService };
