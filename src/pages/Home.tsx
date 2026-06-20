/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import axios from 'axios'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    const [searchParams, setSearchParams] = useSearchParams()
    const [books, setBooks] = useState<Book[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [authors, setAuthors] = useState<Author[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const activeCategory = searchParams.get('category') || 'All'
    const searchQuery = searchParams.get('search') || ''
    const currentView = searchParams.get('view') || 'books'

    useEffect(() => {
        setPage(0)
    }, [searchQuery, activeCategory])

    useEffect(() => {
        let isMounted = true

        const fetchStorefrontData = async () => {
            try {
                setLoading(true)

                let booksEndpoint = `/api/books?page=${page}&size=12`

                if (searchQuery) {
                    booksEndpoint = `/api/books/search?q=${encodeURIComponent(searchQuery)}&page=${page}&size=12`
                } else if (activeCategory !== 'All') {
                    const formattedCat =
                        activeCategory.includes(' ') ||
                        activeCategory.includes('-')
                            ? activeCategory.replace(/[ -]/g, '_')
                            : activeCategory
                    booksEndpoint = `/api/books/category/${formattedCat}?page=${page}&size=12`
                }

                const response = await Promise.all([
                    api.get(booksEndpoint),
                    api.get('/api/categories'),
                    api.get('/api/authors'),
                ])

                if (isMounted) {
                    const booksResponse = response[0]
                    const categoriesResponse = response[1]
                    const authorsResponse = response[2]

                    setBooks(booksResponse.data.content || booksResponse.data)
                    setTotalPages(booksResponse.data.totalPages || 1)

                    setCategories(
                        categoriesResponse.data.content ||
                            categoriesResponse.data,
                    )
                    setAuthors(
                        authorsResponse.data.content || authorsResponse.data,
                    )

                    setLoading(false)
                }
            } catch (err) {
                if (isMounted) {
                    setLoading(false)
                    if (axios.isAxiosError(err)) {
                        setError(
                            err.response?.data?.message ||
                                'Could not load the catalog.',
                        )
                    } else {
                        setError('An unexpected error occurred.')
                    }
                }
            }
        }

        fetchStorefrontData()

        return () => {
            isMounted = false
        }
    }, [page, activeCategory, searchQuery])

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
        return (
            <div className="text-center text-red-500 py-20 text-xs uppercase tracking-widest">
                {error}
            </div>
        )
    }

    const filteredBooks = books

    return (
        <div className="space-y-16 pb-20">
            {/* Hero Section */}
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

            {/* Conditionally Render Content Layouts based on Header Navigation */}
            {currentView === 'categories' ? (
                <section className="space-y-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center">
                        Browse By Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() =>
                                    setSearchParams({
                                        view: 'books',
                                        category: category.type,
                                    })
                                }
                                className="p-8 border border-border text-center uppercase tracking-wider text-xs font-bold hover:bg-foreground hover:text-background transition-colors"
                            >
                                {category.type}
                            </button>
                        ))}
                    </div>
                </section>
            ) : currentView === 'authors' ? (
                <section className="space-y-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center">
                        Our Authors
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {authors.map(author => (
                            <Link
                                to={`/authors/${author.id}`}
                                key={author.id}
                                className="group p-8 border border-border bg-background hover:bg-foreground hover:text-background transition-colors flex flex-col justify-between h-40"
                            >
                                <div>
                                    <h3 className="font-bold uppercase tracking-tight text-lg mb-1">
                                        {author.name} {author.lastName}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                                        Contributor
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Profile →
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : (
                <>
                    {/* Category Filtering Buttons */}
                    {categories.length > 0 && !searchQuery && (
                        <section className="flex flex-wrap gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setPage(0)
                                    setSearchParams({
                                        view: 'books',
                                        category: 'All',
                                    })
                                }}
                                className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                                    activeCategory === 'All'
                                        ? 'bg-foreground text-background'
                                        : 'text-gray-500 hover:text-foreground border border-transparent hover:border-border'
                                }`}
                            >
                                All
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setPage(0)
                                        setSearchParams({
                                            view: 'books',
                                            category: category.type,
                                        })
                                    }}
                                    className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                                        activeCategory.toUpperCase() ===
                                        category.type.toUpperCase()
                                            ? 'bg-foreground text-background'
                                            : 'text-gray-500 hover:text-foreground border border-transparent hover:border-border'
                                    }`}
                                >
                                    {category.type}
                                </button>
                            ))}
                        </section>
                    )}

                    {/* Active Search Indicator */}
                    {searchQuery && (
                        <div className="text-center pb-8 animate-in fade-in">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Search Results For:{' '}
                                <span className="text-foreground">
                                    "{searchQuery}"
                                </span>
                            </p>
                            <button
                                onClick={() => {
                                    setPage(0)
                                    setSearchParams({
                                        view: 'books',
                                        category: activeCategory,
                                    })
                                }}
                                className="text-[10px] underline uppercase tracking-widest text-gray-500 hover:text-foreground mt-2"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}

                    {/* Book Grid */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {filteredBooks.map(book => (
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
                                    <p className="text-gray-500 text-xs mt-1 tracking-wide">
                                        {book.authors
                                            ?.map(
                                                a => `${a.name} ${a.lastName}`,
                                            )
                                            .join(', ') || 'Unknown Author'}
                                    </p>
                                    <p className="mt-auto pt-4 text-sm font-medium">
                                        ${book.price.toFixed(2)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                        {filteredBooks.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-12 text-xs uppercase tracking-widest">
                                No titles matching this configuration.
                            </div>
                        )}
                    </section>

                    {/* Storefront Pagination Controls */}
                    {filteredBooks.length > 0 && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-8 pt-16 border-t border-border mt-16">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground hover:text-gray-500 transition-colors disabled:opacity-30 disabled:hover:text-foreground"
                            >
                                <ChevronLeft className="w-4 h-4" /> Prev
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
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground hover:text-gray-500 transition-colors disabled:opacity-30 disabled:hover:text-foreground"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
