import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  discount: number;
  image: string;
  quantity: number;
  isGift?: boolean;
  giftMessage?: string;
  giftRecipient?: string;
  giftCharge?: number;
}

interface DrawerState {
  isOpen: boolean;
  content: React.ReactNode;
  openDrawer: (content: React.ReactNode) => void;
  closeDrawer: () => void;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  content: null,
  openDrawer: (content) => set({ isOpen: true, content }),
  closeDrawer: () => set({ isOpen: false, content: null }),
}));

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);
        if (existingItem) {
          existingItem.quantity += item.quantity;
          set({ items: [...items] });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) => {
        const items = get().items.map((i) => (i.id === id ? { ...i, quantity } : i));
        set({ items });
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const finalPrice = item.price - (item.price * item.discount) / 100;
          const giftCharge = item.giftCharge || 0;
          return total + (finalPrice + giftCharge) * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: typeof window !== 'undefined' ? {
        getItem: (key) => {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        },
        setItem: (key, value) => {
          localStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => {
          localStorage.removeItem(key);
        },
      } : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    }
  )
);
