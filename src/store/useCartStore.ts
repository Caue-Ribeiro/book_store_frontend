import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartBook {
    id: string
    title: string
    price: number
    coverImageUrl?: string
}

export interface CartItem {
    book: CartBook
    quantity: number
}

interface CartState {
    items: CartItem[]
    addItem: (book: CartBook, quantity?: number) => void
    removeItem: (bookId: string) => void
    updateQuantity: (bookId: string, quantity: number) => void
    clearCart: () => void
    getTotalItems: () => number
    setCartItems: (items: CartItem[]) => void
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (book, quantity = 1) =>
                set(state => {
                    const existingItem = state.items.find(
                        item => item.book.id === book.id,
                    )

                    if (existingItem) {
                        return {
                            items: state.items.map(item =>
                                item.book.id === book.id
                                    ? {
                                          ...item,
                                          quantity: item.quantity + quantity,
                                      }
                                    : item,
                            ),
                        }
                    }

                    return { items: [...state.items, { book, quantity }] }
                }),

            removeItem: bookId =>
                set(state => ({
                    items: state.items.filter(item => item.book.id !== bookId),
                })),

            updateQuantity: (bookId, quantity) =>
                set(state => {
                    console.log(quantity)

                    if (quantity == 0) {
                        return {
                            items: state.items.filter(
                                item => item.book.id != bookId,
                            ),
                        }
                    }

                    if (quantity < 0) return state

                    return {
                        items: state.items.map(item =>
                            item.book.id === bookId
                                ? { ...item, quantity }
                                : item,
                        ),
                    }
                }),

            clearCart: () => set({ items: [] }),

            setCartItems: items => set({ items }),

            getTotalItems: () => {
                const { items } = get()
                return items.reduce((total, item) => total + item.quantity, 0)
            },
        }),
        {
            name: 'victionary-cart-storage',
        },
    ),
)
