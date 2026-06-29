/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'
import { Package, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

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
    moment: string
    status: string
    total: number
    items: OrderItem[]
}

interface Payment {
    orderId: string
    action: 'pay' | 'cancel'
}

export default function Orders() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<Payment | null>(null)

    const fetchOrders = async () => {
        if (!user?.id) return
        try {
            setLoading(true)
            const response = await api.get(`/api/orders/users/${user.id}`)
            const sortedOrders = response.data.sort(
                (a: Order, b: Order) =>
                    new Date(b.moment).getTime() - new Date(a.moment).getTime(),
            )
            setOrders(sortedOrders)
        } catch (err) {
            console.error('Failed to fetch orders', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user) {
            navigate('/login')
        } else {
            fetchOrders()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate])

    const handleAction = async (orderId: string, action: 'pay' | 'cancel') => {
        if (!user?.id) return
        try {
            setProcessingId({ orderId, action })
            const response = await api.post(
                `/api/orders/users/${user.id}/${orderId}/${action}`,
            )
            await fetchOrders()

            if (response.data.checkoutUrl) {
                // eslint-disable-next-line react-hooks/immutability
                window.location.href = response.data.checkoutUrl
            }
        } catch (err) {
            console.error(`Failed to ${action} order`, err)
            toast.error(`Could not ${action} the order. Please try again.`)
        } finally {
            setProcessingId(null)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID':
            case 'DELIVERED':
                return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'CANCELED':
                return <XCircle className="w-4 h-4 text-red-500" />
            default:
                return <Clock className="w-4 h-4 text-yellow-600" />
        }
    }

    if (loading) {
        return (
            <div className="py-32 text-center text-xs tracking-widest uppercase text-gray-400 animate-pulse">
                Loading Orders...
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <div className="border-b border-border pb-8 mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">
                        Order History
                    </h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest">
                        Track and manage your purchases
                    </p>
                </div>
                <Link
                    to="/profile"
                    className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors"
                >
                    Back to Profile
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 border border-border bg-muted/20">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-6" />
                    <p className="text-gray-500 mb-6 uppercase tracking-widest text-sm">
                        You haven't placed any orders yet.
                    </p>
                    <Link
                        to="/"
                        className="inline-block border border-foreground px-8 py-3 text-sm font-medium uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-12">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className="border border-border p-8 bg-background"
                        >
                            {/* Order Header */}
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-8 pb-8 border-b border-border">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                        Order Number
                                    </p>
                                    <p className="font-mono text-sm">
                                        {order.id}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(
                                            order.moment,
                                        ).toLocaleDateString()}{' '}
                                        at{' '}
                                        {new Date(
                                            order.moment,
                                        ).toLocaleTimeString()}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                        Total Amount
                                    </p>
                                    <p className="text-xl font-bold tracking-tight">
                                        ${order.total}
                                    </p>

                                    <div className="flex items-center justify-end gap-2 mt-2">
                                        {getStatusIcon(order.status)}
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-6 mb-8">
                                {order.items.map(item => (
                                    <div
                                        key={item.bookId}
                                        className="flex items-center gap-6"
                                    >
                                        <div className="w-16 h-24 bg-muted flex-shrink-0">
                                            {item.coverImageUrl ? (
                                                <img
                                                    src={item.coverImageUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-serif text-xl">
                                                    {item.title.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Link
                                                to={`/books/${item.bookId}`}
                                                className="font-semibold text-sm uppercase tracking-tight hover:underline"
                                            >
                                                {item.title}
                                            </Link>
                                            <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">
                                                Qty: {item.quantity} • $
                                                {item.price.toFixed(2)} each
                                            </p>
                                        </div>
                                        <div className="font-medium text-sm">
                                            ${item.subTotal}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Actions */}
                            {order.status === 'AWAITING_PAYMENT' && (
                                <div className="flex justify-end gap-4 pt-6 border-t border-border">
                                    <button
                                        onClick={() =>
                                            handleAction(order.id, 'cancel')
                                        }
                                        disabled={
                                            processingId?.orderId === order.id
                                        }
                                        className="px-6 py-3 border border-border text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                                    >
                                        {processingId?.orderId === order.id &&
                                        processingId.action == 'cancel'
                                            ? 'Processing...'
                                            : 'Cancel Order'}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleAction(order.id, 'pay')
                                        }
                                        disabled={
                                            processingId?.orderId === order.id
                                        }
                                        className="px-8 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-50"
                                    >
                                        {processingId?.orderId === order.id &&
                                        processingId.action == 'pay'
                                            ? 'Processing...'
                                            : 'Pay Now'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
