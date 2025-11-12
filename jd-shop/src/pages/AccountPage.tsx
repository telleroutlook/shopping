import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Package, Heart, MapPin, Settings, Plus, Edit2, Trash2, Check, Key } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PasswordInput from '@/components/PasswordInput'
import { supabase, Order, Address } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { userPasswordApi } from '@/lib/api'
import { passwordChangeSchema, getValidationErrors } from '@/lib/validation'
import { toast } from 'sonner'

type TabType = 'orders' | 'addresses' | 'favorites' | 'settings'

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState({
    recipient_name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail_address: '',
    postal_code: '',
    is_default: false
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadData()
  }, [user, activeTab, loadData, navigate])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    
    try {
      if (activeTab === 'orders') {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        if (data) setOrders(data)
      } else if (activeTab === 'addresses') {
        const { data } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
        if (data) setAddresses(data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setFormData({
      recipient_name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail_address: '',
      postal_code: '',
      is_default: false
    })
    setShowAddressForm(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      recipient_name: address.recipient_name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail_address: address.detail_address,
      postal_code: address.postal_code || '',
      is_default: address.is_default
    })
    setShowAddressForm(true)
  }

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('确定要删除这个地址吗？')) return
    
    try {
      await supabase.from('addresses').delete().eq('id', id)
      setAddresses(addresses.filter(addr => addr.id !== id))
    } catch (error) {
      console.error('Error deleting address:', error)
      alert('删除失败，请重试')
    }
  }

  const handleSetDefault = async (id: number) => {
    if (!user) return
    
    try {
      // 取消所有默认地址
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
      
      // 设置新的默认地址
      await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
      
      loadData()
    } catch (error) {
      console.error('Error setting default:', error)
      alert('设置失败，请重试')
    }
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingAddress) {
        // 更新地址
        await supabase
          .from('addresses')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingAddress.id)
      } else {
        // 新增地址
        if (formData.is_default) {
          // 如果设为默认，先取消所有默认
          await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)
        }
        
        await supabase.from('addresses').insert({
          ...formData,
          user_id: user.id
        })
      }
      
      setShowAddressForm(false)
      loadData()
    } catch (error) {
      console.error('Error saving address:', error)
      alert('保存失败，请重试')
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '待支付',
      paid: '待发货',
      shipped: '运输中',
      completed: '已完成',
      cancelled: '已取消'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: 'text-warning',
      paid: 'text-info',
      shipped: 'text-info',
      completed: 'text-success',
      cancelled: 'text-text-tertiary'
    }
    return colorMap[status] || 'text-text-secondary'
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordValidationErrors({})
    
    try {
      // 使用Zod验证表单数据
      const validatedData = passwordChangeSchema.parse({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_new_password: passwordData.confirm_password
      })
      
      await userPasswordApi.change(validatedData.current_password, validatedData.new_password)
      toast.success('密码修改成功')
      setShowPasswordForm(false)
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      
    } catch (error: any) {
      if (error.name === 'ZodError') {
        // 处理验证错误
        const errors = getValidationErrors(error)
        const errorMap: { [key: string]: string } = {}
        
        errors.forEach(err => {
          errorMap[err.field] = err.message
        })
        
        setPasswordValidationErrors(errorMap)
        toast.error('请检查表单中的错误信息')
      } else {
        // 处理其他错误
        console.error('密码修改失败:', error)
        toast.error(error.message || '密码修改失败，请稍后重试')
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 侧边菜单 */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-background-divider rounded-lg p-6">
                <div className="mb-6 pb-6 border-b border-background-divider">
                  <p className="text-sm text-text-secondary mb-1">欢迎回来</p>
                  <p className="font-semibold text-text-primary">{user?.email}</p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                      activeTab === 'orders' ? 'bg-brand/5 text-brand' : 'text-text-primary hover:bg-background-surface'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                    <span>我的订单</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                      activeTab === 'addresses' ? 'bg-brand/5 text-brand' : 'text-text-primary hover:bg-background-surface'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                    <span>收货地址</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                      activeTab === 'favorites' ? 'bg-brand/5 text-brand' : 'text-text-primary hover:bg-background-surface'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span>我的收藏</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                      activeTab === 'settings' ? 'bg-brand/5 text-brand' : 'text-text-primary hover:bg-background-surface'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>账户设置</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-error hover:bg-error/5 rounded-md transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>退出登录</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* 主内容区 */}
            <div className="lg:col-span-3">
              {/* 我的订单 */}
              {activeTab === 'orders' && (
                <>
                  <h1 className="text-h2 font-semibold text-text-primary mb-6">我的订单</h1>
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-text-secondary">加载中...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white border border-background-divider rounded-lg p-12 text-center">
                      <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                      <p className="text-text-secondary mb-4">还没有订单</p>
                      <button onClick={() => navigate('/')} className="text-brand hover:underline">
                        去购物
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="w-full text-left bg-white border border-background-divider rounded-lg p-6 hover:shadow-card transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-medium text-text-primary">
                                订单号: {order.order_number}
                              </p>
                              <p className="text-sm text-text-tertiary mt-1">
                                {new Date(order.created_at).toLocaleString('zh-CN')}
                              </p>
                            </div>
                            <span className={`font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-text-secondary">
                                收货人: {order.recipient_name}
                              </p>
                              <p className="text-sm text-text-secondary mt-1">
                                {order.recipient_phone}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-text-secondary">订单金额</p>
                              <p className="text-xl font-bold text-error mt-1">
                                ¥{order.final_amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* 收货地址 */}
              {activeTab === 'addresses' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-h2 font-semibold text-text-primary">收货地址</h1>
                    <button
                      onClick={handleAddAddress}
                      className="flex items-center space-x-2 px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-hover transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>添加新地址</span>
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-text-secondary">加载中...</p>
                    </div>
                  ) : addresses.length === 0 && !showAddressForm ? (
                    <div className="bg-white border border-background-divider rounded-lg p-12 text-center">
                      <MapPin className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                      <p className="text-text-secondary mb-4">还没有收货地址</p>
                      <button
                        onClick={handleAddAddress}
                        className="text-brand hover:underline"
                      >
                        添加第一个地址
                      </button>
                    </div>
                  ) : (
                    <>
                      {showAddressForm && (
                        <div className="bg-white border border-background-divider rounded-lg p-6 mb-6">
                          <h2 className="text-lg font-semibold mb-4">
                            {editingAddress ? '编辑地址' : '新增地址'}
                          </h2>
                          <form onSubmit={handleSaveAddress} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                  收货人 *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.recipient_name}
                                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                                  className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                  手机号 *
                                </label>
                                <input
                                  type="tel"
                                  required
                                  value={formData.phone}
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                  className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                  省份 *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.province}
                                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                  className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                  城市 *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.city}
                                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                  className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                  区/县 *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.district}
                                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                  className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                详细地址 *
                              </label>
                              <textarea
                                required
                                rows={3}
                                value={formData.detail_address}
                                onChange={(e) => setFormData({ ...formData, detail_address: e.target.value })}
                                className="w-full px-4 py-3 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                                placeholder="街道、门牌号、小区、楼栋号等"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                邮政编码
                              </label>
                              <input
                                type="text"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                              />
                            </div>
                            <div>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.is_default}
                                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                  className="w-5 h-5"
                                />
                                <span className="text-sm text-text-primary">设为默认地址</span>
                              </label>
                            </div>
                            <div className="flex space-x-4">
                              <button
                                type="submit"
                                className="flex-1 h-14 bg-brand text-white font-semibold rounded-md hover:bg-brand-hover transition-colors flex items-center justify-center"
                              >
                                保存
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAddressForm(false)}
                                className="flex-1 h-14 border-2 border-background-divider text-text-primary font-semibold rounded-md hover:border-brand transition-colors flex items-center justify-center"
                              >
                                取消
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className="bg-white border border-background-divider rounded-lg p-6 relative"
                          >
                            {address.is_default && (
                              <span className="absolute top-4 right-4 px-3 py-1 bg-brand text-white text-xs rounded-full flex items-center space-x-1">
                                <Check className="w-3 h-3" />
                                <span>默认</span>
                              </span>
                            )}
                            <div className="mb-4">
                              <p className="font-semibold text-text-primary mb-2">
                                {address.recipient_name} {address.phone}
                              </p>
                              <p className="text-sm text-text-secondary">
                                {address.province} {address.city} {address.district}
                              </p>
                              <p className="text-sm text-text-secondary mt-1">
                                {address.detail_address}
                              </p>
                              {address.postal_code && (
                                <p className="text-sm text-text-tertiary mt-1">
                                  邮编: {address.postal_code}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditAddress(address)}
                                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-brand hover:bg-brand/5 rounded transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span>编辑</span>
                              </button>
                              {!address.is_default && (
                                <button
                                  onClick={() => handleSetDefault(address.id)}
                                  className="flex items-center space-x-1 px-3 py-1.5 text-sm text-text-primary hover:bg-background-surface rounded transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>设为默认</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-error hover:bg-error/5 rounded transition-colors ml-auto"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>删除</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* 我的收藏 */}
              {activeTab === 'favorites' && (
                <>
                  <h1 className="text-h2 font-semibold text-text-primary mb-6">我的收藏</h1>
                  <div className="bg-white border border-background-divider rounded-lg p-12 text-center">
                    <Heart className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                    <p className="text-text-secondary">收藏功能即将上线</p>
                  </div>
                </>
              )}

              {/* 账户设置 */}
              {activeTab === 'settings' && (
                <>
                  <h1 className="text-h2 font-semibold text-text-primary mb-6">账户设置</h1>
                  <div className="bg-white border border-background-divider rounded-lg p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-4">修改密码</h3>
                        {!showPasswordForm ? (
                          <button
                            onClick={() => setShowPasswordForm(true)}
                            className="flex items-center space-x-2 px-6 h-12 border-2 border-background-divider text-text-primary font-medium rounded-md hover:border-brand transition-colors"
                          >
                            <Key className="w-5 h-5" />
                            <span>修改密码</span>
                          </button>
                        ) : (
                          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                            <PasswordInput
                              label="当前密码 *"
                              value={passwordData.current_password}
                              onChange={(value) => setPasswordData({ ...passwordData, current_password: value })}
                              required
                              autoComplete="current-password"
                            />
                            <PasswordInput
                              label="新密码 * (至少6位)"
                              value={passwordData.new_password}
                              onChange={(value) => setPasswordData({ ...passwordData, new_password: value })}
                              required
                              minLength={6}
                              autoComplete="new-password"
                            />
                            <PasswordInput
                              label="确认新密码 *"
                              value={passwordData.confirm_password}
                              onChange={(value) => setPasswordData({ ...passwordData, confirm_password: value })}
                              required
                              autoComplete="new-password"
                            />
                            <div className="flex space-x-4">
                              <button
                                type="submit"
                                className="flex-1 h-14 bg-brand text-white font-semibold rounded-md hover:bg-brand-hover transition-colors"
                              >
                                确认修改
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowPasswordForm(false)
                                  setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
                                }}
                                className="flex-1 h-14 border-2 border-background-divider text-text-primary font-semibold rounded-md hover:border-brand transition-colors"
                              >
                                取消
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
