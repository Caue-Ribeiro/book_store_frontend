/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'

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
    releaseDate: string
    stock: number
    price: number
    description: string
    coverImageUrl?: string
    authors: Author[]
    categories: Category[]
}

export default function BookDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [book, setBook] = useState<Book | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { user } = useAuthStore()
    const [isAdding, setIsAdding] = useState(false)
    const [addSuccess, setAddSuccess] = useState(false)
    const addItem = useCartStore(state => state.addItem)

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                setLoading(true)
                const response = await api.get(`/api/books/${id}`)
                setBook(response.data)
            } catch (err: any) {
                console.error('Failed to fetch book', err)
                if (err.response?.status === 404) {
                    setError('Book not found.')
                } else {
                    setError('Could not load book details at this time.')
                }
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchBookDetails()
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-pulse text-sm tracking-widest uppercase text-gray-400">
                    Loading details...
                </div>
            </div>
        )
    }

    if (error || !book) {
        return (
            <div className="text-center py-32 space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">
                    {error || 'Book not found'}
                </h2>
                <Link
                    to="/"
                    className="text-sm uppercase tracking-wider text-gray-500 hover:text-foreground transition-colors pb-1 border-b border-gray-300"
                >
                    Return to Catalog
                </Link>
            </div>
        )
    }

    const handleAddToCart = async () => {
        if (!user?.id) {
            navigate('/login')
            return
        }

        try {
            setIsAdding(true)
            setAddSuccess(false)

            const test = await api.post(
                `/api/orders/users/${user.id}/cart/items/${book.id}?quantity=1&coverImageUrl=${book.coverImageUrl}`,
            )
            console.log(test)
            addItem(book)

            setAddSuccess(true)

            setTimeout(() => setAddSuccess(false), 3000)
        } catch (err) {
            console.error('Failed to add to cart', err)
            alert('Failed to add item to cart. Please try again.')
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <div className="pb-24">
            {/* Back Navigation */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors mb-12"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                {/* Left Column: Image Gallery/Cover */}
                <div className="lg:col-span-7">
                    <div className="aspect-[3/4] bg-muted w-full relative overflow-hidden">
                        {book.coverImageUrl ? (
                            <img
                                src={book.coverImageUrl}
                                alt={book.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif text-8xl text-center p-8">
                                {book.title.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Typography & Actions */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                    <div className="sticky top-24">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {book.categories?.map(c => (
                                <span
                                    key={c.id}
                                    className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-border px-2 py-1"
                                >
                                    {c.type || 'CATEGORY'}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-[0.9] mb-4">
                            {book.title}
                        </h1>

                        {/* Authors */}
                        {book.authors && book.authors.length > 0 && (
                            <p className="text-lg text-gray-500 font-medium mb-8">
                                By{' '}
                                {book.authors
                                    .map(a => `${a.name} ${a.lastName}`)
                                    .join(', ')}
                            </p>
                        )}

                        {/* Price & Stock */}
                        <div className="flex items-baseline gap-4 mt-8">
                            <p className="text-2xl font-medium">
                                ${book.price.toFixed(2)}
                            </p>
                            {book.stock > 0 ? (
                                <span className="text-xs font-bold uppercase tracking-widest text-green-600">
                                    In Stock ({book.stock})
                                </span>
                            ) : (
                                <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        <div className="mt-8 space-y-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={book.stock <= 0 || isAdding}
                                className="w-full bg-foreground text-background py-4 text-sm font-medium uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAdding
                                    ? 'Adding...'
                                    : book.stock > 0
                                      ? 'Add to Cart'
                                      : 'Sold Out'}
                            </button>

                            {addSuccess && (
                                <p className="text-xs font-bold text-green-600 uppercase tracking-widest text-center animate-pulse">
                                    Added to Cart Successfully
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mt-12 pt-12 border-t border-border">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                                Description
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                                {book.description ||
                                    'No description available for this title.'}
                            </p>
                        </div>

                        {/* Meta Data */}
                        <div className="mt-12 space-y-2 text-xs font-medium text-gray-400 uppercase tracking-widest">
                            <p className="flex justify-between border-b border-border pb-2">
                                <span>Release Date</span>
                                <span className="text-foreground">
                                    {book.releaseDate}
                                </span>
                            </p>
                            <p className="flex justify-between border-b border-border pb-2">
                                <span>ISBN</span>
                                <span className="text-foreground">
                                    {book.isbn}
                                </span>
                            </p>
                            <p className="flex justify-between border-b border-border pb-2">
                                <span>Product ID</span>
                                <span className="text-foreground">
                                    {book.id.substring(0, 8)}...
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
