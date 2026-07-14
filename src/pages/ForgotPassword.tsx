import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import axios from 'axios'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            toast.error('Please enter your email address.')
            return
        }

        setIsSubmitting(true)

        try {
            await api.post('/forgot-password', { email })

            toast.success('Recovery email sent! Please check your inbox.', {
                duration: 5000,
            })
            navigate('/reset-password', { state: { email } })
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                toast.error('No account found with that email address.')
            } else {
                toast.error(
                    'Failed to send recovery email. Please try again later.',
                )
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-muted flex items-center justify-center mb-6 border border-border">
                        <Mail className="w-5 h-5 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tighter uppercase mb-2">
                        Recover Password
                    </h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                        Enter your email to receive reset instructions
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full border border-border bg-background p-3 text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
                            placeholder="YOUREMAIL@EMAIL.COM"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-foreground text-background py-4 text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Processing...' : 'Send Recovery Email'}
                    </button>
                </form>

                <div className="text-center mt-8 pt-6 border-t border-border">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
