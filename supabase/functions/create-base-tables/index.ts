import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 创建分类表
    const { error: categoriesError } = await supabaseClient.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id INTEGER,
            icon_name TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })

    if (categoriesError) {
      console.error('Categories table creation error:', categoriesError)
    }

    // 创建商品表
    const { error: productsError } = await supabaseClient.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            short_description TEXT,
            price DECIMAL(10,2) NOT NULL,
            original_price DECIMAL(10,2),
            category_id INTEGER,
            brand TEXT,
            stock INTEGER DEFAULT 0,
            rating DECIMAL(3,2) DEFAULT 0,
            review_count INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            main_image TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })

    if (productsError) {
      console.error('Products table creation error:', productsError)
    }

    // 创建商品图片表
    const { error: imagesError } = await supabaseClient.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS product_images (
            id SERIAL PRIMARY KEY,
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            image_url TEXT NOT NULL,
            alt_text TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })

    if (imagesError) {
      console.error('Product images table creation error:', imagesError)
    }

    // 插入测试数据
    const { error: dataError } = await supabaseClient.rpc('exec_sql', {
      query: `
        -- 插入测试分类数据
        INSERT INTO categories (name, icon_name, sort_order) VALUES
            ('数码3C', 'smartphone', 1),
            ('家用电器', 'home', 2),
            ('服装鞋包', 'shirt', 3),
            ('美妆个护', 'sparkles', 4),
            ('食品饮料', 'coffee', 5),
            ('运动户外', 'dumbbell', 6),
            ('家居生活', 'home', 7),
            ('母婴玩具', 'baby', 8)
        ON CONFLICT DO NOTHING;

        -- 插入测试商品数据
        INSERT INTO products (name, short_description, description, price, original_price, category_id, brand, stock, rating, review_count, main_image, is_active) VALUES
            ('iPhone 15 Pro Max', '全新钛金属设计，A17 Pro芯片', '苹果最新旗舰手机，采用钛金属材质，搭载A17 Pro芯片，配备48MP主摄像头系统。', 8999.00, 9999.00, 1, 'Apple', 50, 4.8, 256, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', true),
            ('MacBook Pro 16英寸', 'M3 Max芯片，专业级性能', '全新M3 Max芯片，16英寸Liquid Retina XDR显示屏，适合专业创意工作者。', 22999.00, 24999.00, 1, 'Apple', 20, 4.9, 128, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', true),
            ('AirPods Pro 3', '主动降噪，空间音频', '全新AirPods Pro 3代，支持主动降噪、空间音频和自适应透明度模式。', 1899.00, 2199.00, 1, 'Apple', 100, 4.7, 432, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400', true),
            ('海尔洗衣机', '变频节能，大容量', '10公斤变频滚筒洗衣机，蒸汽洗护，节能静音，适合大家庭使用。', 2899.00, 3299.00, 2, '海尔', 30, 4.6, 89, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true),
            ('美的冰箱', '风冷无霜，智能保鲜', '520升变频风冷无霜冰箱，三门设计，智能温控，保鲜效果佳。', 3999.00, 4599.00, 2, '美的', 25, 4.5, 67, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', true),
            ('Nike运动鞋', '舒适透气，适合跑步', 'Nike Air Zoom系列跑步鞋，舒适透气，缓震性能优异，适合各种运动场景。', 899.00, 1199.00, 6, 'Nike', 80, 4.4, 156, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', true),
            ('Adidas外套', '防风防雨，时尚百搭', 'Adidas经典运动外套，防风防雨，透气排汗，时尚设计与功能性完美结合。', 599.00, 799.00, 6, 'Adidas', 60, 4.3, 234, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', true),
            ('兰蔻面霜', '抗衰老，深度滋养', '兰蔻小黑瓶面霜，抗衰老成分，深度滋养肌肤，改善肌肤质感。', 680.00, 850.00, 4, '兰蔻', 40, 4.6, 187, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', true),
            ('SK-II神仙水', '补水保湿，焕发光彩', 'SK-II经典神仙水，深层补水保湿，改善肌肤质感，焕发光彩。', 1590.00, 1780.00, 4, 'SK-II', 35, 4.7, 298, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', true),
            ('茅台酒', '国酒典范，收藏佳品', '贵州茅台53度酱香型白酒，传统工艺，醇厚口感，是送礼和收藏的佳品。', 2699.00, 2999.00, 5, '茅台', 15, 4.8, 45, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400', true),
            ('瑞士手表', '经典设计，精准走时', '瑞士进口机械手表，经典设计，自动上链，精准走时，适合商务人士。', 5599.00, 6999.00, 3, '瑞士进口', 10, 4.9, 23, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400', true),
            ('小米电视', '4K超清，智能语音', '55英寸4K超清智能电视，支持HDR10+，内置小爱同学，海量影视内容。', 2299.00, 2799.00, 2, '小米', 45, 4.4, 167, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', true)
        ON CONFLICT DO NOTHING;
      `
    })

    if (dataError) {
      console.error('Data insertion error:', dataError)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Base tables created successfully',
      errors: {
        categories: categoriesError?.message,
        products: productsError?.message,
        images: imagesError?.message,
        data: dataError?.message
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({
      error: {
        code: 'FUNCTION_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})