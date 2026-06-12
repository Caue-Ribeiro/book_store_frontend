import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react'

// Interfaces matching your DTOs
interface OrderItem {
    bookId: string
    title: string
    quantity: number
    price: number
    subTotal: number
    coverImageUrl?: string
}

interface Order {
    id: string
    status: string
    total: number
    items: OrderItem[]
}

export default function Cart() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [cart, setCart] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    const fetchCart = async () => {
        if (!user?.id) return
        try {
            setLoading(true)
            const response = await api.get(`/api/orders/users/${user.id}/cart`)
            console.log(response)

            setCart(response.data)
        } catch (err: any) {
            if (err.response?.status !== 404) {
                // Ignore 404 if cart is just empty/not created yet
                console.error('Failed to fetch cart', err)
            }
            setCart(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user) {
            navigate('/login')
        } else {
            fetchCart()
        }
    }, [user, navigate])

    const updateQuantity = async (bookId: string, action: 'add' | 'remove') => {
        if (!user?.id) return
        try {
            setProcessing(true)
            if (action === 'add') {
                await api.post(
                    `/api/orders/users/${user.id}/cart/items/${bookId}?quantity=1`,
                )
            } else {
                await api.delete(
                    `/api/orders/users/${user.id}/cart/items/${bookId}?quantity=1`,
                )
            }
            await fetchCart() // Refresh cart to get updated totals
        } catch (err) {
            console.error(`Failed to ${action} item`, err)
            alert('Could not update cart quantity.')
        } finally {
            setProcessing(false)
        }
    }

    const handleCheckout = async () => {
        if (!user?.id) return
        try {
            setProcessing(true)
            await api.post(`/api/orders/users/${user.id}/checkout`)
            // Redirect to an order confirmation or payment page
            navigate('/orders')
        } catch (err) {
            console.error('Checkout failed', err)
            alert('Checkout failed. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="py-32 text-center text-xs tracking-widest uppercase text-gray-400 animate-pulse">
                Loading Cart...
            </div>
        )
    }

    const isEmpty = !cart || !cart.items || cart.items.length === 0

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <h1 className="text-4xl font-bold tracking-tighter uppercase mb-12 border-b border-border pb-6">
                Your Cart
            </h1>

            {isEmpty ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 mb-6">
                        Your cart is currently empty.
                    </p>
                    <Link
                        to="/"
                        className="inline-block border border-foreground px-8 py-3 text-sm font-medium uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-8">
                        {cart.items.map(item => (
                            <div
                                key={item.bookId}
                                className="flex gap-6 pb-8 border-b border-border"
                            >
                                {/* Image Placeholder */}
                                <div className="w-24 h-32 bg-muted flex-shrink-0">
                                    {item.coverImageUrl ? (
                                        <img
                                            src={item.coverImageUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-serif text-2xl">
                                            {item.title.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <Link
                                            to={`/books/${item.bookId}`}
                                            className="font-semibold text-sm uppercase tracking-tight hover:underline"
                                        >
                                            {item.title}
                                        </Link>
                                        <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">
                                            ${item.price.toFixed(2)} each
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-4 mt-4">
                                        <div className="flex items-center border border-border">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.bookId,
                                                        'remove',
                                                    )
                                                }
                                                disabled={processing}
                                                className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-4 text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.bookId,
                                                        'add',
                                                    )
                                                }
                                                disabled={processing}
                                                className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.bookId,
                                                    'remove',
                                                )
                                            }
                                            disabled={processing}
                                            className="text-xs text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" />{' '}
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {/* Subtotal */}
                                <div className="text-right font-medium">
                                    ${item.subTotal}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-muted/30 p-8 sticky top-24">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
                                Order Summary
                            </h2>

                            <div className="space-y-4 text-sm border-b border-border pb-6 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>
                                    <span className="font-medium">
                                        ${cart.total.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Shipping
                                    </span>
                                    <span className="font-medium">
                                        Calculated at checkout
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between text-lg font-bold mb-8 uppercase tracking-tight">
                                <span>Total</span>
                                <span>${cart.total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={processing}
                                className="w-full bg-foreground text-background py-4 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50"
                            >
                                {processing
                                    ? 'Processing...'
                                    : 'Proceed to Checkout'}{' '}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
