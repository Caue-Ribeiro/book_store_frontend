import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/useAuthStore'

interface OrderItems {
    availableStock: number
    bookId: string
    coverImageUrl: string
    price: number
    quantity: number
    title: string
    total: number
}

interface Payment {
    id: string
    moment: string
    orderId: string
}

interface Order {
    id: string
    items: OrderItems[]
    moment: string
    payment: Payment
    status: string
    total: number
    userId: string
}

interface Author {
    id: string
    name: string
    lastName: string
}

interface Category {
    id: string
    type: string
}

interface Book {
    id: string
    title: string
    isbn: number
    releaseDate: Date
    stock: number
    price: number
    description: string
    coverImageUrl: string
    authors: Author[]
    categories: Category[]
}

export default function Dashboard() {
    const { user } = useAuthStore()

    const [activeUsers, setActiveUsers] = useState(0)
    const [pendingOrders, setPendingOrders] = useState(0)
    const [inventory, setInventory] = useState(0)

    useEffect(() => {
        let isMounted: boolean = true
        const fetchDashboardInfo = async () => {
            try {
                const usersResponse = await api.get('/api/users')
                const ordersResponse = await api.get('/api/orders')
                const booksResponse = await api.get('/api/books/list')

                if (isMounted) {
                    setActiveUsers(usersResponse.data.totalElements)

                    const orders: Order[] = ordersResponse.data.filter(
                        (order: Order) => order.status == 'AWAITING_PAYMENT',
                    )
                    setPendingOrders(orders.length)

                    const allBookStock = booksResponse.data
                        .map((book: Book) => book.stock)
                        .reduce(
                            (total: number, currentVal: number) =>
                                total + currentVal,
                            0,
                        )

                    setInventory(allBookStock)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchDashboardInfo()

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-500 text-sm uppercase tracking-widest">
                    Welcome back, {user?.name}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat Cards (Placeholders to be wired to backend later) */}
                <div className="border border-border p-6 bg-background">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                        Total Inventory
                    </h3>
                    <p className="text-4xl font-bold tracking-tighter">
                        {inventory}
                    </p>
                </div>
                <div className="border border-border p-6 bg-background">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                        Active Users
                    </h3>
                    <p className="text-4xl font-bold tracking-tighter">
                        {activeUsers}
                    </p>
                </div>
                <div className="border border-border p-6 bg-background">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                        Pending Orders
                    </h3>
                    <p className="text-4xl font-bold tracking-tighter">
                        {pendingOrders}
                    </p>
                </div>
            </div>
        </div>
    )
}
