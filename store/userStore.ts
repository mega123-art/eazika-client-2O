import { create } from "zustand";
// import { persist } from "zustand/middleware";
import type { User, Address, NewAddressPayload } from "@/types/user";
import { userService } from "@/services/userService";

interface UserState {
  user: User | null;
  addresses: Address[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // // Actions
  fetchUser: () => Promise<void>;
  updateUser: (data: User) => Promise<void>;
  addNewAddress: (address: NewAddressPayload) => Promise<Address>;
  logout: () => Promise<void>;
  // setAuthToken: (token: string, role?: string) => void;
}

export const userStore = create<UserState>((set, get) => ({
  user: null,
  addresses: [],
  isAuthenticated: false,
  isLoading: false,

  fetchUser: () => fetchUserData(set),
  updateUser: (data: User) => updateUserData(data, set),
  addNewAddress: (address: NewAddressPayload) =>
    addNewAddressData(address, get),
  logout: async () => logoutUser(set),
  // setAuthToken: () => setAuthTokenData("", undefined, set),
}));
type Get = () => UserState;
type Set = (
  state: Partial<UserState> | ((state: UserState) => Partial<UserState>)
) => void;
/* ============================ Actions ============================ */

const fetchUserData = async (set: Set) => {
  set({ isLoading: true });
  try {
    const data = await userService.getMe();
    console.log("Fetched User Data:", data);
    set({ user: data, isAuthenticated: true, addresses: data.addresses || [] });
  } finally {
    set({ isLoading: false });
  }
};

const updateUserData = async (data: User, set: Set) => {
  set({ isLoading: true });
  try {
    const updatedUser = await userService.updateProfile(data);
    set({ user: updatedUser });
  } finally {
    set({ isLoading: false });
  }
};

const addNewAddressData = async (
  address: NewAddressPayload,
  get: Get
): Promise<Address> => {
  const addr = await userService.addAddress(address);
  await get().fetchUser();
  return addr;
};

const logoutUser = async (set: Set) => {
  set({ isLoading: true });
  try {
    await userService.logout();
    set({ user: null, isAuthenticated: false });
  } finally {
    set({ isLoading: false });
  }
};

// const setAuthTokenData = (token: string, set: Set) => {
//   if (token) {
//     set({ isAuthenticated: true });
//   } else {
//     set({ isAuthenticated: false, user: null });
//   }
// };
