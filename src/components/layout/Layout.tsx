import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, User, LogOut, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { api } from '../../lib/api'

export default function Layout() {
    const { token, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await api.post('/logout')
        } catch (err) {
            console.error(
                'Logout failed on server, clearing local state anyway',
                err,
            )
        } finally {
            logout()
            navigate('/login')
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
                <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
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
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}
