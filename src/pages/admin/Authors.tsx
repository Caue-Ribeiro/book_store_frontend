import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Plus, Trash2, X, Search } from 'lucide-react'

interface Author {
    id: number
    name: string
    lastName: string
}

export default function Authors() {
    const [authors, setAuthors] = useState<Author[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', lastName: '' })
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        let isMounted = true
        const fetchAuthors = async () => {
            try {
                const response = await api.get('/api/authors')
                if (isMounted) {
                    setAuthors(
                        Array.isArray(response.data) ? response.data : [],
                    )
                    setLoading(false)
                }
            } catch (error) {
                if (isMounted) setLoading(false)
                console.error(error)
            }
        }
        fetchAuthors()
        return () => {
            isMounted = false
        }
    }, [])

    const filteredAuthors = authors.filter(
        author =>
            author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            author.lastName.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)
        try {
            await api.post('/api/authors', formData)
            const response = await api.get('/api/authors')
            setAuthors(Array.isArray(response.data) ? response.data : [])
            setIsModalOpen(false)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert('Error persistent context execution maps configuration.')
        } finally {
            setProcessing(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete specified record?')) return
        try {
            await api.delete(`/api/authors/${id}`)
            setAuthors(prev => prev.filter(a => a.id !== id))
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert('Delete operation structural constraint restriction failure.')
        }
    }

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">
                        Author Management
                    </h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest">
                        Manage the writers in your catalog
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add New Author
                </button>
            </div>

            <div className="flex justify-between items-center bg-muted/20 p-4 border border-border">
                <div className="flex items-center gap-2 text-gray-500 bg-background border border-border px-3 py-2 w-full max-w-sm">
                    <Search className="w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="SEARCH AUTHORS BY NAME..."
                        className="bg-transparent border-none focus:outline-none text-xs w-full uppercase tracking-widest"
                    />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {filteredAuthors.length} Found
                </span>
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs tracking-widest uppercase text-gray-400 animate-pulse">
                    Loading Authors...
                </div>
            ) : (
                <div className="overflow-x-auto border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-border">
                            <tr>
                                <th className="p-4 font-bold">ID</th>
                                <th className="p-4 font-bold">First Name</th>
                                <th className="p-4 font-bold">Last Name</th>
                                <th className="p-4 font-bold text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-background">
                            {filteredAuthors.map(author => (
                                <tr
                                    key={author.id}
                                    className="hover:bg-muted/20 transition-colors"
                                >
                                    <td className="p-4 text-gray-500 font-mono text-xs">
                                        {author.id}
                                    </td>
                                    <td className="p-4 font-medium">
                                        {author.name}
                                    </td>
                                    <td className="p-4 font-medium">
                                        {author.lastName}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() =>
                                                handleDelete(author.id)
                                            }
                                            className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-background border border-border w-full max-w-md my-8 relative shadow-2xl">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 p-2 text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="p-8 border-b border-border">
                            <h2 className="text-2xl font-bold tracking-tight uppercase">
                                Add New Author
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full border-b border-border p-2 focus:outline-none bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            lastName: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full border-b border-border p-2 focus:outline-none bg-transparent"
                                />
                            </div>
                            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 border border-border text-xs font-bold uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest"
                                >
                                    {processing
                                        ? 'Processing...'
                                        : 'Create Author'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
