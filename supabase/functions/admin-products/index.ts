import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withAuthAndPermissions, PERMISSIONS, createSupabaseClient } from '../_shared/auth-middleware.ts'
import { withRateLimit } from '../_shared/rate-limit-middleware.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

// 应用速率限制，然后是权限验证
Deno.serve(
  withRateLimit('products')(withAuthAndPermissions(
    PERMISSIONS.MANAGE_PRODUCTS,
    'manage_products',
    'products'
  )(async (req: Request, user: any) => {
    const corsHeaders = getCorsHeaders(req)

    try {
      const { action, productData } = await req.json()
      const supabase = createSupabaseClient()

      switch (action) {
        case 'create':
          return await createProduct(supabase, productData, user, corsHeaders)
        case 'update':
          return await updateProduct(supabase, productData, user, corsHeaders)
        case 'delete':
          return await deleteProduct(supabase, productData, user, corsHeaders)
        case 'update_stock':
          return await updateStock(supabase, productData, user, corsHeaders)
        default:
          throw new Error('无效的操作类型')
      }
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'ADMIN_PRODUCT_ERROR',
            message: error.message
          }
        }),
        {
          status: error.message.includes('权限不足') ? 403 : 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }
  }))
)

async function createProduct(supabase: any, productData: any, user: any, corsHeaders: Record<string, string>) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: productData.name,
      category_id: productData.category_id,
      brand: productData.brand,
      price: productData.price,
      original_price: productData.original_price,
      stock: productData.stock,
      main_image: productData.main_image,
      description: productData.description,
      short_description: productData.short_description,
      is_active: productData.is_active !== false,
      created_by: user.id // 记录创建者
    })
    .select()
    .single()

  if (error) throw new Error('创建商品失败：' + error.message)

  console.log(`商品创建成功 - 操作者: ${user.email}, 商品ID: ${data.id}`)

  return new Response(
    JSON.stringify({ data }),
    { 
      status: 200, 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )
}

async function updateProduct(supabase: any, productData: any, user: any, corsHeaders: Record<string, string>) {
  const { id, ...updateFields } = productData
  
  const { data, error } = await supabase
    .from('products')
    .update({
      ...updateFields,
      updated_by: user.id, // 记录更新者
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error('更新商品失败：' + error.message)

  console.log(`商品更新成功 - 操作者: ${user.email}, 商品ID: ${data.id}`)

  return new Response(
    JSON.stringify({ data }),
    { 
      status: 200, 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )
}

async function deleteProduct(supabase: any, productData: any, user: any, corsHeaders: Record<string, string>) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productData.id)

  if (error) throw new Error('删除商品失败：' + error.message)

  console.log(`商品删除成功 - 操作者: ${user.email}, 商品ID: ${productData.id}`)

  return new Response(
    JSON.stringify({ data: { success: true } }),
    { 
      status: 200, 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )
}

async function updateStock(supabase: any, productData: any, user: any, corsHeaders: Record<string, string>) {
  const { data, error } = await supabase
    .from('products')
    .update({
      stock: productData.stock,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', productData.id)
    .select()
    .single()

  if (error) throw new Error('更新库存失败：' + error.message)

  console.log(`商品库存更新成功 - 操作者: ${user.email}, 商品ID: ${data.id}, 新库存: ${data.stock}`)

  return new Response(
    JSON.stringify({ data }),
    { 
      status: 200, 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )
}
