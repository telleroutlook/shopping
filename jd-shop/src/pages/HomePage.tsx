import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Sparkles, Truck } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import RatingStars from '@/components/RatingStars'
import { supabase, Product, Category } from '@/lib/supabase'

const heroHighlights = [
  { icon: Truck, label: '48H 极速发货' },
  { icon: ShieldCheck, label: '正品保障与七天退换' },
  { icon: Sparkles, label: '优选上新 · 人气推荐' }
]

const skeletonItems = Array.from({ length: 8 })

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
      const [{ data: categoriesData }, { data: productsData }] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .is('parent_id', null)
          .order('sort_order')
          .limit(8),
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(20)
      ])

      if (categoriesData) setCategories(categoriesData)
      if (productsData && productsData.length > 0) {
        setHeroProduct(productsData[0])
        const hot = [...productsData]
          .sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
          .slice(0, 8)
        setHotProducts(hot)
        setNewProducts(productsData.slice(1, 9))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto space-y-10 py-12">
          <div className="h-[320px] rounded-[32px] bg-background-surface animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skeletonItems.map((_, index) => (
              <div
                key={`cat-skel-${index}`}
                className="h-24 rounded-2xl bg-background-surface animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {skeletonItems.map((_, index) => (
              <div
                key={`card-skel-${index}`}
                className="h-64 rounded-xl bg-background-surface animate-pulse"
              />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 space-y-10">
        {heroProduct && (
          <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
            <div className="container mx-auto py-14">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
                <div className="flex-1 space-y-6">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                    甄选推荐
                  </p>
                  <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                    {heroProduct.name}
                  </h1>
                  <p className="max-w-2xl text-base text-white/80">
                    {heroProduct.short_description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <RatingStars
                      rating={heroProduct.rating}
                      reviewCount={heroProduct.review_count}
                      className="!text-white"
                    />
                    <span className="text-sm text-white/80">
                      {heroProduct.review_count} 条评价 · {heroProduct.rating.toFixed(1)} 分
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to={`/product/${heroProduct.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                    >
                      立即查看
                    </Link>
                    <div className="flex items-baseline space-x-3 text-white/90">
                      <span className="text-3xl font-bold text-white">
                        ¥{heroProduct.price.toFixed(2)}
                      </span>
                      {heroProduct.original_price && heroProduct.original_price > heroProduct.price && (
                        <span className="text-sm line-through text-white/80">
                          ¥{heroProduct.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {heroHighlights.map((highlight) => (
                      <div
                        key={highlight.label}
                        className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur"
                      >
                        <highlight.icon className="w-4 h-4 text-white" />
                        <span>{highlight.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative overflow-hidden rounded-[32px] bg-white/10 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur">
                    <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-[32px]" />
                    <img
                      src={heroProduct.main_image}
                      alt={heroProduct.name}
                      className="relative w-full h-[320px] object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-10">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <h2 className="text-h2 font-semibold text-text-primary">热门分类</h2>
              <Link to="/search" className="text-sm text-brand hover:underline">
                查看全部分类
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="rounded-2xl border border-background-divider bg-white/60 px-4 py-6 text-center text-sm font-semibold text-text-primary transition-all duration-base hover:border-brand hover:shadow-card-hover"
                >
                  <div className="text-2xl font-bold text-brand mb-2">
                    {category.name[0]}
                  </div>
                  <p className="text-xs uppercase tracking-wide text-text-tertiary">
                    {category.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 bg-background-surface">
          <div className="container mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-h2 font-semibold text-text-primary">热门商品</h2>
                <p className="text-sm text-text-secondary">
                  精选好评最高的商品，实时更新
                </p>
              </div>
              <Link to="/search?q=热销" className="text-sm text-brand hover:underline">
                查看全部热门
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {hotProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  tag={index === 0 ? '热销' : undefined}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-h2 font-semibold text-text-primary">新品推荐</h2>
                <p className="text-sm text-text-secondary">
                  最新上架，为你精选的第一波新品
                </p>
              </div>
              <Link to="/search?q=新品" className="text-sm text-brand hover:underline">
                查看更多新品
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} className="h-full" />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
