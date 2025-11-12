import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase, Product } from '@/lib/supabase'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) search()
  }, [query, search])

  const search = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)

      if (data) setProducts(data)
    } catch (error) {
      console.error('Error searching:', error)
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
            className={`w-4 h-4 ${star <= rating ? 'fill-warning text-warning' : 'text-gray-300'}`}
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
          <p className="text-text-secondary">搜索中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto">
          <h1 className="text-h2 font-semibold text-text-primary mb-2">
            搜索结果：{query}
          </h1>
          <p className="text-text-secondary mb-8">找到 {products.length} 个商品</p>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-secondary mb-4">未找到相关商品</p>
              <Link to="/" className="text-brand hover:underline">返回首页</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
