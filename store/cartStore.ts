import { create } from "zustand";
import { cartMethods } from "@/services/customerService";
import { CartItem, AddToCartPayload, OrderPayload } from "@/types/products";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  cartCount: number;
  cartTotalAmount: number;
  fetchCart: () => Promise<void>;
  addToCart: (data: AddToCartPayload) => Promise<void>;
  removeFromCart: (itemId: number | string) => Promise<void>;
  updateQuantity: (itemId: number | string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  placeOrder: (data: OrderPayload) => Promise<void>;
}

// Helper to calculate total
const calculateTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0);

export const cartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  cartCount: 0,
  cartTotalAmount: 0,

  fetchCart: () => fetchCartData(set),
  addToCart: (data) => addToCartData(data, get, set),
  removeFromCart: (itemId) => removeFromCartData(Number(itemId), get, set),
  updateQuantity: (itemId, quantity) =>
    updateQuantityData(Number(itemId), quantity, get, set),
  clearCart: () => clearCartData(get, set),
  placeOrder: (data) => placeOrderData(data, set),
}));

type Get = () => CartState;
type Set = (
  state: Partial<CartState> | ((state: CartState) => Partial<CartState>)
) => void;

/* ============================ Actions ============================ */
const fetchCartData = async (set: Set) => {
  set({ isLoading: true });
  try {
    const data = await cartMethods.getCart();
    console.log("Fetched cart data:", data);
    const cartItems = Array.isArray(data) ? data : [];

    set({
      items: cartItems,
      cartCount: cartItems.length,
      cartTotalAmount: calculateTotal(cartItems),
    });
  } finally {
    set({ isLoading: false });
  }
};
const addToCartData = async (data: AddToCartPayload, get: Get, set: Set) => {
  set({ isLoading: true });
  try {
    if (!get().items.find((item) => item.productId === data.productId)) {
      await cartMethods.addToCart(data);
      await get().fetchCart();
    }
  } finally {
    set({ isLoading: false });
  }
};
const removeFromCartData = async (itemId: number, get: Get, set: Set) => {
  const previousItems = get().items;
  const updatedItems = previousItems.filter((i) => i.id !== itemId);

  set({
    items: updatedItems,
    cartCount: updatedItems.length,
    cartTotalAmount: calculateTotal(updatedItems),
  });

  try {
    await cartMethods.removeCartItem(itemId);
  } catch (error) {
    console.error("Failed to remove item:", error);
    // Revert if failed
    set({
      items: previousItems,
      cartCount: previousItems.length,
      cartTotalAmount: calculateTotal(previousItems),
    });
  }
};
const updateQuantityData = async (
  itemId: number,
  quantity: number,
  get: Get,
  set: Set
) => {
  if (quantity < 1) return;

  const previousItems = get().items;
  const updatedItems = previousItems.map((i) =>
    i.id === itemId ? { ...i, quantity } : i
  );

  set({
    items: updatedItems,
    cartTotalAmount: calculateTotal(updatedItems),
  });

  try {
    await cartMethods.updateCartItem(itemId, { quantity });
  } catch (error) {
    console.error("Failed to update quantity:", error);
    // Revert if failed
    set({
      items: previousItems,
      cartTotalAmount: calculateTotal(previousItems),
    });
  }
};
const clearCartData = async (get: Get, set: Set) => {
  const previousItems = get().items;
  set({ items: [], cartCount: 0, cartTotalAmount: 0 });

  try {
    await cartMethods.clearCart();
  } catch (error) {
    console.error("Failed to clear cart:", error);
    // Optionally revert, but usually clear cart isn't critical to revert unless strict
    set({
      items: previousItems,
      cartCount: previousItems.length,
      cartTotalAmount: calculateTotal(previousItems),
    });
  }
};
const placeOrderData = async (data: OrderPayload, set: Set) => {
  set({ isLoading: true });
  try {
    const order = await cartMethods.createOrder(data);
    // Clear local cart on success
    set({ items: [], cartCount: 0, cartTotalAmount: 0 });
    return order;
  } finally {
    set({ isLoading: false });
  }
};
