/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import {
    Search,
    Shield,
    User as UserIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

interface User {
    id: string
    name: string
    lastName: string
    email: string
    role: string
    birthdate: string
    deletedAt: Date | null
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        setPage(0)
    }, [searchQuery])

    useEffect(() => {
        let isMounted = true

        const timer = setTimeout(async () => {
            try {
                setLoading(true)

                let endpoint = `/api/users?page=${page}&size=10`
                if (searchQuery.trim() !== '') {
                    endpoint = `/api/users/search?q=${encodeURIComponent(searchQuery)}&page=${page}&size=10`
                }

                const response = await api.get(endpoint)
                if (isMounted) {
                    setUsers(response.data.content || response.data)
                    setTotalPages(response.data.totalPages || 1)
                    setLoading(false)
                }
            } catch (error) {
                if (isMounted) setLoading(false)
                console.error(error)
            }
        }, 300)

        return () => {
            isMounted = false
            clearTimeout(timer)
        }
    }, [page, searchQuery])

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">
                        User Management
                    </h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest">
                        Monitor registered clients and administrators
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center bg-muted/20 p-4 border border-border">
                <div className="flex items-center gap-2 text-gray-500 bg-background border border-border px-3 py-2 w-full max-w-sm">
                    <Search className="w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="SEARCH USERS BY EMAIL OR NAME..."
                        className="bg-transparent border-none focus:outline-none text-xs w-full uppercase tracking-widest"
                    />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {users.length} Accounts On This Page
                </span>
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs tracking-widest uppercase text-gray-400 animate-pulse">
                    Loading Users...
                </div>
            ) : (
                <div className="overflow-x-auto border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-border">
                            <tr>
                                <th className="p-4 font-bold">User</th>
                                <th className="p-4 font-bold">Email</th>
                                <th className="p-4 font-bold">Role</th>
                                <th className="p-4 font-bold">Birthdate</th>
                                <th className="p-4 font-bold text-right">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-background">
                            {users.map(user => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-muted/20 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-gray-500">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium uppercase tracking-tight text-xs">
                                                {user.name} {user.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-max ${
                                                user.role === 'ADMIN'
                                                    ? 'text-purple-600 bg-purple-50 border border-purple-100'
                                                    : 'text-gray-600 bg-gray-50 border border-gray-200'
                                            }`}
                                        >
                                            {user.role === 'ADMIN' && (
                                                <Shield className="w-3 h-3" />
                                            )}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 text-xs">
                                        {user.birthdate}
                                    </td>
                                    <td className="p-4 text-right">
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-widest ${user.deletedAt != null ? 'text-red-700' : 'text-green-600'} `}
                                        >
                                            {user.deletedAt != null
                                                ? 'Inactive'
                                                : 'Active'}
                                        </span>
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
        </div>
    )
}
