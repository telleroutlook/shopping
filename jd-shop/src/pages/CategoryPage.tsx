import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase, Product, Category } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (categoryData) setCategory(categoryData)

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', id)
        .eq('is_active', true)

      if (productsData) setProducts(productsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) loadData()
  }, [id, loadData])

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
      <main className="flex-1 py-8">
        <div className="container mx-auto">
          <div className="mb-6 text-sm text-text-secondary">
            <Link to="/" className="hover:text-brand">首页</Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{category?.name}</span>
          </div>

          <h1 className="text-h1 font-bold text-text-primary mb-8">
            {category?.name}
          </h1>

            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-secondary">该分类暂无商品</p>
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
