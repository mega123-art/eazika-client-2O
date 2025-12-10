import axiosInstance from "@/lib/axios";


export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
}

export const AdminService = {
  
  
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/admin/users/get-all-users`, {
      params: { page, limit },
    });
    
    return response.data.data;
  },

  
  
  getAllCategories: async () => {
    const response = await axiosInstance.get("/admin/products/get-categories");
    return response.data.data.categories;
  },

  
  
  createCategory: async (name: string, description: string) => {
    const response = await axiosInstance.post(
      "/admin/products/create-category",
      {
        name,
        description,
      }
    );
    return response.data.data;
  },

  
  
  createGlobalProduct: async (data: any) => {
    const response = await axiosInstance.post(
      "/admin/products/add-global",
      data
    );
    return response.data.data;
  },

  
  
  createGlobalProductsBulk: async (products: any[]) => {
    const response = await axiosInstance.post(
      "/admin/products/add-global-in-bluk",
      { products }
    );
    return response.data.data;
  },
};
