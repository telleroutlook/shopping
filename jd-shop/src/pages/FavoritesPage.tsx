import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ProductCard from '@/components/ProductCard'
import { supabase, Product } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cartEvents } from '@/lib/events'

export default function FavoritesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const loadFavorites = useCallback(async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      // 模拟收藏商品数据
      const favoriteIds = [1, 3, 8, 9] // 模拟收藏的商品ID
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', favoriteIds)

      if (products) {
        setFavorites(products)
      } else {
        // 如果没有数据库数据，使用模拟数据
        const mockFavorites = [
          {
            id: 1,
            name: 'iPhone 15 Pro Max',
            short_description: '全新钛金属设计，A17 Pro芯片',
            description: '苹果最新旗舰手机，采用钛金属材质，搭载A17 Pro芯片，配备48MP主摄像头系统。',
            price: 8999.00,
            original_price: 9999.00,
            category_id: 1,
            brand: 'Apple',
            stock: 50,
            rating: 4.8,
            review_count: 256,
            main_image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 3,
            name: 'AirPods Pro 3',
            short_description: '主动降噪，空间音频',
            description: '全新AirPods Pro 3代，支持主动降噪、空间音频和自适应透明度模式。',
            price: 1899.00,
            original_price: 2199.00,
            category_id: 1,
            brand: 'Apple',
            stock: 100,
            rating: 4.7,
            review_count: 432,
            main_image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 8,
            name: '兰蔻面霜',
            short_description: '抗衰老，深度滋养',
            description: '兰蔻小黑瓶面霜，抗衰老成分，深度滋养肌肤，改善肌肤质感。',
            price: 680.00,
            original_price: 850.00,
            category_id: 4,
            brand: '兰蔻',
            stock: 40,
            rating: 4.6,
            review_count: 187,
            main_image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 9,
            name: 'SK-II神仙水',
            short_description: '补水保湿，焕发光彩',
            description: 'SK-II经典神仙水，深层补水保湿，改善肌肤质感，焕发光彩。',
            price: 1590.00,
            original_price: 1780.00,
            category_id: 4,
            brand: 'SK-II',
            stock: 35,
            rating: 4.7,
            review_count: 298,
            main_image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
        setFavorites(mockFavorites as Product[])
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }, [user, navigate])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      // 这里可以添加实际的购物车逻辑
      cartEvents.emit('cart:updated')
      alert(`已加入购物车：${product.name}`)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-h1 font-bold text-text-primary">我的收藏</h1>
          <Link to="/account" className="text-brand hover:underline">
            返回账户
          </Link>
        </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary mb-4">您还没有收藏任何商品</p>
              <Link
                to="/"
                className="inline-flex items-center justify-center h-12 px-6 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors duration-fast"
              >
                去逛逛
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <p className="text-text-secondary">
                  共 {favorites.length} 件收藏商品
                </p>
                <div className="flex items-center space-x-4">
                  <button className="text-sm text-brand hover:underline">
                    批量管理
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favorites.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard 
                      product={product} 
                      className="h-full" 
                    />
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur border border-background-divider rounded-full flex items-center justify-center text-text-tertiary hover:text-brand hover:border-brand transition-colors shadow-sm"
                      title="加入购物车"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </PageShell>
  )
}
