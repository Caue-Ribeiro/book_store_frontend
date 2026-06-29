import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Package,
    X,
    Eye,
} from 'lucide-react'
import axios from 'axios'

interface OrderItem {
    bookId: string
    title: string
    quantity: number
    price: number
    total: number
    coverImageUrl?: string
}

interface Order {
    id: string
    moment: string
    status: string
    total: number
    userId: string
    items: OrderItem[]
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const [searchQuery, setSearchQuery] = useState('')
    const [processingId, setProcessingId] = useState<string | null>(null)

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchOrders = async () => {
            try {
                setLoading(true)
                const response = await api.get(
                    `/api/orders?page=${page}&size=10`,
                )

                if (isMounted) {
                    setOrders(response.data.content || response.data)
                    setTotalPages(response.data.totalPages || 1)
                    setLoading(false)
                }
            } catch (error) {
                if (isMounted) setLoading(false)
                console.error('Failed to fetch orders', error)
            }
        }

        fetchOrders()

        return () => {
            isMounted = false
        }
    }, [page])

    const filteredOrders = orders.filter(
        order =>
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userId.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setProcessingId(orderId)
        try {
            const response = await api.patch(`/api/orders/${orderId}/status`, {
                status: newStatus,
            })

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId
                        ? { ...order, status: response.data.status }
                        : order,
                ),
            )
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                alert('Forbidden: Insufficient administration privileges.')
            } else {
                alert('Failed to update order status. Please try again.')
            }
        } finally {
            setProcessingId(null)
        }
    }

    const formatDate = (isoString: string) => {
        const date = new Date(isoString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    }

    return (
        <div className="space-y-8 relative">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2 flex items-center gap-3">
                        <Package className="w-8 h-8" /> Order Fulfillment
                    </h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest">
                        Manage customer purchases and delivery statuses
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center bg-muted/20 p-4 border border-border">
                <div className="flex items-center gap-2 text-gray-500 bg-background border border-border px-3 py-2 w-full max-w-sm">
                    <Search className="w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="SEARCH BY ORDER OR USER ID..."
                        className="bg-transparent border-none focus:outline-none text-xs w-full uppercase tracking-widest placeholder:text-gray-300"
                    />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {filteredOrders.length} Orders On This Page
                </span>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="py-20 text-center text-xs tracking-widest uppercase text-gray-400 animate-pulse">
                    Loading Orders...
                </div>
            ) : (
                <div className="overflow-x-auto border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-border">
                            <tr>
                                <th className="p-4 font-bold">Order Details</th>
                                <th className="p-4 font-bold">Date</th>
                                <th className="p-4 font-bold">Total</th>
                                <th className="p-4 font-bold">
                                    Fulfillment Status
                                </th>
                                <th className="p-4 font-bold text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-background">
                            {filteredOrders.map(order => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-muted/20 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs text-foreground uppercase">
                                                {order.id.split('-')[0]}...{' '}
                                                {/* Show partial UUID */}
                                            </span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                                {order.items.length} Items
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 text-xs">
                                        {formatDate(order.moment)}
                                    </td>
                                    <td className="p-4 font-medium text-xs">
                                        ${order.total?.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={order.status}
                                            onChange={e =>
                                                handleStatusUpdate(
                                                    order.id,
                                                    e.target.value,
                                                )
                                            }
                                            disabled={processingId === order.id}
                                            className={`text-[10px] font-bold uppercase tracking-widest p-2 border focus:outline-none cursor-pointer disabled:opacity-50
                                                ${
                                                    order.status === 'DELIVERED'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : order.status ===
                                                            'PAID'
                                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                          : order.status ===
                                                              'SHIPPED'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                            : order.status ===
                                                                'CANCELED'
                                                              ? 'bg-red-50 text-red-700 border-red-200'
                                                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }
                                            `}
                                        >
                                            <option value="AWAITING_PAYMENT">
                                                Awaiting Payment
                                            </option>
                                            <option value="PAID">
                                                Paid / Processing
                                            </option>
                                            <option value="SHIPPED">
                                                Shipped
                                            </option>
                                            <option value="DELIVERED">
                                                Delivered
                                            </option>
                                            <option value="CANCELED">
                                                Canceled
                                            </option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() =>
                                                setSelectedOrder(order)
                                            }
                                            className="p-2 text-gray-400 hover:text-foreground transition-colors inline-block"
                                            title="View Order Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-foreground hover:text-gray-500 transition-colors disabled:opacity-30 disabled:hover:text-foreground"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </button>

                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Page {page + 1} of {totalPages}
                            </span>

                            <button
                                onClick={() =>
                                    setPage(p =>
                                        Math.min(totalPages - 1, p + 1),
                                    )
                                }
                                disabled={page >= totalPages - 1}
                                className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-foreground hover:text-gray-500 transition-colors disabled:opacity-30 disabled:hover:text-foreground"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-background border border-border w-full max-w-2xl my-8 relative shadow-2xl">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 border-b border-border">
                            <h2 className="text-2xl font-bold tracking-tight uppercase mb-2">
                                Order Manifest
                            </h2>
                            <p className="text-xs text-gray-500 font-mono">
                                ID: {selectedOrder.id}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                                CUSTOMER ID: {selectedOrder.userId}
                            </p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    Purchased Items
                                </h3>
                                <div className="border border-border divide-y divide-border">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-muted/10"
                                        >
                                            <div className="flex items-center gap-4">
                                                {item.coverImageUrl ? (
                                                    <img
                                                        src={item.coverImageUrl}
                                                        alt={item.title}
                                                        className="w-10 h-14 object-cover border border-border"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-14 bg-muted border border-border flex items-center justify-center">
                                                        <Package className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold uppercase">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Qty: {item.quantity} x $
                                                        {item.price?.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="font-bold text-sm">
                                                ${item.total?.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-border">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    Total Order Value
                                </span>
                                <span className="text-2xl font-bold">
                                    ${selectedOrder.total?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
