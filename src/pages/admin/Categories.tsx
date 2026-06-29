/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Plus, Trash2, X, Search } from 'lucide-react'
import axios from 'axios'

interface Category {
    id: number
    type: string
}

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ type: '' })
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        let isMounted = true

        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/categories')
                if (isMounted) {
                    setCategories(
                        Array.isArray(response.data) ? response.data : [],
                    )
                    setLoading(false)
                }
            } catch (error) {
                if (isMounted) setLoading(false)
                console.error('Failed to fetch categories', error)
            }
        }

        fetchCategories()

        return () => {
            isMounted = false
        }
    }, [])

    const filteredCategories = categories.filter(category =>
        category.type.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleOpenModal = () => {
        setFormData({ type: '' })
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setFormData({ type: '' })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)

        const payload = {
            categoryList: [
                {
                    type: formData.type.trim().toUpperCase(),
                },
            ],
        }

        try {
            await api.post('/api/categories', payload)
            const response = await api.get('/api/categories')
            setCategories(Array.isArray(response.data) ? response.data : [])
            handleCloseModal()
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                alert('Forbidden: Insufficient administration privileges.')
            } else {
                alert(
                    'Failed to save category. Please verify your data configuration.',
                )
            }
        } finally {
            setProcessing(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete specified category record?')) return

        try {
            await api.delete(`/api/categories/${id}`)
            setCategories(prev => prev.filter(c => c.id !== id))
        } catch (error) {
            alert('Delete operation structural constraint restriction failure.')
        }
    }

    return (
        <div className="space-y-8 relative">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">
                        Category Management
                    </h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest">
                        Organize your catalog with tags
                    </p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-foreground/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add New Category
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center bg-muted/20 p-4 border border-border">
                <div className="flex items-center gap-2 text-gray-500 bg-background border border-border px-3 py-2 w-full max-w-sm">
                    <Search className="w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="SEARCH CATEGORIES..."
                        className="bg-transparent border-none focus:outline-none text-xs w-full uppercase tracking-widest placeholder:text-gray-300"
                    />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {filteredCategories.length} Categories Found
                </span>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="py-20 text-center text-xs tracking-widest uppercase text-gray-400 animate-pulse">
                    Loading Categories...
                </div>
            ) : (
                <div className="overflow-x-auto border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-border">
                            <tr>
                                <th className="p-4 font-bold">ID</th>
                                <th className="p-4 font-bold">Category Type</th>
                                <th className="p-4 font-bold text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-background">
                            {filteredCategories.map(category => (
                                <tr
                                    key={category.id}
                                    className="hover:bg-muted/20 transition-colors"
                                >
                                    <td className="p-4 text-gray-500 font-mono text-xs">
                                        {category.id}
                                    </td>
                                    <td className="p-4 font-medium uppercase tracking-widest text-xs">
                                        {category.type}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() =>
                                                handleDelete(category.id)
                                            }
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors inline-block"
                                            title="Delete"
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

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-background border border-border w-full max-w-md my-8 relative shadow-2xl">
                        <button
                            onClick={handleCloseModal}
                            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 border-b border-border">
                            <h2 className="text-2xl font-bold tracking-tight uppercase">
                                Add New Category
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Category Type (Name)
                                </label>
                                <input
                                    type="text"
                                    value={formData.type}
                                    onChange={e =>
                                        setFormData({ type: e.target.value })
                                    }
                                    required
                                    placeholder="e.g. CLASSICS"
                                    className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent uppercase placeholder:text-gray-200"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-border">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Processing...'
                                        : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
