import { supabase } from './supabase'

// 初始化基础数据
export async function initializeBaseData() {
  try {
    // 检查categories表是否存在并有数据
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1)

    if (categoriesError) {
      console.error('Categories table error:', categoriesError)
      return { success: false, error: categoriesError.message }
    }

    // 如果没有分类数据，创建基础数据
    if (!categories || categories.length === 0) {
      const { error: insertError } = await supabase
        .from('categories')
        .insert([
          { name: '数码3C', icon_name: 'smartphone', sort_order: 1 },
          { name: '家用电器', icon_name: 'home', sort_order: 2 },
          { name: '服装鞋包', icon_name: 'shirt', sort_order: 3 },
          { name: '美妆个护', icon_name: 'sparkles', sort_order: 4 },
          { name: '食品饮料', icon_name: 'coffee', sort_order: 5 },
          { name: '运动户外', icon_name: 'dumbbell', sort_order: 6 },
          { name: '家居生活', icon_name: 'home', sort_order: 7 },
          { name: '母婴玩具', icon_name: 'baby', sort_order: 8 }
        ])

      if (insertError) {
        console.error('Categories insert error:', insertError)
        return { success: false, error: insertError.message }
      }
    }

    // 检查products表是否存在并有数据
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)

    if (productsError) {
      console.error('Products table error:', productsError)
      return { success: false, error: productsError.message }
    }

    // 如果没有商品数据，创建基础商品
    if (!products || products.length === 0) {
      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
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
            is_active: true
          },
          {
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
            is_active: true
          },
          {
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
            is_active: true
          },
          {
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
            is_active: true
          },
          {
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
            is_active: true
          }
        ])

      if (insertError) {
        console.error('Products insert error:', insertError)
        return { success: false, error: insertError.message }
      }
    }

    return { success: true, message: 'Base data initialized successfully' }
  } catch (error) {
    console.error('Initialize data error:', error)
    return { success: false, error: error.message }
  }
}