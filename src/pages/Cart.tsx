/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'
import {
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    Sparkles,
    X,
    Brain,
    Loader2,
} from 'lucide-react'
import { useCartStore } from '../store/useCartStore'

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

interface JudgmentResponse {
    judgment: string
    better_suggestions: string[]
}

type JudgerStep = 'warning' | 'loading' | 'result'

export default function Cart() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [cart, setCart] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const updateItem = useCartStore(state => state.updateQuantity)
    const removeItem = useCartStore(state => state.removeItem)
    const clearCartItems = useCartStore(state => state.clearCart)

    const [isJudgerOpen, setIsJudgerOpen] = useState(false)
    const [judgerStep, setJudgerStep] = useState<JudgerStep>('warning')
    const [judgmentData, setJudgmentData] = useState<JudgmentResponse | null>(
        null,
    )

    const fetchCart = async () => {
        if (!user?.id) return
        try {
            setLoading(true)
            const response = await api.get(`/api/orders/users/${user.id}/cart`)

            setCart(response.data)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err.response?.status !== 404) {
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
            await fetchCart()
        } catch (err) {
            console.error(`Failed to ${action} item`, err)
            alert('Could not update cart quantity.')
        } finally {
            setProcessing(false)
        }
    }

    const deleteItemFromCart = async (bookId: string) => {
        try {
            await api.delete(
                `/api/orders/users/${user?.id}/cart/trash-item/${bookId}`,
            )
            await fetchCart()
        } catch (error) {
            console.log('Something went wrong.')
        }
    }

    const clearCart = async () => {
        if (!user?.id) return
        try {
            await api.delete(`/api/orders/users/clear-cart/${user?.id}`)
            setCart(null)
        } catch (error) {
            console.log('Something went wrong.')
        }
    }

    const handleCheckout = async () => {
        if (!user?.id) return
        try {
            setProcessing(true)
            await api.post(`/api/orders/users/${user.id}/checkout`)

            navigate('/orders')
        } catch (err) {
            console.error('Checkout failed', err)
            alert('Checkout failed. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    const handleJudgeChoices = async () => {
        if (!user?.id) return
        setJudgerStep('loading')
        try {
            const response = await api.get(
                `/api/orders/order-choice-judger/${user.id}`,
            )
            setJudgmentData(response.data)
            setJudgerStep('result')
        } catch (error) {
            alert(
                'The Book Judger is currently too busy reading Proust to judge you right now. Try again later.',
            )
            setIsJudgerOpen(false)
        }
    }

    const openJudgerModal = () => {
        setJudgerStep('warning')
        setJudgmentData(null)
        setIsJudgerOpen(true)
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
        <div className="max-w-5xl mx-auto pb-24 relative">
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
                                                onClick={() => {
                                                    updateItem(
                                                        item.bookId,
                                                        item.quantity - 1,
                                                    )
                                                    updateQuantity(
                                                        item.bookId,
                                                        'remove',
                                                    )
                                                }}
                                                disabled={processing}
                                                className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-4 text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    updateItem(
                                                        item.bookId,
                                                        item.quantity + 1,
                                                    )
                                                    updateQuantity(
                                                        item.bookId,
                                                        'add',
                                                    )
                                                }}
                                                disabled={processing}
                                                className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => {
                                                deleteItemFromCart(item.bookId)
                                                removeItem(item.bookId)
                                            }}
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

                            <button
                                onClick={() => {
                                    clearCart()
                                    clearCartItems()
                                }}
                                disabled={processing}
                                className="w-full bg-background border-2 border-black text-black py-4 mt-4 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-foreground hover:text-white transition-colors disabled:opacity-50"
                            >
                                Clear Cart
                                <Trash2 className="w-4 h-4" />
                            </button>

                            {/* THE AI JUDGER TRIGGER */}
                            <button
                                onClick={openJudgerModal}
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 mt-8 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
                            >
                                <Sparkles className="w-4 h-4" /> Judge My
                                Choices
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Judger Modal */}
            {isJudgerOpen && (
                <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-background border border-border w-full max-w-lg my-8 relative shadow-2xl p-8 text-center">
                        <button
                            onClick={() => setIsJudgerOpen(false)}
                            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* STEP 1: WARNING */}
                        {judgerStep === 'warning' && (
                            <div className="space-y-6 py-4">
                                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-6">
                                    <Brain className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight uppercase">
                                    Are you sure you want to be teased for free?
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Our elitist bookstore clerk is ready to
                                    relentlessly mock your mainstream taste.
                                </p>
                                <div className="flex gap-4 justify-center pt-4">
                                    <button
                                        onClick={() => setIsJudgerOpen(false)}
                                        className="px-6 py-3 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors"
                                    >
                                        No, I'm Sensitive
                                    </button>
                                    <button
                                        onClick={handleJudgeChoices}
                                        className="px-6 py-3 bg-purple-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-purple-700 transition-colors"
                                    >
                                        Yes, Roast Me
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: LOADING */}
                        {judgerStep === 'loading' && (
                            <div className="space-y-6 py-12 flex flex-col items-center">
                                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                                <h2 className="text-sm font-bold tracking-widest uppercase text-gray-500 animate-pulse">
                                    Analyzing your terrible taste...
                                </h2>
                            </div>
                        )}

                        {/* STEP 3: RESULT */}
                        {judgerStep === 'result' && judgmentData && (
                            <div className="space-y-8 text-left">
                                <div className="flex items-center gap-3 border-b border-border pb-4">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    <h2 className="text-xl font-bold tracking-tight uppercase">
                                        The Verdict
                                    </h2>
                                </div>

                                <blockquote className="text-lg italic font-serif border-l-4 border-purple-600 pl-4 py-2">
                                    "{judgmentData.judgment}"
                                </blockquote>

                                <div className="bg-muted/30 p-6 border border-border">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                                        What you SHOULD be reading instead:
                                    </h3>
                                    <ul className="space-y-3">
                                        {judgmentData.better_suggestions.map(
                                            (suggestion, index) => (
                                                <li
                                                    key={index}
                                                    className="flex gap-3 text-sm font-medium"
                                                >
                                                    <span className="text-purple-600">
                                                        —
                                                    </span>{' '}
                                                    {suggestion}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
