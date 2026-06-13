import { Link, Outlet, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    BookOpen,
    Tags,
    Users,
    ArrowLeft,
    PenTool,
} from 'lucide-react'

export default function AdminLayout() {
    const location = useLocation()

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Books', path: '/admin/books', icon: BookOpen },
        { name: 'Categories', path: '/admin/categories', icon: Tags },
        { name: 'Authors', path: '/admin/authors', icon: PenTool },
        { name: 'Users', path: '/admin/users', icon: Users },
    ]

    return (
        <div className="min-h-screen flex bg-muted/20">
            {/* Sidebar */}
            <aside className="w-64 bg-background border-r border-border flex flex-col fixed h-full">
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <Link
                        to="/"
                        className="text-xl font-bold tracking-tighter uppercase flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-400" />{' '}
                        Storefront
                    </Link>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                        Management
                    </p>
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-foreground text-background'
                                        : 'text-gray-600 hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8 lg:p-12">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
