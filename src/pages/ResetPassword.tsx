import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { KeyRound, Lock, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import axios from 'axios'

export default function ResetPassword() {
    const navigate = useNavigate()
    const location = useLocation()

    const email = location.state?.email

    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const passwordsMatch = newPassword !== '' && newPassword === repeatPassword

    if (!email) {
        return <Navigate to="/forgot-password" replace />
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!passwordsMatch) {
            toast.error('Passwords do not match.')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await api.post('/reset-password-otp', {
                email: email,
                otp: otp,
                newPassword: newPassword,
            })

            console.log(response)
            if (response.data.status == 201) {
                toast.success(response.data.message)
                setTimeout(() => navigate('/login'), 2000)
            } else {
                toast.error(response.data.message)
                setTimeout(() => navigate('/forgot-password'), 2000)
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const backendMessage =
                    error.response?.data?.message || error.response?.data?.error

                if (backendMessage) {
                    toast(backendMessage, { icon: '❌' })
                } else if (error.response?.status === 0) {
                    toast.error(
                        'Network or CORS error connecting to the server.',
                    )
                } else {
                    toast.error('Failed to reset password. Please try again.')
                }
            } else {
                toast.error('An unexpected error occurred.')
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
                        <KeyRound className="w-5 h-5 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tighter uppercase mb-2">
                        Create New Password
                    </h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                        Enter the OTP sent to {email}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                            One Time Password (OTP)
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full border border-border bg-background p-3 text-sm focus:outline-none focus:border-foreground transition-colors tracking-widest text-center"
                            placeholder="XXXXXX"
                            required
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e =>
                                        setNewPassword(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    className="w-full border border-border bg-background p-3 pl-10 text-sm focus:outline-none focus:border-foreground transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                Repeat New Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={repeatPassword}
                                    onChange={e =>
                                        setRepeatPassword(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    className={`w-full border p-3 pl-10 text-sm focus:outline-none transition-colors ${
                                        repeatPassword.length > 0
                                            ? passwordsMatch
                                                ? 'border-green-500 focus:border-green-600'
                                                : 'border-red-500 focus:border-red-600'
                                            : 'border-border focus:border-foreground'
                                    }`}
                                    required
                                />
                            </div>

                            {/* Live Equality Feedback */}
                            {repeatPassword.length > 0 && (
                                <div
                                    className={`flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-widest ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {passwordsMatch ? (
                                        <>
                                            <CheckCircle2 className="w-3 h-3" />{' '}
                                            Passwords match
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-3 h-3" />{' '}
                                            Passwords do not match
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !passwordsMatch}
                        className="w-full bg-foreground text-background py-4 text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-50 mt-4"
                    >
                        {isSubmitting
                            ? 'Processing...'
                            : 'Confirm New Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}
