/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, User, LogOut, Sparkles, X } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { api } from '../../lib/api'
import { useCartStore } from '../../store/useCartStore'

export default function Layout() {
    const { token, user, logout } = useAuthStore()

    const cartItemCount = useCartStore(state => state.getTotalItems())
    const setCartItems = useCartStore(state => state.setCartItems)
    const clearCart = useCartStore(state => state.clearCart)

    const navigate = useNavigate()

    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const handleLogout = async () => {
        try {
            await api.post('/logout')
        } catch (err) {
            console.error('Logout failed on server', err)
        } finally {
            logout()
            clearCart()
            navigate('/login')
        }
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(
                `/?view=books&search=${encodeURIComponent(searchQuery.trim())}`,
            )
            setIsSearchOpen(false)
            setSearchQuery('')
        }
    }

    useEffect(() => {
        if (token && user?.id) {
            const syncCart = async () => {
                try {
                    const response = await api.get(
                        `/api/orders/users/${user.id}/cart`,
                    )

                    if (response.data && response.data.items) {
                        const mappedItems = response.data.items.map(
                            (backendItem: any) => ({
                                book: {
                                    id: backendItem.bookId,
                                    title: backendItem.title,
                                    price: backendItem.price,
                                    coverImageUrl: backendItem.coverImageUrl,
                                },
                                quantity: backendItem.quantity,
                            }),
                        )

                        setCartItems(mappedItems)
                    }
                } catch (err: any) {
                    if (err.response?.status !== 404) {
                        console.error('Failed to sync cart from database', err)
                    }
                }
            }
            syncCart()
        }
    }, [token, user?.id, setCartItems])

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-xl font-bold tracking-tighter uppercase"
                        >
                            Bookstore
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-widest text-gray-500">
                            <Link
                                to="/?view=books"
                                className="hover:text-foreground transition-colors"
                            >
                                Books
                            </Link>
                            <Link
                                to="/?view=categories"
                                className="hover:text-foreground transition-colors"
                            >
                                Categories
                            </Link>
                            <Link
                                to="/?view=authors"
                                className="hover:text-foreground transition-colors"
                            >
                                Authors
                            </Link>
                            <Link
                                to="/events"
                                className="hover:text-foreground transition-colors"
                            >
                                Events
                            </Link>
                            <Link
                                to="/oracle"
                                className="flex items-center gap-1 text-foreground hover:text-gray-500 transition-colors"
                            >
                                <Sparkles className="w-3 h-3" /> Oracle
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Toggle Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            {isSearchOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                        </button>

                        <Link
                            to={token ? '/profile' : '/login'}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <User className="w-5 h-5" />
                        </Link>

                        {/* Cart Icon with Badge */}
                        <Link
                            to="/cart"
                            className="p-2 hover:bg-muted rounded-full transition-colors relative block"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-foreground text-background text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-background">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        {token && (
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Expandable Search Bar Overlay */}
                    {isSearchOpen && (
                        <div className="absolute top-full left-0 w-full bg-background border-b border-border p-4 shadow-lg animate-in slide-in-from-top-2 fade-in duration-200">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="max-w-2xl mx-auto relative flex items-center"
                            >
                                <Search className="w-4 h-4 absolute left-4 text-gray-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={e =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="SEARCH BY TITLE OR AUTHOR..."
                                    className="w-full bg-muted/30 border border-border py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-foreground transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-4 text-xs font-bold uppercase tracking-widest text-foreground hover:text-gray-500"
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}
