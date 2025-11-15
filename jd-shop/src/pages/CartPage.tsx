import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import PageShell from '@/components/PageShell'
import { supabase, CartItem, Product } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cartEvents } from '@/lib/events'

interface CartItemWithProduct extends CartItem {
  product: Product
}

export default function CartPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)

  const loadCart = useCallback(async () => {
    if (!user) {
      setCartItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      if (!data || data.length === 0) {
        setCartItems([])
        return
      }

      const productIds = data.map(item => item.product_id)
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)

      const itemsWithProducts = data.reduce<CartItemWithProduct[]>((acc, item) => {
        const product = products?.find(p => p.id === item.product_id)
        if (!product) {
          console.warn(`Product with ID ${item.product_id} not found in catalog, skipping cart item.`)
          return acc
        }
        acc.push({
          ...item,
          product
        })
        return acc
      }, [])

      if (itemsWithProducts.length === 0) {
        setCartItems([])
        return
      }

      setCartItems(itemsWithProducts)
    } catch (error) {
      console.error('Error loading cart:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadCart()
  }, [user, loadCart, navigate])

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId)

      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      )
      
      // 触发购物车更新事件
      cartEvents.emit('cart:updated')
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const removeItem = async (itemId: number) => {
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      setCartItems(items => items.filter(item => item.id !== itemId))
      
      // 触发购物车更新事件
      cartEvents.emit('cart:updated')
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  if (loading) {
    return (
      <PageShell mainClassName="flex items-center justify-center" innerClassName="max-w-3xl">
        <p className="text-text-secondary">加载中...</p>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="container mx-auto">
        <h1 className="text-h1 font-bold text-text-primary mb-8">购物车</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-secondary mb-4">购物车是空的</p>
              <Link to="/" className="text-brand hover:underline">
                去逛逛
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 购物车列表 */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-background-divider rounded-lg p-4 flex gap-4"
                  >
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={item.product.main_image}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="block font-medium text-text-primary hover:text-brand line-clamp-2 mb-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-text-tertiary mb-2">
                        {item.product.brand}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-error">
                          ¥{item.product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-background-divider rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-12 h-12 flex items-center justify-center hover:bg-background-surface transition-colors text-lg font-medium"
                            >
                              -
                            </button>
                            <span className="w-16 h-12 flex items-center justify-center border-x border-background-divider text-base font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-12 h-12 flex items-center justify-center hover:bg-background-surface transition-colors text-lg font-medium"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-text-tertiary hover:text-error transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 价格汇总 */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="bg-background-surface rounded-lg p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-text-primary">
                    订单摘要
                  </h2>
                  <div className="space-y-2 py-4 border-y border-background-divider">
                    <div className="flex justify-between text-text-secondary">
                      <span>商品总额:</span>
                      <span>¥{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>运费:</span>
                      <span className="text-success">免费</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>总计:</span>
                    <span className="text-error">¥{totalAmount.toFixed(2)}</span>
                  </div>
                  <Link
                    to="/checkout"
                    className="block w-full h-14 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors duration-fast flex items-center justify-center"
                  >
                    去结算
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
    </PageShell>
  )
}
