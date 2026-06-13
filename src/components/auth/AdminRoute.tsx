import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export default function AdminRoute() {
    const { user } = useAuthStore()

    // If not logged in, send to login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // If logged in but not an ADMIN, send to home page
    if (user.role !== 'ADMIN') {
        return <Navigate to="/" replace />
    }

    // If they are an ADMIN, render the child routes
    return <Outlet />
}
