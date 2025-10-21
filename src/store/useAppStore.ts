import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types de base
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'vendor' | 'customer';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  isActive: boolean;
  settings: StoreSettings;
}

interface StoreSettings {
  currency: string;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  isActive: boolean;
  inventory: number;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

// Interface du store principal
interface AppState {
  // État de l'utilisateur
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // État de la boutique
  currentStore: Store | null;
  stores: Store[];
  
  // État des produits
  products: Product[];
  featuredProducts: Product[];
  categories: string[];
  
  // État du panier
  cart: CartItem[];
  cartTotal: number;
  cartItemCount: number;
  
  // État des commandes
  orders: Order[];
  currentOrder: Order | null;
  
  // État de l'interface
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  notifications: Notification[];
  
  // Actions utilisateur
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  // Actions boutique
  setCurrentStore: (store: Store) => void;
  createStore: (storeData: Omit<Store, 'id'>) => Promise<void>;
  updateStore: (storeId: string, updates: Partial<Store>) => Promise<void>;
  
  // Actions produits
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  
  // Actions panier
  addToCart: (product: Product, quantity?: number, variants?: Record<string, string>) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Actions commandes
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Actions interface
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (notificationId: string) => void;
  
  // Actions utilitaires
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Store principal avec Zustand
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // État initial
        user: null,
        isAuthenticated: false,
        isLoading: false,
        currentStore: null,
        stores: [],
        products: [],
        featuredProducts: [],
        categories: [],
        cart: [],
        cartTotal: 0,
        cartItemCount: 0,
        orders: [],
        currentOrder: null,
        theme: 'auto',
        sidebarOpen: false,
        notifications: [],

