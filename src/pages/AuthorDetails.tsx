import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { ArrowLeft, ExternalLink, BookOpen } from 'lucide-react'

interface Author {
    id: number
    name: string
    lastName: string
}

interface Book {
    id: string
    title: string
    price: number
    coverImageUrl?: string
    authors: Author[]
}

interface WikiSummary {
    title: string
    description: string
    extract: string
    originalimage?: { source: string }
    thumbnail?: { source: string }
    content_urls?: { desktop?: { page?: string } }
}

export default function AuthorDetails() {
    const { id } = useParams<{ id: string }>()

    const [author, setAuthor] = useState<Author | null>(null)
    const [wikiData, setWikiData] = useState<WikiSummary | null>(null)
    const [authorBooks, setAuthorBooks] = useState<Book[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isMounted = true

        const fetchAuthorData = async () => {
            if (!id) return
            console.log(id)

            try {
                setLoading(true)

                const authorRes = await api.get(`/api/authors/${id}`)
                const fetchedAuthor = authorRes.data

                if (!isMounted) return
                setAuthor(fetchedAuthor)

                const fullName =
                    `${fetchedAuthor.name} ${fetchedAuthor.lastName}`.trim()

                const [wikiRes, booksRes] = await Promise.allSettled([
                    api.get('/api/authors/summary', {
                        params: { authorName: fullName },
                    }),
                    api.get('/api/books/list'),
                ])

                if (!isMounted) return

                if (wikiRes.status === 'fulfilled' && wikiRes.value.data) {
                    setWikiData(wikiRes.value.data)
                }

                if (booksRes.status === 'fulfilled') {
                    const allBooks: Book[] =
                        booksRes.value.data.content || booksRes.value.data
                    const filteredBooks = allBooks.filter(book =>
                        book.authors?.some(a => a.id === Number(id)),
                    )
                    console.log(allBooks)

                    setAuthorBooks(filteredBooks)
                }

                setLoading(false)
            } catch (err) {
                if (isMounted) {
                    setLoading(false)
                    setError(
                        'Failed to load author profile. They may not exist in our records.',
                    )
                    console.error(err)
                }
            }
        }

        fetchAuthorData()

        return () => {
            isMounted = false
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-pulse text-sm tracking-widest uppercase text-gray-400">
                    Loading Author Profile...
                </div>
            </div>
        )
    }

    if (error || !author) {
        return (
            <div className="text-center py-32 space-y-6">
                <p className="text-red-500 text-xs uppercase tracking-widest">
                    {error}
                </p>
                <Link
                    to="/"
                    className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-foreground"
                >
                    Return to Catalog
                </Link>
            </div>
        )
    }

    const imageUrl =
        wikiData?.originalimage?.source || wikiData?.thumbnail?.source

    return (
        <div className="max-w-5xl mx-auto pb-24 space-y-16">
            <Link
                to="/?view=authors"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Authors
            </Link>

            {/* Author Biography Section */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start border-b border-border pb-16">
                {/* Profile Image */}
                <div className="md:col-span-5 aspect-[3/4] bg-muted relative overflow-hidden border border-border">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={wikiData?.title || author.name}
                            className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                            <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                            <span className="text-xs uppercase tracking-widest">
                                No Image Available
                            </span>
                        </div>
                    )}
                </div>

                {/* Biography Content */}
                <div className="md:col-span-7 space-y-6">
                    <div>
                        <h1 className="text-5xl font-bold tracking-tighter uppercase mb-2">
                            {wikiData?.title ||
                                `${author.name} ${author.lastName}`}
                        </h1>
                        {wikiData?.description && (
                            <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
                                {wikiData.description}
                            </p>
                        )}
                    </div>

                    <div className="prose prose-sm text-foreground/80 leading-relaxed text-justify">
                        {wikiData?.extract ? (
                            <p className="text-sm">{wikiData.extract}</p>
                        ) : (
                            <p className="text-sm italic text-gray-400">
                                Detailed biographical summary is currently
                                unavailable for this author.
                            </p>
                        )}
                    </div>

                    {wikiData?.content_urls?.desktop?.page && (
                        <a
                            href={wikiData.content_urls.desktop.page}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground hover:text-gray-500 transition-colors pt-4 border-t border-border"
                        >
                            Read full article on Wikipedia{' '}
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
            </section>

            {/* Author's Books Section */}
            <section className="space-y-8">
                <div className="flex items-end justify-between border-b border-border pb-4">
                    <h2 className="text-2xl font-bold tracking-tight uppercase">
                        Selected Works
                    </h2>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {authorBooks.length}{' '}
                        {authorBooks.length === 1 ? 'Title' : 'Titles'}{' '}
                        Available
                    </span>
                </div>

                {authorBooks.length === 0 ? (
                    <p className="text-center py-12 text-xs uppercase tracking-widest text-gray-400">
                        No works currently in stock for this author.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {authorBooks.map(book => (
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
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif text-3xl group-hover:scale-105 transition-transform duration-500 ease-out p-2 text-center">
                                            {book.title.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 uppercase tracking-tight">
                                        {book.title}
                                    </h3>
                                    <p className="mt-auto pt-2 text-xs font-medium text-gray-500">
                                        ${book.price.toFixed(2)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
