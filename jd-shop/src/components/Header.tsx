import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Shield, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/usePermission'
import { useState, useEffect, useCallback } from 'react'
import { supabase, CartItem } from '@/lib/supabase'
import { cartEvents } from '@/lib/events'

export default function Header() {
  const { user, userRole } = useAuth()
  const { isAdminOrHigher, isSuperAdmin } = useRole()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)

  const loadCartCount = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id)
    
    if (!error && data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(total)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadCartCount()
      
      // 监听购物车更新事件
      const handleCartUpdate = () => {
        loadCartCount()
      }
      cartEvents.on('cart:updated', handleCartUpdate)
      
      return () => {
        cartEvents.off('cart:updated', handleCartUpdate)
      }
    } else {
      setCartCount(0)
    }
  }, [user, loadCartCount])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background-primary border-b border-background-divider">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-brand rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">JD</span>
            </div>
            <span className="text-xl font-semibold text-brand hidden sm:inline">简洁购物</span>
          </Link>

          {/* 搜索框 */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-2xl mx-4 sm:mx-8"
            aria-label="网站全局搜索"
          >
            <div className="relative">
              <label htmlFor="global-search" className="sr-only">
                搜索商品
              </label>
              <input
                type="text"
                placeholder="搜索商品"
                id="global-search"
                name="search"
                autoComplete="off"
                aria-label="搜索商品"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-background-surface border border-transparent rounded-full focus:border-brand focus:outline-none transition-colors text-base"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <button type="submit" className="sr-only" aria-label="提交搜索">
                搜索
              </button>
            </div>
          </form>

          {/* 右侧操作 */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* 管理员入口 */}
            {isAdminOrHigher && (
              <Link
                to="/admin/products"
                className="flex items-center space-x-1 text-text-primary hover:text-brand transition-colors"
                title="商品管理"
              >
                <Shield className="w-6 h-6" />
                <span className="hidden sm:inline text-sm">管理</span>
              </Link>
            )}

            {/* 超级管理员入口 */}
            {isSuperAdmin && (
              <Link
                to="/super-admin/users"
                className="flex items-center space-x-1 text-text-primary hover:text-brand transition-colors"
                title="用户管理"
              >
                <Users className="w-6 h-6" />
                <span className="hidden sm:inline text-sm">用户</span>
              </Link>
            )}

            {/* 购物车 */}
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-text-primary hover:text-brand transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* 用户入口 */}
            {user ? (
              <Link to="/account" className="flex items-center space-x-2 hover:text-brand transition-colors">
                <User className="w-6 h-6" />
                <span className="hidden sm:inline text-sm">我的</span>
              </Link>
            ) : (
              <Link to="/login" className="text-sm hover:text-brand transition-colors">
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
