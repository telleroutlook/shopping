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
      const [{ data: categoriesData, error: categoriesError }, { data: productsData, error: productsError }] = await Promise.all([
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

      // 处理分类数据
      if (categoriesError) {
        console.error('获取分类失败:', categoriesError)
        setCategories(getMockCategories())
      } else if (categoriesData) {
        setCategories(categoriesData)
      }

      // 处理商品数据
      if (productsError) {
        console.error('获取商品失败:', productsError)
        const mockProducts = getMockProducts()
        if (mockProducts.length > 0) {
          setHeroProduct(mockProducts[0])
          const hot = [...mockProducts]
            .sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
          setHotProducts(hot.slice(0, 8))
          setNewProducts(mockProducts.slice(0, 8))
        }
      } else if (productsData && productsData.length > 0) {
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

// 模拟数据函数
function getMockProducts(): Product[] {
  return [
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: '海尔洗衣机',
      short_description: '变频节能，大容量',
      description: '10公斤变频滚筒洗衣机，蒸汽洗护，节能静音，适合大家庭使用。',
      price: 2899.00,
      original_price: 3299.00,
      category_id: 2,
      brand: '海尔',
      stock: 30,
      rating: 4.6,
      review_count: 89,
      main_image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: '美的冰箱',
      short_description: '风冷无霜，智能保鲜',
      description: '520升变频风冷无霜冰箱，三门设计，智能温控，保鲜效果佳。',
      price: 3999.00,
      original_price: 4599.00,
      category_id: 2,
      brand: '美的',
      stock: 25,
      rating: 4.5,
      review_count: 67,
      main_image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Nike运动鞋',
      short_description: '舒适透气，适合跑步',
      description: 'Nike Air Zoom系列跑步鞋，舒适透气，缓震性能优异，适合各种运动场景。',
      price: 899.00,
      original_price: 1199.00,
      category_id: 6,
      brand: 'Nike',
      stock: 80,
      rating: 4.4,
      review_count: 156,
      main_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 7,
      name: 'Adidas外套',
      short_description: '防风防雨，时尚百搭',
      description: 'Adidas经典运动外套，防风防雨，透气排汗，时尚设计与功能性完美结合。',
      price: 599.00,
      original_price: 799.00,
      category_id: 6,
      brand: 'Adidas',
      stock: 60,
      rating: 4.3,
      review_count: 234,
      main_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 10,
      name: '茅台酒',
      short_description: '国酒典范，收藏佳品',
      description: '贵州茅台53度酱香型白酒，传统工艺，醇厚口感，是送礼和收藏的佳品。',
      price: 2699.00,
      original_price: 2999.00,
      category_id: 5,
      brand: '茅台',
      stock: 15,
      rating: 4.8,
      review_count: 45,
      main_image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 11,
      name: '瑞士手表',
      short_description: '经典设计，精准走时',
      description: '瑞士进口机械手表，经典设计，自动上链，精准走时，适合商务人士。',
      price: 5599.00,
      original_price: 6999.00,
      category_id: 3,
      brand: '瑞士进口',
      stock: 10,
      rating: 4.9,
      review_count: 23,
      main_image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 12,
      name: '小米电视',
      short_description: '4K超清，智能语音',
      description: '55英寸4K超清智能电视，支持HDR10+，内置小爱同学，海量影视内容。',
      price: 2299.00,
      original_price: 2799.00,
      category_id: 2,
      brand: '小米',
      stock: 45,
      rating: 4.4,
      review_count: 167,
      main_image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

function getMockCategories(): Category[] {
  return [
    {
      id: 1,
      name: '数码3C',
      slug: 'digital-3c',
      description: '手机电脑等数码产品',
      icon: 'smartphone',
      color: '#3B82F6',
      parent_id: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: '家用电器',
      slug: 'home-appliances',
      description: '家电产品',
      icon: 'tv',
      color: '#EF4444',
      parent_id: null,
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: '服装鞋包',
      slug: 'fashion',
      description: '时尚服装鞋帽',
      icon: 'shirt',
      color: '#10B981',
      parent_id: null,
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: '美妆个护',
      slug: 'beauty',
      description: '化妆品和个人护理',
      icon: 'sparkles',
      color: '#EC4899',
      parent_id: null,
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ]
}
