import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { api } from '../../lib/api'
export default function Layout() {
    const { token, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            // Call the backend logout endpoint you built
            await api.post('/logout')
        } catch (error) {
            console.error(
                'Logout failed on server, clearing local state anyway',
                error,
            )
        } finally {
            logout()
            navigate('/login')
        }
    }
    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-muted rounded-full transition-colors">
                        <Search className="w-5 h-5" />
                    </button>

                    <Link
                        to={token ? '/profile' : '/login'}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <User className="w-5 h-5" />
                    </Link>

                    <Link
                        to="/cart"
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ShoppingBag className="w-5 h-5" />
                    </Link>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex-1 flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-xl font-bold tracking-tighter uppercase"
                        >
                            Bookstore
                        </Link>
                        <nav className="hidden md:flex gap-4 text-sm font-medium">
                            <Link
                                to="/books"
                                className="hover:text-gray-600 transition-colors"
                            >
                                Books
                            </Link>
                            <Link
                                to="/categories"
                                className="hover:text-gray-600 transition-colors"
                            >
                                Categories
                            </Link>
                            <Link
                                to="/authors"
                                className="hover:text-gray-600 transition-colors"
                            >
                                Authors
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-muted rounded-full transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <Link
                            to={token ? '/profile' : '/login'}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <User className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/cart"
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <ShoppingBag className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
                <Outlet />
            </main>

            <footer className="border-t border-border mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-gray-500 flex justify-between">
                    <p>© 2026 Bookstore. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link to="/terms">Terms</Link>
                        <Link to="/privacy">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
