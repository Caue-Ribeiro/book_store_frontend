import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import {
    Sparkles,
    ExternalLink,
    BookmarkPlus,
    Share,
    RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'

type ViewState = 'INPUT' | 'LOADING' | 'RESULTS'

// Data models matching the provided API JSON contract
interface BookRecommendation {
    title: string
    author: string
    publishedYear: string
    matchReason: string
    coverImageUrl: string
}

interface ArchetypePayload {
    readerArchetype: {
        title: string
        description: string
    }
    recommendations: BookRecommendation[]
}

export default function ReaderDiscovery() {
    const [currentView, setCurrentView] = useState<ViewState>('INPUT')
    const [userInput, setUserInput] = useState('')

    const [loadingIndex, setLoadingIndex] = useState(0)

    const [archetypeData, setArchetypeData] = useState<ArchetypePayload | null>(
        null,
    )

    const loadingStrings = [
        'Reading your literary aura...',
        'Consulting the historical libraries...',
        'Decoding your reading personality archetype...',
    ]

    const vibeTags = [
        {
            label: '+ Plot-Driven',
            appendText: 'looking for a plot-driven story with twists',
        },
        { label: '+ Cozy Vibe', appendText: 'looking for a cozy vibe' },
        {
            label: '+ Deep Characters',
            appendText: 'looking for deep, complex characters',
        },
    ]

    // --- EFFECT: ROTATING LOADING COPY ---
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>
        if (currentView === 'LOADING') {
            interval = setInterval(() => {
                setLoadingIndex(prev => (prev + 1) % loadingStrings.length)
            }, 2500)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [currentView, loadingStrings.length])

    const handleTagClick = (textToAppend: string) => {
        setUserInput(prev => {
            if (prev.trim().length > 0) {
                const separator = prev.trim().endsWith(',') ? ' ' : ', '
                return `${prev}${separator}${textToAppend}`
            }
            return textToAppend
        })
    }

    const handleSubmit = async () => {
        if (userInput.trim().length >= 15) {
            setCurrentView('LOADING')
            setLoadingIndex(0)

            try {
                const response = await api.post('/api/books/reader-discovery', {
                    userInput,
                })

                setTimeout(() => {
                    setArchetypeData(response.data)
                    setCurrentView('RESULTS')
                }, 3000)
            } catch (error) {
                console.error('Oracle calculation failed', error)
                toast(
                    'The Oracle is currently clouded. Please try again later.',
                    { icon: '🕛' },
                )
                setCurrentView('INPUT')
            }
        }
    }

    // --- ACTION HANDLERS (PHASE 3) ---
    const handleFindBook = (title: string, author: string) => {
        const query = `book ${title} by ${author}`
        window.open(
            `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            '_blank',
        )
    }

    const handleSaveToJournal = () => {
        if (!archetypeData) return

        try {
            const entry = {
                timestamp: new Date().toISOString(),
                payload: archetypeData,
            }

            const existingHistory = JSON.parse(
                localStorage.getItem('oracle_journal') || '[]',
            )
            localStorage.setItem(
                'oracle_journal',
                JSON.stringify([...existingHistory, entry]),
            )
            toast.success('Archetype securely saved to your local journal.')
        } catch (err) {
            console.error('Failed to save to local storage', err)
        }
    }

    const handleShare = async () => {
        if (!archetypeData) return

        const { readerArchetype, recommendations } = archetypeData
        const shareText = `🔮 My Literary Oracle Archetype: ${readerArchetype.title}\n\nRecommended books for my current vibe:\n${recommendations.map((b, i) => `${i + 1}. ${b.title} by ${b.author}`).join('\n')}\n\nDiscover your archetype on the Book Store App!`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Reader Archetype',
                    text: shareText,
                })
            } catch (err) {
                console.error('Share action cancelled or failed', err)
            }
        } else {
            navigator.clipboard.writeText(shareText)
            toast.success('Archetype summary copied to clipboard!')
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 min-h-[70vh] flex flex-col justify-center">
            {/* ----------------------------------------------------------------- */}
            {/* VIEW 1: THE INPUT FORM                                            */}
            {/* ----------------------------------------------------------------- */}
            {currentView === 'INPUT' && (
                <div className="space-y-12 animate-in fade-in duration-700">
                    <div className="text-center border-b border-border pb-12">
                        <div className="flex justify-center mb-6">
                            <Sparkles className="w-8 h-8 text-foreground" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">
                            The Literary Oracle
                        </h1>
                        <p className="text-gray-500 text-sm uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
                            Discover yourself as a reader. Tell us your vibe,
                            your current life phase, or what media keeps you
                            hooked.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
                                Focus Prompts
                            </h2>
                            <ul className="space-y-4 text-sm text-gray-500 leading-relaxed text-justify">
                                <li className="border-l border-border pl-4">
                                    What movie or show recently sucked you in
                                    completely?
                                </li>
                                <li className="border-l border-border pl-4">
                                    Do you want massive plot twists or deep, raw
                                    characters?
                                </li>
                                <li className="border-l border-border pl-4">
                                    What is your current emotional target or
                                    real-life echo?
                                </li>
                            </ul>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <textarea
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                placeholder="I'm looking for a story that..."
                                className="w-full h-48 p-6 bg-transparent border border-border focus:border-foreground focus:outline-none resize-none text-sm leading-relaxed"
                            />

                            <div className="space-y-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    Quick Vibe Tags
                                </span>
                                <div className="flex flex-wrap gap-3">
                                    {vibeTags.map((tag, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                handleTagClick(tag.appendText)
                                            }
                                            className="px-4 py-2 border border-border text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-foreground hover:border-foreground transition-colors"
                                        >
                                            {tag.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border flex items-center justify-between">
                                <span
                                    className={`text-[10px] font-bold uppercase tracking-widest ${userInput.length >= 15 ? 'text-green-600' : 'text-gray-400'}`}
                                >
                                    {userInput.length}/15 characters minimum
                                </span>
                                <button
                                    onClick={handleSubmit}
                                    disabled={userInput.trim().length < 15}
                                    className="px-8 py-4 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Reveal My Archetype
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* VIEW 2: IMMERSIVE LOADING                                         */}
            {/* ----------------------------------------------------------------- */}
            {currentView === 'LOADING' && (
                <div className="flex flex-col items-center justify-center space-y-12 py-32 animate-in fade-in duration-700">
                    <div className="relative flex items-center justify-center">
                        {/* Abstract Pulsing Particles instead of a mechanical spinner */}
                        <div className="absolute w-32 h-32 bg-muted/50 rounded-full animate-ping"></div>
                        <div className="absolute w-24 h-24 bg-foreground/10 rounded-full animate-pulse delay-75"></div>
                        <Sparkles className="w-8 h-8 text-foreground z-10 animate-pulse" />
                    </div>

                    <div className="h-8 overflow-hidden relative w-full flex justify-center">
                        <p
                            key={loadingIndex}
                            className="text-xs tracking-[0.2em] uppercase text-gray-500 animate-in slide-in-from-bottom-4 fade-in duration-500"
                        >
                            {loadingStrings[loadingIndex]}
                        </p>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* VIEW 3: DISCOVERY DASHBOARD                                       */}
            {/* ----------------------------------------------------------------- */}
            {currentView === 'RESULTS' && archetypeData && (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {/* Header & Archetype Core */}
                    <div className="text-center space-y-6">
                        <h1 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">
                            Your Archetype
                        </h1>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-foreground">
                            {archetypeData.readerArchetype.title}
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto italic">
                            "{archetypeData.readerArchetype.description}"
                        </p>
                    </div>

                    <div className="border-t border-border w-full"></div>

                    {/* Recommendations Block */}
                    <div className="space-y-12">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-center text-foreground">
                            Your Current Chosen Paths
                        </h3>

                        <div className="grid grid-cols-1 gap-12">
                            {archetypeData.recommendations.map(
                                (book, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col md:flex-row gap-8 items-start border border-border p-8 bg-background"
                                    >
                                        {/* Book Details */}
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h4 className="text-xl font-bold uppercase tracking-tight">
                                                    {book.title}
                                                </h4>
                                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">
                                                    By {book.author} •{' '}
                                                    {book.publishedYear}
                                                </p>
                                            </div>

                                            <div className="p-4 bg-muted/20 border-l-2 border-foreground">
                                                <p className="text-sm text-gray-600 leading-relaxed text-justify">
                                                    <span className="font-bold text-[10px] uppercase tracking-widest block mb-2">
                                                        Why it matches you
                                                    </span>
                                                    {book.matchReason}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleFindBook(
                                                        book.title,
                                                        book.author,
                                                    )
                                                }
                                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-foreground transition-colors pt-2"
                                            >
                                                Search Online{' '}
                                                <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-12 border-t border-border">
                        <button
                            onClick={() => setCurrentView('INPUT')}
                            className="flex items-center gap-2 px-6 py-3 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" /> Try a New Mood
                        </button>
                        <button
                            onClick={handleSaveToJournal}
                            className="flex items-center gap-2 px-6 py-3 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors"
                        >
                            <BookmarkPlus className="w-4 h-4" /> Save to Journal
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors"
                        >
                            <Share className="w-4 h-4" /> Share Archetype
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
