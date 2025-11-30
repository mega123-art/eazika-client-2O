import { create } from 'zustand';
import { CartService, CartItem, AddToCartPayload, OrderPayload } from '@/services/cartService';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (data: AddToCartPayload) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  placeOrder: (data: OrderPayload) => Promise<any>; 
  cartCount: number;
  cartTotal: number;
}

// Helper to calculate total
const calculateTotal = (items: CartItem[]) => {
  return items.reduce((total, item) => {
    const price = item.productDetails?.price || 0;
    return total + (price * item.quantity);
  }, 0);
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  cartCount: 0,
  cartTotal: 0,

  // 1. Fetch Cart (Real API)
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const data = await CartService.getCart();
      // Ensure data is an array (handle potential API variations)
      const cartItems = Array.isArray(data) ? data : [];
      
      set({ 
        items: cartItems, 
        cartCount: cartItems.length,
        cartTotal: calculateTotal(cartItems)
      });
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      // On error, assume empty or keep previous state? usually empty for safety.
      // set({ items: [], cartCount: 0, cartTotal: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. Add to Cart (Real API + Refresh)
  addToCart: async (data) => {
    set({ isLoading: true });
    try {
      await CartService.addToCart(data);
      // After adding, we must re-fetch to get the full item details (image, name) 
      // generated/populated by the server/database join.
      await get().fetchCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 3. Remove Item (Optimistic or Fetch)
  removeFromCart: async (itemId) => {
    // Optimistic Update for instant feel
    const previousItems = get().items;
    const updatedItems = previousItems.filter((i) => i.id !== itemId);
    
    set({
      items: updatedItems,
      cartCount: updatedItems.length,
      cartTotal: calculateTotal(updatedItems)
    });

    try {
      await CartService.removeCartItem(itemId);
    } catch (error) {
      console.error("Failed to remove item:", error);
      // Revert if failed
      set({ 
          items: previousItems, 
          cartCount: previousItems.length, 
          cartTotal: calculateTotal(previousItems) 
      });
    }
  },

  // 4. Update Quantity (Optimistic or Fetch)
  updateQuantity: async (itemId, quantity) => {
    if (quantity < 1) return;

    const previousItems = get().items;
    const updatedItems = previousItems.map((i) => (i.id === itemId ? { ...i, quantity } : i));
    
    set({
      items: updatedItems,
      cartTotal: calculateTotal(updatedItems)
    });

    try {
      await CartService.updateCartItem(itemId, { quantity });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      // Revert if failed
      set({ 
          items: previousItems,
          cartTotal: calculateTotal(previousItems)
      });
    }
  },

  // 5. Clear Cart
  clearCart: async () => {
    const previousItems = get().items;
    set({ items: [], cartCount: 0, cartTotal: 0 });
    
    try {
        await CartService.clearCart();
    } catch (error) {
        console.error("Failed to clear cart:", error);
        // Optionally revert, but usually clear cart isn't critical to revert unless strict
        set({ 
            items: previousItems, 
            cartCount: previousItems.length, 
            cartTotal: calculateTotal(previousItems) 
        });
    }
  },

  // 6. Place Order
  placeOrder: async (data) => {
    set({ isLoading: true });
    try {
        const order = await CartService.createOrder(data);
        // Clear local cart on success
        set({ items: [], cartCount: 0, cartTotal: 0 });
        return order;
    } catch (error) {
        console.error("Place Order Failed:", error);
        throw error;
    } finally {
        set({ isLoading: false });
    }
  }
}));