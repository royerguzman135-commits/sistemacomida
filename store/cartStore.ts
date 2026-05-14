import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string // ID único para este elemento en el carrito
  dishId: string
  name: string
  price: number // Precio final ya sumando las opciones
  quantity: number
  resumen_opciones: string
  image: string
  comercioId?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          // Si el platillo exactamente igual (con las mismas opciones) ya está en el carrito, aumentamos la cantidad
          const existingItemIndex = state.items.findIndex(
            (i) => i.dishId === item.dishId && i.resumen_opciones === item.resumen_opciones
          )
          
          if (existingItemIndex >= 0) {
            const newItems = [...state.items]
            newItems[existingItemIndex].quantity += item.quantity
            return { items: newItems }
          }
          
          // Si es nuevo o tiene opciones diferentes, lo agregamos como un nuevo elemento
          return { items: [...state.items, item] }
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'sabor-local-cart', // Clave que se usará en localStorage
    }
  )
)
