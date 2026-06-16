import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Calendar } from 'lucide-react'
import axios from 'axios'

// IMPORTANT: Adjust these fields to match your exact Spring Boot DTO
interface BookEvent {
    id: number
    name: string
    startDate: string
    endDate: string
    description: string
}

export default function BookEvents() {
    const [events, setEvents] = useState<BookEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isMounted = true

        const fetchEvents = async () => {
            try {
                setLoading(true)
                const response = await api.get('/api/books/events')

                if (isMounted) {
                    // Assuming your endpoint returns a flat array or a paginated 'content' array
                    setEvents(
                        Array.isArray(response.data)
                            ? response.data
                            : response.data.content || [],
                    )
                    setLoading(false)
                }
            } catch (err) {
                if (isMounted) {
                    setLoading(false)
                    if (axios.isAxiosError(err)) {
                        setError(
                            err.response?.data?.message ||
                                'Failed to load upcoming events.',
                        )
                    } else {
                        setError(
                            'An unexpected error occurred while fetching events.',
                        )
                    }
                }
            }
        }

        fetchEvents()

        return () => {
            isMounted = false
        }
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-pulse text-sm tracking-widest uppercase text-gray-400">
                    Loading Events Calendar...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500 text-xs uppercase tracking-widest">
                {error}
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 space-y-12">
            <div className="text-center border-b border-border pb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">
                    Literary Calendar
                </h1>
                <p className="text-gray-500 text-sm uppercase tracking-widest">
                    Join us for readings, signings, and discussions this year.
                </p>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-20 border border-border bg-muted/10">
                    <Calendar className="w-8 h-8 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 uppercase tracking-widest text-xs">
                        No upcoming events are currently scheduled.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {events.map(event => {
                        // Parse the date to make it look clean (e.g., "OCTOBER 15, 2026")
                        const eventStartDate = new Date(event.startDate)
                        const evenEndtDate = new Date(event.endDate)
                        const formattedStartDate =
                            eventStartDate.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })
                        const formattedEndDate =
                            evenEndtDate.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })

                        return (
                            <div
                                key={event.id}
                                className="group border border-border bg-background p-8 flex flex-col md:flex-row gap-8 items-start hover:border-foreground transition-colors"
                            >
                                {/* Date Block */}
                                <div className="md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-8">
                                    <span className="block text-xl font-bold tracking-tighter">
                                        from
                                    </span>
                                    <span className="block text-2xl font-bold tracking-tighter text-gray-400">
                                        {formattedStartDate}
                                    </span>

                                    <span className="block text-xl font-bold tracking-tighter">
                                        to
                                    </span>
                                    <span className="block text-2xl font-bold tracking-tighter text-gray-600">
                                        {formattedEndDate}
                                    </span>
                                </div>

                                {/* Event Details */}
                                <div className="flex-1 space-y-4">
                                    <h2 className="text-xl font-bold tracking-tight uppercase">
                                        {event.name}
                                    </h2>

                                    <p className="text-sm text-gray-600 leading-relaxed text-justify">
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
