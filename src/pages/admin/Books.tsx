import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react'
import axios from 'axios'

interface Author {
    id: number
    name: string
    lastName: string
}
interface Category {
    id: number
    type: string
}

interface Book {
    id: string
    title: string
    isbn: number
    stock: number
    price: number
    coverImageUrl?: string
    authors: Author[]
    categories: Category[]
}

interface BookFormData {
    title: string
    price: number
    stock: number
    coverImageUrl: string
    authorsIds: number[]
    categoriesIds: number[]
}

export default function Books() {
    const [books, setBooks] = useState<Book[]>([])
    const [authors, setAuthors] = useState<Author[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<BookFormData>({
        title: '',
        price: 0,
        stock: 0,
        coverImageUrl: '',
        authorsIds: [],
        categoriesIds: [],
    })
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        let isMounted = true
        const fetchData = async () => {
            try {
                const [booksRes, authorsRes, categoriesRes] = await Promise.all(
                    [
                        api.get('/api/books'),
                        api.get('/api/authors'),
                        api.get('/api/categories'),
                    ],
                )
                if (isMounted) {
                    setBooks(booksRes.data.content || booksRes.data)
                    setAuthors(authorsRes.data.content || authorsRes.data)
                    setCategories(
                        categoriesRes.data.content || categoriesRes.data,
                    )
                    setLoading(false)
                }
            } catch (error) {
                if (isMounted) setLoading(false)
                console.error('Failed to fetch admin catalog metrics', error)
            }
        }
        fetchData()
        return () => {
            isMounted = false
        }
    }, [])

    // Derived State Search Filter
    const filteredBooks = books.filter(
        book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.isbn.toString().includes(searchQuery),
    )

    const handleOpenModal = (book?: Book) => {
        if (book) {
            setEditingId(book.id)
            setFormData({
                title: book.title,
                price: book.price,
                stock: book.stock,
                coverImageUrl: book.coverImageUrl || '',
                authorsIds: book.authors.map(a => a.id),
                categoriesIds: book.categories.map(c => c.id),
            })
        } else {
            setEditingId(null)
            setFormData({
                title: '',
                price: 0,
                stock: 0,
                coverImageUrl: '',
                authorsIds: [],
                categoriesIds: [],
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingId(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)
        try {
            if (editingId) {
                await api.patch(`/api/books/${editingId}`, formData)
            } else {
                await api.post('/api/books', formData)
            }
            const response = await api.get('/api/books')
            setBooks(response.data.content || response.data)
            handleCloseModal()
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                alert('Forbidden: Insufficient administration privileges.')
            } else {
                alert(
                    'Execution context failure writing to database configuration.',
                )
            }
        } finally {
            setProcessing(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Confirm complete inventory removal operation?'))
            return
        try {
            await api.delete(`/api/books/${id}`)
            setBooks(prev => prev.filter(b => b.id !== id))
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert('Delete operation rejected by target validation rules.')
        }
    }

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">
                        Inventory Management
                    </h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest">
                        Add, edit, or remove books from the catalog
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-foreground/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add New Book
                </button>
            </div>

            <div className="flex justify-between items-center bg-muted/20 p-4 border border-border">
                <div className="flex items-center gap-2 text-gray-500 bg-background border border-border px-3 py-2 w-full max-w-sm">
                    <Search className="w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="SEARCH BY TITLE OR ISBN..."
                        className="bg-transparent border-none focus:outline-none text-xs w-full uppercase tracking-widest placeholder:text-gray-300"
                    />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {filteredBooks.length} Titles Listed
                </span>
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs tracking-widest uppercase text-gray-400 animate-pulse">
                    Loading Inventory...
                </div>
            ) : (
                <div className="overflow-x-auto border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-border">
                            <tr>
                                <th className="p-4 font-bold">Title</th>
                                <th className="p-4 font-bold">ISBN</th>
                                <th className="p-4 font-bold">Price</th>
                                <th className="p-4 font-bold">Stock</th>
                                <th className="p-4 font-bold text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-background">
                            {filteredBooks.map(book => (
                                <tr
                                    key={book.id}
                                    className="hover:bg-muted/20 transition-colors"
                                >
                                    <td className="p-4 font-medium max-w-[200px] truncate">
                                        {book.title}
                                    </td>
                                    <td className="p-4 text-gray-500 font-mono text-xs">
                                        {book.isbn}
                                    </td>
                                    <td className="p-4 font-medium">
                                        ${book.price?.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${book.stock > 10 ? 'text-green-600 bg-green-50' : book.stock > 0 ? 'text-yellow-600 bg-yellow-50' : 'text-red-500 bg-red-50'}`}
                                        >
                                            {book.stock} units
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() =>
                                                handleOpenModal(book)
                                            }
                                            className="p-2 text-gray-400 hover:text-foreground inline-block"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(book.id)
                                            }
                                            className="p-2 text-gray-400 hover:text-red-500 inline-block"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-background border border-border w-full max-w-2xl my-8 relative shadow-2xl">
                        <button
                            onClick={handleCloseModal}
                            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-foreground overscroll-contain"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="p-8 border-b border-border">
                            <h2 className="text-2xl font-bold tracking-tight uppercase">
                                {editingId
                                    ? 'Edit Book Details'
                                    : 'Add New Book'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                        Book Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                title: e.target.value,
                                            })
                                        }
                                        required
                                        className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                price: Number(e.target.value),
                                            })
                                        }
                                        required
                                        className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                        Initial Stock
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                stock: Number(e.target.value),
                                            })
                                        }
                                        required
                                        className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                        Cover Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.coverImageUrl}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                coverImageUrl: e.target.value,
                                            })
                                        }
                                        required
                                        className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                        Authors
                                    </label>
                                    <select
                                        multiple
                                        required
                                        value={formData.authorsIds.map(String)}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                authorsIds: Array.from(
                                                    e.target.selectedOptions,
                                                    o => Number(o.value),
                                                ),
                                            })
                                        }
                                        className="w-full border border-border p-2 bg-transparent text-sm h-32 focus:outline-none"
                                    >
                                        {authors.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} {a.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                        Categories
                                    </label>
                                    <select
                                        multiple
                                        value={formData.categoriesIds.map(
                                            String,
                                        )}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                categoriesIds: Array.from(
                                                    e.target.selectedOptions,
                                                    o => Number(o.value),
                                                ),
                                            })
                                        }
                                        className="w-full border border-border p-2 bg-transparent text-sm h-32 focus:outline-none"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-border">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-foreground/90"
                                >
                                    {processing
                                        ? 'Processing...'
                                        : editingId
                                          ? 'Update Book'
                                          : 'Create Book'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
