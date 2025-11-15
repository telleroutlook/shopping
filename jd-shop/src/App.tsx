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
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import OrdersPage from './pages/OrdersPage'
import AddressesPage from './pages/AddressesPage'
import FavoritesPage from './pages/FavoritesPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrderFailedPage from './pages/OrderFailedPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import SuperAdminUsersPage from './pages/SuperAdminUsersPage'
import RoleManagementPage from './pages/RoleManagementPage'
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
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/order-failed" element={<OrderFailedPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/super-admin/users" element={<SuperAdminUsersPage />} />
            <Route path="/super-admin/roles" element={<RoleManagementPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
