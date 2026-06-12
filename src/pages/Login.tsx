import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const setAuth = useAuthStore(state => state.setAuth)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await api.post('/authenticate', {
                username: email,
                password: password,
            })

            // Save token to Zustand store
            setAuth(response.data.token, {
                id: response.data.id,
                name: response.data.name,
                email: email, // We already have this from the form state
                role: response.data.role,
            })

            // Redirect to home page
            navigate('/')
        } catch (err: any) {
            if (err.response?.status === 423) {
                setError(
                    err.response.data.error ||
                        'Account locked due to failed attempts.',
                )
            } else if (err.response?.status === 401) {
                setError('Invalid credentials.')
            } else {
                setError('An unexpected error occurred. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20">
            <h1 className="text-2xl font-bold mb-6 tracking-tight">Login</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 mb-6 border border-red-100 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground transition-colors bg-transparent"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground transition-colors bg-transparent"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-foreground text-background py-4 font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 mt-8"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
            <p className="mt-6 text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-foreground underline">
                    Register
                </Link>
            </p>
        </div>
    )
}
