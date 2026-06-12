import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/layout/Layout'
import BookDetails from './pages/BookDetails'
import Cart from './pages/Cart'
import Profile from './pages/Profile'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="books/:id" element={<BookDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="profile" element={<Profile />} />
                    {/* Future routes will go here (e.g., /books/:id, /admin) */}
                </Route>
            </Routes>
        </Router>
    )
}

export default App
