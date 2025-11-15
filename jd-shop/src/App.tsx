import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from 'sonner'
import { initializeBaseData } from './lib/initialize-data'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AccountPage from './pages/AccountPage'
import OrderDetailPage from './pages/OrderDetailPage'
import LoginPage from './pages/LoginPage'
import AdminProductsPage from './pages/AdminProductsPage'
import SuperAdminUsersPage from './pages/SuperAdminUsersPage'
import './App.css'

function App() {
  useEffect(() => {
    // 初始化基础数据
    initializeBaseData().then(result => {
      if (!result.success) {
        console.error('Failed to initialize base data:', result.error)
      }
    })
  }, [])

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Toaster richColors position="bottom-right" expandOnHover />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/super-admin/users" element={<SuperAdminUsersPage />} />
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
