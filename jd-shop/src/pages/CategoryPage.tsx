import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageShell from '@/components/PageShell'
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

      if (categoryData) {
        setCategory(categoryData)
      } else {
        // 如果数据库中没有分类数据，使用模拟数据
        const mockCategories = getMockCategories()
        const mockCategory = mockCategories.find(cat => cat.id === parseInt(id || '1'))
        if (mockCategory) {
          setCategory(mockCategory)
        }
      }

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', id)
        .eq('is_active', true)

      if (productsData && productsData.length > 0) {
        setProducts(productsData)
      } else {
        // 如果数据库中没有产品数据，使用模拟数据
        const mockProducts = getMockProducts()
        const filteredProducts = mockProducts.filter(product => 
          product.category_id === parseInt(id || '1')
        )
        setProducts(filteredProducts)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // 使用模拟数据作为回退
      const mockCategories = getMockCategories()
      const mockCategory = mockCategories.find(cat => cat.id === parseInt(id || '1'))
      if (mockCategory) {
        setCategory(mockCategory)
      }
      
      const mockProducts = getMockProducts()
      const filteredProducts = mockProducts.filter(product => 
        product.category_id === parseInt(id || '1')
      )
      setProducts(filteredProducts)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) loadData()
  }, [id, loadData])

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
    </PageShell>
  )
}

// 模拟分类数据
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
    },
    {
      id: 5,
      name: '食品饮料',
      slug: 'food-beverage',
      description: '食品饮料',
      icon: 'coffee',
      color: '#F59E0B',
      parent_id: null,
      sort_order: 5,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      name: '运动户外',
      slug: 'sports-outdoor',
      description: '运动户外用品',
      icon: 'dumbbell',
      color: '#06B6D4',
      parent_id: null,
      sort_order: 6,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      name: '家居生活',
      slug: 'home-living',
      description: '家居生活用品',
      icon: 'home',
      color: '#84CC16',
      parent_id: null,
      sort_order: 7,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 8,
      name: '母婴玩具',
      slug: 'baby-toys',
      description: '母婴玩具用品',
      icon: 'baby',
      color: '#F97316',
      parent_id: null,
      sort_order: 8,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ]
}

// 模拟产品数据
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
    }
  ]
}
