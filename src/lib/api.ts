import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

// Assuming your Spring Boot backend runs on 8080
export const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request Interceptor: Attach the token
api.interceptors.request.use(config => {
    const token = useAuthStore.getState().token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response Interceptor: Handle 401/403 globally
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // If the token expires or is invalid, log the user out
            useAuthStore.getState().logout()
        }
        return Promise.reject(error)
    },
)
