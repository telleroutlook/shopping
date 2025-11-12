import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Package } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useRequireAdmin } from '@/hooks/usePermission'
import { supabase, Product, Category } from '@/lib/supabase'
import { adminProductsApi } from '@/lib/api'
import { productSchema, getValidationErrors, ProductFormData } from '@/lib/validation'
import { toast } from 'sonner'

export default function AdminProductsPage() {
  const { loading: permissionLoading, hasPermission } = useRequireAdmin()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category_id: 1,
    brand: '',
    price: 0,
    original_price: 0,
    stock: 0,
    main_image: '',
    description: '',
    short_description: '',
    is_active: true
  })
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!permissionLoading) {
      if (hasPermission) {
        loadData()
      } else {
        setLoading(false)
      }
    }
  }, [permissionLoading, hasPermission])

  const loadData = async () => {
    try {
      // 加载商品
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      // 加载分类
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')

      if (productsData) setProducts(productsData)
      if (categoriesData) setCategories(categoriesData)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})
    
    try {
      // 使用Zod验证表单数据
      const validatedData = productSchema.parse(formData)
      
      // 验证通过，执行提交
      if (editingProduct) {
        await adminProductsApi.update(editingProduct.id, validatedData)
        toast.success('商品更新成功')
      } else {
        await adminProductsApi.create(validatedData)
        toast.success('商品创建成功')
      }
      
      // 重置表单并关闭
      setShowForm(false)
      setEditingProduct(null)
      resetForm()
      loadData()
      
    } catch (error: any) {
      if (error.name === 'ZodError') {
        // 处理验证错误
        const errors = getValidationErrors(error)
        const errorMap: { [key: string]: string } = {}
        
        errors.forEach(err => {
          errorMap[err.field] = err.message
        })
        
        setValidationErrors(errorMap)
        toast.error('请检查表单中的错误信息')
      } else {
        // 处理其他错误
        console.error('提交失败:', error)
        toast.error(error.message || '操作失败，请稍后重试')
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category_id: product.category_id,
      brand: product.brand,
      price: product.price,
      original_price: product.original_price,
      stock: product.stock,
      main_image: product.main_image,
      description: product.description,
      short_description: product.short_description,
      is_active: product.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个商品吗？')) return
    
    try {
      await adminProductsApi.delete(id)
      alert('商品删除成功')
      loadData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: 1,
      brand: '',
      price: 0,
      original_price: 0,
      stock: 0,
      main_image: '',
      description: '',
      short_description: '',
      is_active: true
    })
    setValidationErrors({})
  }

  if (permissionLoading || loading) {
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-h1 font-bold text-text-primary">商品管理</h1>
            <button
              onClick={() => {
                setEditingProduct(null)
                resetForm()
                setShowForm(true)
              }}
              className="flex items-center space-x-2 px-6 h-14 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>添加商品</span>
            </button>
          </div>

          {showForm && (
            <div className="bg-white border border-background-divider rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">
                {editingProduct ? '编辑商品' : '添加商品'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      商品名称 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full h-14 px-4 border rounded-md focus:border-brand focus:outline-none text-base ${
                        validationErrors.name ? 'border-red-500' : 'border-background-divider'
                      }`}
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      品牌 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      分类 *
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                      className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      库存 *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      价格 (元) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className={`w-full h-14 px-4 border rounded-md focus:border-brand focus:outline-none text-base ${
                        validationErrors.price ? 'border-red-500' : 'border-background-divider'
                      }`}
                    />
                    {validationErrors.price && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      原价 (元)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) })}
                      className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    商品图片URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.main_image}
                    onChange={(e) => setFormData({ ...formData, main_image: e.target.value })}
                    className={`w-full h-14 px-4 border rounded-md focus:border-brand focus:outline-none text-base ${
                      validationErrors.main_image ? 'border-red-500' : 'border-background-divider'
                    }`}
                    placeholder="https://..."
                  />
                  {validationErrors.main_image && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.main_image}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    简短描述 *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-4 py-3 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    详细描述 *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-text-primary">商品上架</span>
                  </label>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 h-14 bg-brand text-white font-semibold rounded-md hover:bg-brand-hover transition-colors"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingProduct(null)
                      resetForm()
                    }}
                    className="flex-1 h-14 border-2 border-background-divider text-text-primary font-semibold rounded-md hover:border-brand transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {products.length === 0 ? (
            <div className="bg-white border border-background-divider rounded-lg p-12 text-center">
              <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary mb-4">还没有商品</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-brand hover:underline"
              >
                添加第一个商品
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-background-divider rounded-lg p-4 flex flex-col md:flex-row gap-4"
                >
                  <img
                    src={product.main_image}
                    alt={product.name}
                    className="w-full md:w-24 h-48 md:h-24 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1 break-words">{product.name}</h3>
                      <p className="text-sm text-text-tertiary mb-2">{product.brand}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="text-error font-semibold">¥{product.price}</span>
                        <span className="text-text-tertiary">库存: {product.stock}</span>
                        <span className={product.is_active ? 'text-success' : 'text-text-tertiary'}>
                          {product.is_active ? '已上架' : '未上架'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-center justify-end md:justify-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-brand hover:bg-brand/5 rounded transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-error hover:bg-error/5 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
