import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

// These interfaces match your Spring Boot DTOs
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
    price: number
    coverImageUrl?: string
    authors: Author[]
    categories: Category[]
}

export default function Home() {
    const [books, setBooks] = useState<Book[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchStorefrontData = async () => {
            try {
                setLoading(true)
                // Fetch both books and categories simultaneously
                const [booksResponse, categoriesResponse] = await Promise.all([
                    api.get('/api/books'),
                    api.get('/api/categories'),
                ])

                console.log(booksResponse)

                // Assuming your backend returns paginated data (content array) or a direct list
                setBooks(booksResponse.data.content || booksResponse.data)
                setCategories(
                    categoriesResponse.data.content || categoriesResponse.data,
                )
            } catch (err) {
                console.error('Failed to fetch data', err)
                setError('Could not load the catalog. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchStorefrontData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-pulse text-sm tracking-widest uppercase text-gray-400">
                    Loading catalog...
                </div>
            </div>
        )
    }

    if (error) {
        return <div className="text-center text-red-500 py-20">{error}</div>
    }

    return (
        <div className="space-y-16 pb-20">
            {/* Victionary-style Hero Section */}
            <section className="py-24 text-center border-b border-border">
                <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6 uppercase">
                    Curated
                    <br />
                    Literature.
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl font-light">
                    Discover a meticulously selected collection of books across
                    art, design, architecture, and contemporary fiction.
                </p>
            </section>

            {/* Category Navigation */}
            {categories.length > 0 && (
                <section className="flex flex-wrap gap-4 justify-center">
                    <button className="px-4 py-2 text-xs font-medium uppercase tracking-wider bg-foreground text-background transition-colors">
                        All
                    </button>
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-foreground border border-transparent hover:border-border transition-colors"
                        >
                            {category.type}
                        </button>
                    ))}
                </section>
            )}

            {/* Dynamic Book Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                {books.map(book => (
                    <Link
                        to={`/books/${book.id}`}
                        key={book.id}
                        className="group cursor-pointer flex flex-col h-full"
                    >
                        <div className="aspect-[3/4] bg-muted mb-4 overflow-hidden relative border border-border/50">
                            {book.coverImageUrl ? (
                                <img
                                    src={book.coverImageUrl}
                                    alt={book.title}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif text-4xl group-hover:scale-105 transition-transform duration-500 ease-out p-4 text-center">
                                    {book.title.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col flex-1">
                            <h3 className="font-semibold text-sm leading-snug line-clamp-2 uppercase tracking-tight">
                                {book.title}
                            </h3>

                            {/* Display Authors */}
                            <p className="text-gray-500 text-xs mt-1 tracking-wide">
                                {book.authors
                                    ?.map(a => `${a.name} ${a.lastName}`)
                                    .join(', ') || 'Unknown Author'}
                            </p>

                            <p className="mt-auto pt-4 text-sm font-medium">
                                ${book.price.toFixed(2)}
                            </p>
                        </div>
                    </Link>
                ))}

                {books.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-12">
                        No books found in the catalog.
                    </div>
                )}
            </section>
        </div>
    )
}
