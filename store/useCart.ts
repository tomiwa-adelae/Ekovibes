import { create } from 'zustand';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, type Cart, type CartItem } from '@/lib/vault-api';

interface CartStore {
  cart: Cart | null;
  loading: boolean;
  _hasHydrated: boolean;
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  itemCount: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  cart: null,
  loading: false,
  _hasHydrated: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const cart = await getCart();
      set({ cart, _hasHydrated: true });
    } catch {
      set({ _hasHydrated: true });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (variantId, quantity) => {
    const cart = await addToCart(variantId, quantity);
    set({ cart });
  },

  updateItem: async (itemId, quantity) => {
    await updateCartItem(itemId, quantity);
    await get().fetchCart();
  },

  removeItem: async (itemId) => {
    await removeCartItem(itemId);
    set((state) => ({
      cart: state.cart
        ? { ...state.cart, items: state.cart.items.filter((i) => i.id !== itemId) }
        : null,
    }));
  },

  clear: async () => {
    await clearCart();
    set((state) => ({ cart: state.cart ? { ...state.cart, items: [] } : null }));
  },

  itemCount: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
