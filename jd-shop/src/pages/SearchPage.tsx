import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase, Product } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const normalizedQuery = query.trim()
  const hasQuery = normalizedQuery.length > 0
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(() => hasQuery)

  const search = useCallback(async (keyword: string) => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%,brand.ilike.%${keyword}%`)

      if (data) setProducts(data)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasQuery) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    search(normalizedQuery)
  }, [hasQuery, normalizedQuery, search])

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
            {hasQuery ? `搜索结果：${normalizedQuery}` : '搜索商品'}
          </h1>
          <p className="text-text-secondary mb-8">
            {hasQuery ? `找到 ${products.length} 个商品` : '输入关键词即可快速定位商品'}
          </p>

          {!hasQuery ? (
            <div className="text-center py-16 border border-dashed border-background-divider rounded-lg">
              <p className="text-text-secondary mb-4">请输入要搜索的商品名称、品牌或描述</p>
              <p className="text-sm text-text-tertiary">例如：“耳机”“咖啡机”“苹果手机”</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-secondary mb-4">未找到相关商品</p>
              <Link to="/" className="text-brand hover:underline">返回首页</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} className="h-full" />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
