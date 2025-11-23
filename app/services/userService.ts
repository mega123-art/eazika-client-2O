import axiosInstance from '@/app/lib/axios';

export interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  image: string | null;
  role: string;
  isActive: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  defaultAddressId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken?: string;
    requestId?: string;
    user?: User;
    expiresIn?: string;
  };
}

export interface RegisterPayload {
  name: string;
  phone: string;
  deviceInfo: string;
}

export interface LoginPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  requestId: string;
  otp: string;
  deviceInfo: string;
}

export interface Address {
  id: number;
  userId: number;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface AddressPayload {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  image?: string;
}

export const UserService = {
  // --- AUTHENTICATION ---

  registerUser: async (data: RegisterPayload) => {
    const response = await axiosInstance.post<AuthResponse>('/users/register', data);
    return response.data;
  },

  verifyRegistration: async (data: VerifyOtpPayload) => {
    const response = await axiosInstance.post<AuthResponse>('/users/register/verify', data);
    return response.data;
  },

  resendRegistrationOtp: async (data: RegisterPayload) => {
    const response = await axiosInstance.post<AuthResponse>('/users/register/resend', data);
    return response.data;
  },

  loginUser: async (data: LoginPayload) => {
    const response = await axiosInstance.post<AuthResponse>('/users/login', data);
    return response.data;
  },

  verifyLogin: async (data: VerifyOtpPayload) => {
    const response = await axiosInstance.post<AuthResponse>('/users/login/verify', data);
    return response.data;
  },

  resendLoginOtp: async (data: LoginPayload) => {
    const response = await axiosInstance.post<AuthResponse>('/users/login/resend', data);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/users/logout');
    return response.data;
  },
  
  refresh: async (refreshToken?: string) => {
    const response = await axiosInstance.post('/users/refresh', { refreshToken });
    return response.data;
  },

  // --- PROFILE ---

  getMe: async () => {
    const response = await axiosInstance.get<User>('/users/user/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfilePayload) => {
    const response = await axiosInstance.patch<User>('/users/user/me', data);
    return response.data;
  },

  updateProfilePicture: async (imageUrl: string) => {
    const response = await axiosInstance.patch<User>('/users/user/update-profile-picture', { image: imageUrl });
    return response.data;
  },

  // --- ADDRESSES ---

  // Assumed Endpoint: GET /users/user/addresses (Standard REST convention)
  getAddresses: async () => {
    const response = await axiosInstance.get<Address[]>('/users/user/addresses'); 
    return response.data;
  },

  addAddress: async (data: AddressPayload) => {
    const response = await axiosInstance.post<Address>('/users/user/add-new-address', data);
    return response.data;
  },

  updateAddress: async (addressId: number, data: AddressPayload) => {
    const response = await axiosInstance.patch<Address>(`/users/user/update-address/${addressId}`, data);
    return response.data;
  },

  deleteAddress: async (addressId: number) => {
    const response = await axiosInstance.delete(`/users/user/delete-address/${addressId}`);
    return response.data;
  }
};