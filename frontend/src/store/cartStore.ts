import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  imagen_url: string;
  stock: number;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  agregar: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) => {
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.producto_id);
          if (existente) {
            const nuevaCantidad = Math.min(existente.cantidad + cantidad, producto.stock);
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.producto_id
                  ? { ...i, cantidad: nuevaCantidad, stock: producto.stock, precio_unitario: producto.precio_unitario }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...producto, cantidad: Math.min(cantidad, producto.stock) }],
          };
        });
      },

      quitar: (productoId) => {
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== productoId),
        }));
      },

      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(productoId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === productoId
              ? { ...i, cantidad: Math.min(cantidad, i.stock) }
              : i
          ),
        }));
      },

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0),

      cantidadTotal: () =>
        get().items.reduce((acc, item) => acc + item.cantidad, 0),
    }),
    {
      name: 'foodstore-cart',
    }
  )
);