        // Actions utilisateur
        setUser: (user) => set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
        }),

        login: async (email, password) => {
          set((state) => {
            state.isLoading = true;
          });
          
          try {
            // Simulation de l'authentification
            // Ici vous intégrerez avec Supabase Auth
            const user: User = {
              id: '1',
              email,
              name: email.split('@')[0],
              role: 'customer',
              isVerified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
            });
            throw error;
          }
        },

        logout: () => set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.currentStore = null;
          state.stores = [];
          state.cart = [];
          state.cartTotal = 0;
          state.cartItemCount = 0;
          state.orders = [];
          state.currentOrder = null;
        }),

        updateProfile: async (updates) => {
          const { user } = get();
          if (!user) return;
          
          set((state) => {
            if (state.user) {
              state.user = { ...state.user, ...updates };
            }
          });
        },

        // Actions boutique
        setCurrentStore: (store) => set((state) => {
          state.currentStore = store;
        }),

        createStore: async (storeData) => {
          const newStore: Store = {
            ...storeData,
            id: Date.now().toString(),
          };
          
          set((state) => {
            state.stores.push(newStore);
            if (!state.currentStore) {
              state.currentStore = newStore;
            }
          });
        },

        updateStore: async (storeId, updates) => {
          set((state) => {
            const storeIndex = state.stores.findIndex(s => s.id === storeId);
            if (storeIndex !== -1) {
              state.stores[storeIndex] = { ...state.stores[storeIndex], ...updates };
            }
            if (state.currentStore?.id === storeId) {
              state.currentStore = { ...state.currentStore, ...updates };
            }
          });
        },

        // Actions produits
        setProducts: (products) => set((state) => {
          state.products = products;
          state.featuredProducts = products.filter(p => p.isActive).slice(0, 8);
          state.categories = [...new Set(products.map(p => p.category))];
        }),

        addProduct: (product) => set((state) => {
          state.products.push(product);
          if (product.isActive && state.featuredProducts.length < 8) {
            state.featuredProducts.push(product);
          }
          if (!state.categories.includes(product.category)) {
            state.categories.push(product.category);
          }
        }),

        updateProduct: (productId, updates) => set((state) => {
          const productIndex = state.products.findIndex(p => p.id === productId);
          if (productIndex !== -1) {
            state.products[productIndex] = { ...state.products[productIndex], ...updates };
          }
        }),

        deleteProduct: (productId) => set((state) => {
          state.products = state.products.filter(p => p.id !== productId);
          state.featuredProducts = state.featuredProducts.filter(p => p.id !== productId);
        }),

        // Actions panier
        addToCart: (product, quantity = 1, variants) => {
          set((state) => {
            const existingItemIndex = state.cart.findIndex(
              item => item.product.id === product.id && 
              JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
            );
            
            if (existingItemIndex !== -1) {
              state.cart[existingItemIndex].quantity += quantity;
            } else {
              state.cart.push({
                product,
                quantity,
                selectedVariants: variants
              });
            }
            
            // Recalculer le total
            state.cartTotal = state.cart.reduce((total, item) => 
              total + (item.product.price * item.quantity), 0
            );
            state.cartItemCount = state.cart.reduce((count, item) => count + item.quantity, 0);
          });
        },

        removeFromCart: (productId) => {
          set((state) => {
            state.cart = state.cart.filter(item => item.product.id !== productId);
            
            // Recalculer le total
            state.cartTotal = state.cart.reduce((total, item) => 
              total + (item.product.price * item.quantity), 0
            );
            state.cartItemCount = state.cart.reduce((count, item) => count + item.quantity, 0);
          });
        },

        updateCartItemQuantity: (productId, quantity) => {
          set((state) => {
            const item = state.cart.find(item => item.product.id === productId);
            if (item) {
              if (quantity <= 0) {
                state.cart = state.cart.filter(item => item.product.id !== productId);
              } else {
                item.quantity = quantity;
              }
              
              // Recalculer le total
              state.cartTotal = state.cart.reduce((total, item) => 
                total + (item.product.price * item.quantity), 0
              );
              state.cartItemCount = state.cart.reduce((count, item) => count + item.quantity, 0);
            }
          });
        },

        clearCart: () => set((state) => {
          state.cart = [];
          state.cartTotal = 0;
          state.cartItemCount = 0;
        }),

        // Actions commandes
        createOrder: async (orderData) => {
          const newOrder: Order = {
            ...orderData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          set((state) => {
            state.orders.unshift(newOrder);
            state.currentOrder = newOrder;
            // Vider le panier après commande
            state.cart = [];
            state.cartTotal = 0;
            state.cartItemCount = 0;
          });
        },

        updateOrderStatus: (orderId, status) => {
          set((state) => {
            const order = state.orders.find(o => o.id === orderId);
            if (order) {
              order.status = status;
              order.updatedAt = new Date().toISOString();
            }
          });
        },

        // Actions interface
        setTheme: (theme) => set((state) => {
          state.theme = theme;
        }),

        toggleSidebar: () => set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            duration: notification.duration || 5000
          };
          
          set((state) => {
            state.notifications.push(newNotification);
          });
          
          // Auto-suppression après la durée spécifiée
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, newNotification.duration);
        },

        removeNotification: (notificationId) => {
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== notificationId);
          });
        },

        // Actions utilitaires
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),

        reset: () => set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.currentStore = null;
          state.stores = [];
          state.products = [];
          state.featuredProducts = [];
          state.categories = [];
          state.cart = [];
          state.cartTotal = 0;
          state.cartItemCount = 0;
          state.orders = [];
          state.currentOrder = null;
          state.theme = 'auto';
          state.sidebarOpen = false;
          state.notifications = [];
        })
      })),
      {
        name: 'payhuk-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          theme: state.theme,
          cart: state.cart,
          cartTotal: state.cartTotal,
          cartItemCount: state.cartItemCount
        })
      }
    ),
    {
      name: 'payhuk-store'
    }
  )
);

// Hooks sélecteurs pour optimiser les performances
export const useUser = () => useAppStore(state => state.user);
export const useIsAuthenticated = () => useAppStore(state => state.isAuthenticated);
export const useCurrentStore = () => useAppStore(state => state.currentStore);
export const useProducts = () => useAppStore(state => state.products);
export const useCart = () => useAppStore(state => ({
  items: state.cart,
  total: state.cartTotal,
  itemCount: state.cartItemCount
}));
export const useTheme = () => useAppStore(state => state.theme);
export const useNotifications = () => useAppStore(state => state.notifications);
