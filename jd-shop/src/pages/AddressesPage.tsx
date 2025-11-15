import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'
import PageShell from '@/components/PageShell'

interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: boolean
}

const mockAddresses: Address[] = [
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '建国路88号SOHO现代城A座2201室',
    is_default: true
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '陆家嘴环路1000号恒生银行大厦10楼',
    is_default: false
  }
]

export default function AddressesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除这个地址吗？')) {
      setAddresses(addresses.filter(addr => addr.id !== id))
    }
  }

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      is_default: addr.id === id
    })))
  }

  const formatAddress = (address: Address) => {
    return `${address.province}${address.city}${address.district}${address.detail}`
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <PageShell>
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-h1 font-bold text-text-primary">地址管理</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 h-12 px-6 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors duration-fast"
          >
            <Plus className="w-5 h-5" />
            <span>添加地址</span>
          </button>
        </div>

          {addresses.length === 0 ? (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary mb-4">您还没有添加任何地址</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center justify-center h-12 px-6 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors duration-fast"
              >
                添加第一个地址
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`bg-white border rounded-lg p-6 ${
                    address.is_default 
                      ? 'border-brand bg-brand/5' 
                      : 'border-background-divider'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {address.name}
                      </h3>
                      <span className="text-sm text-text-secondary">
                        {address.phone}
                      </span>
                      {address.is_default && (
                        <span className="px-2 py-1 text-xs bg-brand text-white rounded-full">
                          默认
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingAddress(address)}
                        className="p-2 text-text-tertiary hover:text-brand transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-text-tertiary hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-text-secondary mb-4">
                    {formatAddress(address)}
                  </p>

                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-sm text-brand hover:underline"
                    >
                      设为默认地址
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 添加/编辑地址表单 */}
          {(showAddForm || editingAddress) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  {editingAddress ? '编辑地址' : '添加地址'}
                </h2>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        收件人
                      </label>
                      <input
                        type="text"
                        className="w-full h-12 px-3 border border-background-divider rounded-md focus:border-brand focus:outline-none"
                        defaultValue={editingAddress?.name}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        联系电话
                      </label>
                      <input
                        type="tel"
                        className="w-full h-12 px-3 border border-background-divider rounded-md focus:border-brand focus:outline-none"
                        defaultValue={editingAddress?.phone}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      详细地址
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-background-divider rounded-md focus:border-brand focus:outline-none resize-none"
                      defaultValue={editingAddress?.detail}
                      placeholder="请输入详细地址"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingAddress(null)
                      }}
                      className="px-4 py-2 border border-background-divider text-text-secondary rounded-md hover:border-brand hover:text-brand transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-cta-primary text-white rounded-md hover:bg-cta-primary-hover transition-colors"
                    >
                      {editingAddress ? '保存' : '添加'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
    </PageShell>
  )
}
