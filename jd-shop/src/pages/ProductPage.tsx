import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Check } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase, Product } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cartEvents } from '@/lib/events'
import { useFavoriteStatus } from '@/hooks/useFavoriteStatus'
import { toast } from 'sonner'
import RatingStars from '@/components/RatingStars'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const {
    isFavorite,
    loading: favoriteLoading,
    mutating: favoriteMutating,
    toggleFavorite
  } = useFavoriteStatus(product?.id)

  const loadProduct = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        // 如果products表不存在，显示测试数据
        if (error.code === 'PGRST205') {
          console.log('Products table does not exist, showing test data')
          const testProduct = getTestProduct(parseInt(id || '1'))
          setProduct(testProduct)
          setLoading(false)
          return
        }
        throw error
      }
      setProduct(data)
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  // 临时测试数据生成器
  const getTestProduct = (productId: number): Product => {
    const testProducts = [
      {
        id: 2,
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
        id: 1,
        name: 'MacBook Pro 16英寸',
        short_description: 'M3 Max芯片，专业级性能',
        description: '全新M3 Max芯片，16英寸Liquid Retina XDR显示屏，适合专业创意工作者。',
        price: 22999.00,
        original_price: 24999.00,
        category_id: 1,
        brand: 'Apple',
        stock: 20,
        rating: 4.9,
        review_count: 128,
        main_image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
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
      }
    ]
    
    // 找到匹配的测试产品，如果没有找到则使用第一个
    const product = testProducts.find(p => p.id === productId) || testProducts[0]
    return {
      ...product,
      id: productId
    }
  }

  useEffect(() => {
    if (id) loadProduct()
  }, [id, loadProduct])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!product) return

    setAdding(true)
    try {
      // 检查购物车中是否已有此商品
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle()

      if (existing) {
        // 更新数量
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
      } else {
        // 新增
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity
          })
      }

      // 触发购物车更新事件
      cartEvents.emit('cart:updated')
      
      // 显示成功提示
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => navigate('/cart'), 1500)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('加入购物车失败，请重试')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    if (!user) {
      navigate('/login')
      return
    }

    try {
      const nextState = await toggleFavorite()
      toast.success(nextState ? '已加入收藏' : '已取消收藏')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('更新收藏状态失败，请稍后再试')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">加载中...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary mb-4">商品不存在</p>
            <Link to="/" className="text-brand hover:underline">返回首页</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto py-8">
          {/* 面包屑 */}
          <div className="mb-6 text-sm text-text-secondary">
            <Link to="/" className="hover:text-brand">首页</Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{product.name}</span>
          </div>

          {/* 商品信息 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* 左侧：图片 */}
            <div className="space-y-4">
              <div className="aspect-square bg-background-surface rounded-lg overflow-hidden">
                <img
                  src={product.main_image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* 右侧：购买盒子 */}
            <div className="space-y-6">
              <div>
                <h1 className="text-h1 font-bold text-text-primary mb-4">
                  {product.name}
                </h1>
                <p className="text-lg text-text-secondary">
                  {product.short_description}
                </p>
              </div>

              {/* 评分 */}
              <div className="flex items-center space-x-4">
                <RatingStars
                  rating={product.rating}
                  reviewCount={product.review_count}
                  size="sm"
                />
                <span className="text-text-secondary">
                  {product.rating.toFixed(1)} 分
                </span>
                <span className="text-text-tertiary">
                  {product.review_count} 条评价
                </span>
              </div>

              {/* 价格 */}
              <div className="py-6 border-y border-background-divider">
                <div className="flex items-baseline space-x-4">
                  <span className="text-price-current font-bold text-error">
                    ¥{product.price.toFixed(2)}
                  </span>
                  {product.original_price && (
                    <span className="text-price-original text-text-tertiary line-through">
                      ¥{product.original_price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* 库存 */}
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-text-secondary">库存:</span>
                <span className={product.stock > 10 ? 'text-success' : 'text-error'}>
                  {product.stock > 0 ? `${product.stock} 件` : '暂无库存'}
                </span>
              </div>

              {/* 数量选择 */}
              <div className="flex items-center space-x-4">
                <span className="text-text-secondary">数量:</span>
                <div className="flex items-center border border-background-divider rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-background-surface transition-colors text-lg font-medium"
                  >
                    -
                  </button>
                  <span className="w-16 h-12 flex items-center justify-center border-x border-background-divider text-base font-medium text-text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-background-surface transition-colors text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3 relative">
                {/* 成功提示 */}
                {showSuccess && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-success text-white px-6 py-3 rounded-md shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">已加入购物车</span>
                  </div>
                )}
                
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="w-full h-14 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover disabled:bg-background-divider disabled:text-text-tertiary transition-colors duration-fast flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{adding ? '添加中...' : product.stock > 0 ? '加入购物车' : '暂无库存'}</span>
                </button>
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading || favoriteMutating || !product}
                  className="w-full h-14 border-2 border-cta-secondary-border text-text-primary font-semibold rounded-md hover:border-brand hover:text-brand transition-colors duration-fast flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite ? 'fill-error text-error' : ''}`}
                  />
                  <span>{isFavorite ? '已收藏' : '收藏'}</span>
                </button>
              </div>

              {/* 信任标识 */}
              <div className="flex items-center space-x-6 text-sm text-text-secondary pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span>7天无理由退换</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span>正品保证</span>
                </div>
              </div>
            </div>
          </div>

          {/* 商品详情 */}
          <div className="mt-12 space-y-8">
            <div>
              <h2 className="text-h2 font-semibold text-text-primary mb-4">商品详情</h2>
              <div className="bg-background-surface p-6 rounded-lg">
                <p className="text-text-primary leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-h2 font-semibold text-text-primary mb-4">商品参数</h2>
              <div className="bg-background-surface p-6 rounded-lg">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex">
                    <dt className="w-24 text-text-secondary">品牌:</dt>
                    <dd className="text-text-primary">{product.brand}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-text-secondary">库存:</dt>
                    <dd className="text-text-primary">{product.stock} 件</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
