import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/layout/Layout'
import BookDetails from './pages/BookDetails'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import AuthorDetails from './pages/AuthorDetails'
import BookEvents from './pages/BookEvents'
import ReaderDiscovery from './pages/ReaderDiscovery'

import AdminRoute from './components/auth/AdminRoute'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminBooks from './pages/admin/Books'
import AdminAuthors from './pages/admin/Authors'
import AdminCategories from './pages/admin/Categories'
import AdminUsers from './pages/admin/Users'

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
                    <Route path="orders" element={<Orders />} />
                    <Route path="authors/:id" element={<AuthorDetails />} />
                    <Route path="events" element={<BookEvents />} />
                    <Route path="oracle" element={<ReaderDiscovery />} />
                    {/* Future routes will go here (e.g., /books/:id, /admin) */}
                </Route>

                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="books" element={<AdminBooks />} />
                        <Route path="authors" element={<AdminAuthors />} />
                        <Route
                            path="categories"
                            element={<AdminCategories />}
                        />
                        <Route path="users" element={<AdminUsers />} />
                        {/* Future Admin Routes will go here */}
                        {/* <Route path="books" element={<AdminBooks />} /> */}
                    </Route>
                </Route>
            </Routes>
        </Router>
    )
}

export default App
