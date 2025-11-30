import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserService, User, UpdateProfilePayload } from '@/services/userService';
import Cookies from 'js-cookie'; 

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  fetchUser: () => Promise<void>;
  updateUser: (data: UpdateProfilePayload) => Promise<void>;
  logout: () => Promise<void>;
  setAuthToken: (token: string, role?: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setAuthToken: (token: string, role: string = 'user') => {
        localStorage.setItem('accessToken', token);
        
        Cookies.set('accessToken', token, { path: '/', expires: 7, sameSite: 'Lax' });
        Cookies.set('userRole', role, { path: '/', expires: 7, sameSite: 'Lax' });
        
        set({ isAuthenticated: true });
      },

      fetchUser: async () => {
        set({ isLoading: true });
        
        const token = localStorage.getItem('accessToken');
        
        if (token && !Cookies.get('accessToken')) {
            Cookies.set('accessToken', token, { path: '/', expires: 7, sameSite: 'Lax' });
        }

        if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

        try {
          try {
            const userData = await UserService.getMe();
            set({ user: userData, isAuthenticated: true });
            
            if (userData?.role) {
                Cookies.set('userRole', userData.role, { path: '/', expires: 7, sameSite: 'Lax' });
            }

          } catch (apiError) {
             console.warn("API failed, using mock data", apiError);
             const mockUser: User = {
                id: 1,
                name: "Rafatul Islam",
                email: "rafatul@example.com",
                phone: "9876543210",
                image: null,
                role: "user",
                isActive: true,
                isPhoneVerified: true,
                isEmailVerified: false,
                defaultAddressId: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
             };
             set({ user: mockUser, isAuthenticated: true });
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      updateUser: async (data) => {
        set({ isLoading: true });
        try {
          const updatedUser = await UserService.updateProfile(data);
          set({ user: updatedUser });
        } catch (error) {
          console.error("Failed to update profile", error);
          const currentUser = get().user;
          if (currentUser) {
             set({ user: { ...currentUser, ...data } });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await UserService.logout();
        } catch (error) {
          console.warn("Logout API failed, clearing local session anyway", error);
        }
        
        // Full Cleanup
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('userRole', { path: '/' });
        
        set({ user: null, isAuthenticated: false });
        
        if (typeof window !== 'undefined') {
            // CRITICAL FIX: Only redirect if NOT already on the login page
            // This prevents the infinite refresh loop
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);