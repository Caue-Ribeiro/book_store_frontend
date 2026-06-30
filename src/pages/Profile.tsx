import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'
import { Shield, Clock, Key, Package, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

interface AuditLog {
    id: string
    action: string
    details: string
    timestamp: string
}

export default function Profile() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loadingLogs, setLoadingLogs] = useState(true)

    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: '',
    })
    const [updateStatus, setUpdateStatus] = useState({
        loading: false,
        error: '',
        success: '',
    })

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        const fetchLogs = async () => {
            try {
                setLoadingLogs(true)

                const response = await api.get(
                    `/api/users/${user.id}/audit-logs?sort=timestamp,desc&size=10`,
                )
                setLogs(response.data.content || response.data)
            } catch (err) {
                console.error('Failed to fetch audit logs', err)
            } finally {
                setLoadingLogs(false)
            }
        }

        fetchLogs()
    }, [user, navigate])

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdateStatus({ loading: true, error: '', success: '' })

        if (passwordForm.new !== passwordForm.confirm) {
            setUpdateStatus({
                loading: false,
                error: 'New passwords do not match.',
                success: '',
            })
            return
        }

        try {
            await api.patch(`/api/users/${user?.id}`, {
                password: passwordForm.new,
            })
            setUpdateStatus({
                loading: false,
                error: '',
                success: 'Password updated successfully.',
            })
            setPasswordForm({ current: '', new: '', confirm: '' })

            const response = await api.get(
                `/api/users/${user?.id}/audit-logs?sort=timestamp,desc&size=10`,
            )
            setLogs(response.data.content || response.data)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err.response?.status === 400) {
                setUpdateStatus({
                    loading: false,
                    error:
                        err.response.data.error ||
                        'Password does not meet security requirements.',
                    success: '',
                })
            } else {
                setUpdateStatus({
                    loading: false,
                    error: 'Failed to update password.',
                    success: '',
                })
            }
        }
    }

    const handleSelfDeletion = async () => {
        try {
            setIsProcessing(true)
            await api.delete(`/api/users/${user?.id}`)

            setIsModalOpen(false)
            toast.success('Your account has been successfully deleted.')

            logout()
            navigate('/')
        } catch (error) {
            setIsModalOpen(false)
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                toast.error('Session expired. Please log in again.')
            } else {
                toast.error(
                    'Failed to complete account deletion. Please try again later.',
                )
            }
        } finally {
            setIsProcessing(false)
        }
    }

    if (!user) return null

    return (
        <div className="max-w-6xl mx-auto pb-24">
            <div className="border-b border-border pb-8 mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">
                        My Account
                    </h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest">
                        {user.name} • {user.role}
                    </p>
                </div>
                <button
                    onClick={() => {
                        logout()
                        navigate('/login')
                    }}
                    className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors"
                >
                    Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Left Column: Profile & Security */}
                <div className="lg:col-span-1 space-y-12">
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                            <Key className="w-4 h-4" /> Security Settings
                        </h2>

                        <form
                            onSubmit={handlePasswordUpdate}
                            className="space-y-4"
                        >
                            {updateStatus.error && (
                                <p className="text-xs text-red-500 bg-red-50 p-3 border border-red-100">
                                    {updateStatus.error}
                                </p>
                            )}
                            {updateStatus.success && (
                                <p className="text-xs text-green-600 bg-green-50 p-3 border border-green-100">
                                    {updateStatus.success}
                                </p>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.new}
                                    onChange={e =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            new: e.target.value,
                                        })
                                    }
                                    className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.confirm}
                                    onChange={e =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            confirm: e.target.value,
                                        })
                                    }
                                    className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent text-sm"
                                    required
                                />
                                <p className="text-[9px] text-gray-400 mt-2 tracking-wide uppercase">
                                    Requires 8+ chars, uppercase, lowercase,
                                    digit, special char.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={updateStatus.loading}
                                className="w-full border border-foreground text-foreground py-3 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 mt-4"
                            >
                                {updateStatus.loading
                                    ? 'Updating...'
                                    : 'Update Password'}
                            </button>
                        </form>
                    </section>

                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                            <Package className="w-4 h-4" /> My Orders
                        </h2>
                        <div className="bg-muted/30 border border-border p-6 text-center">
                            <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest">
                                View tracking and purchase history
                            </p>
                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full border border-foreground text-foreground py-3 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                            >
                                View Order History
                            </button>
                        </div>
                    </section>
                    <div className="p-8 border border-red-200 bg-red-50/10 space-y-4 max-w-xl">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-red-600">
                            Danger Zone
                        </h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wider leading-relaxed">
                            Permanently remove your account and all associated
                            data from our servers.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-red-600 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
                        >
                            Delete My Account
                        </button>
                    </div>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-background border border-red-200 w-full max-w-md relative shadow-2xl">
                                {/* Close Icon */}
                                <button
                                    onClick={() =>
                                        !isProcessing && setIsModalOpen(false)
                                    }
                                    disabled={isProcessing}
                                    className="absolute right-4 top-4 p-2 text-gray-400 hover:text-foreground transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="p-8 space-y-6">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                                            <AlertTriangle className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-xl font-bold tracking-tight uppercase text-red-600">
                                            Critical Warning
                                        </h2>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Are you sure you want to permanently
                                            delete your account? This will erase
                                            your order history and cannot be
                                            undone.
                                        </p>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() =>
                                                setIsModalOpen(false)
                                            }
                                            disabled={isProcessing}
                                            className="flex-1 px-6 py-3 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSelfDeletion}
                                            disabled={isProcessing}
                                            className="flex-1 px-6 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors flex justify-center items-center disabled:opacity-75"
                                        >
                                            {isProcessing
                                                ? 'Processing...'
                                                : 'Yes, Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Audit Logs */}
                <div className="lg:col-span-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Security Audit Log
                    </h2>

                    <div className="bg-muted/30 border border-border">
                        {loadingLogs ? (
                            <div className="p-8 text-center text-xs tracking-widest uppercase text-gray-400 animate-pulse">
                                Loading logs...
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="p-8 text-center text-xs tracking-widest uppercase text-gray-400">
                                No security events found.
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {logs.map(log => (
                                    <div
                                        key={log.id}
                                        className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="mt-1 text-gray-400">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span
                                                    className={`text-xs font-bold uppercase tracking-widest ${
                                                        log.action ===
                                                        'LOGIN_FAILED'
                                                            ? 'text-red-500'
                                                            : log.action ===
                                                                'LOGIN_SUCCESS'
                                                              ? 'text-green-600'
                                                              : 'text-foreground'
                                                    }`}
                                                >
                                                    {log.action.replace(
                                                        /_/g,
                                                        ' ',
                                                    )}
                                                </span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                    {new Date(
                                                        log.timestamp,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {log.details}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
