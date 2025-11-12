import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase, Product, Category } from '@/lib/supabase'

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [hotProducts, setHotProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [heroProduct, setHeroProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 加载分类
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('sort_order')
        .limit(8)

      if (categoriesData) setCategories(categoriesData)

      // 加载商品
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (productsData) {
        // Hero产品：选择第一个
        setHeroProduct(productsData[0])
        // 热门商品：按评分排序
        const hot = [...productsData].sort((a, b) => b.rating - a.rating).slice(0, 8)
        setHotProducts(hot)
        // 新品推荐：最新的商品
        setNewProducts(productsData.slice(1, 9))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-warning text-warning' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
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

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        {/* Hero区 */}
        {heroProduct && (
          <section className="bg-background-surface">
            <div className="container mx-auto py-12">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 lg:w-1/2">
                  <img
                    src={heroProduct.main_image}
                    alt={heroProduct.name}
                    className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                  />
                </div>
                <div className="flex-1 lg:w-1/2 space-y-6">
                  <h1 className="text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
                    {heroProduct.name}
                  </h1>
                  <p className="text-lg text-text-secondary">
                    {heroProduct.short_description}
                  </p>
                  <div className="flex items-baseline space-x-4">
                    <span className="text-price-current font-bold text-error">
                      ¥{heroProduct.price.toFixed(2)}
                    </span>
                    {heroProduct.original_price && (
                      <span className="text-price-original text-text-tertiary line-through">
                        ¥{heroProduct.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/product/${heroProduct.id}`}
                    className="inline-block px-12 py-4 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors duration-fast"
                  >
                    立即查看
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 分类导航 */}
        <section className="py-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="flex flex-col items-center p-4 bg-background-surface rounded-md hover:shadow-card transition-shadow duration-base group"
                >
                  <div className="w-12 h-12 mb-2 text-text-primary group-hover:text-brand transition-colors">
                    <div className="w-full h-full bg-background-divider rounded-full flex items-center justify-center">
                      <span className="text-xl">{category.name[0]}</span>
                    </div>
                  </div>
                  <span className="text-sm text-text-primary group-hover:text-brand transition-colors">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 热门商品 */}
        <section className="py-12">
          <div className="container mx-auto">
            <h2 className="text-h2 font-semibold text-text-primary mb-6">热门商品</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {hotProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-white border border-background-divider rounded-md overflow-hidden hover:shadow-card-hover transition-all duration-base group"
                >
                  <div className="aspect-square overflow-hidden bg-background-surface">
                    <img
                      src={product.main_image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-base"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-base font-medium text-text-primary line-clamp-2 min-h-[3rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {renderStars(Math.round(product.rating))}
                      <span className="text-sm text-text-tertiary">({product.review_count})</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-bold text-error">¥{product.price}</span>
                      {product.original_price && (
                        <span className="text-sm text-text-tertiary line-through">
                          ¥{product.original_price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 新品推荐 */}
        <section className="py-12 bg-background-surface">
          <div className="container mx-auto">
            <h2 className="text-h2 font-semibold text-text-primary mb-6">新品推荐</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {newProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-white border border-background-divider rounded-md overflow-hidden hover:shadow-card-hover transition-all duration-base group"
                >
                  <div className="aspect-square overflow-hidden bg-background-surface">
                    <img
                      src={product.main_image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-base"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-base font-medium text-text-primary line-clamp-2 min-h-[3rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {renderStars(Math.round(product.rating))}
                      <span className="text-sm text-text-tertiary">({product.review_count})</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-bold text-error">¥{product.price}</span>
                      {product.original_price && (
                        <span className="text-sm text-text-tertiary line-through">
                          ¥{product.original_price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
