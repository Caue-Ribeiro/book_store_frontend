/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Register() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        birthdate: '',
        password: '',
        role: 'client', // Defaulting to CLIENT
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            console.log(formData)

            await api.post('/api/users/register', formData)
            navigate('/login')
        } catch (err: any) {
            if (err.response?.status === 400) {
                setError(
                    err.response.data.error ||
                        'Validation error. Check your password strength.',
                )
            } else {
                setError('Registration failed. Please check your data.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20">
            <h1 className="text-2xl font-bold mb-6 tracking-tight">
                Create Account
            </h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 mb-6 border border-red-100 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                            First Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            onChange={handleChange}
                            className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                            Last Name
                        </label>
                        <input
                            name="lastName"
                            type="text"
                            required
                            onChange={handleChange}
                            className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                        Email
                    </label>
                    <input
                        name="email"
                        type="email"
                        required
                        onChange={handleChange}
                        className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                        Birthdate
                    </label>
                    <input
                        name="birthdate"
                        type="date"
                        required
                        onChange={handleChange}
                        className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                        Password
                    </label>
                    <input
                        name="password"
                        type="password"
                        required
                        onChange={handleChange}
                        className="w-full border-b border-border p-2 focus:outline-none focus:border-foreground bg-transparent"
                    />
                    <p className="text-[10px] text-gray-400 mt-2 tracking-wide">
                        MUST CONTAIN 8+ CHARS, UPPERCASE, LOWERCASE, DIGIT,
                        SPECIAL CHAR.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-foreground text-background py-4 font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p className="mt-6 text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-foreground underline">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
