import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, Package, Truck, CheckCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase, Order } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/usePermission'

export default function AdminOrdersPage() {
  const { user } = useAuth()
  const { isAdminOrHigher } = useRole()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const loadOrders = useCallback(async () => {
    if (!user || !isAdminOrHigher()) {
      navigate('/')
      return
    }

    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      // 使用模拟数据
      const mockOrders: Order[] = [
        {
          id: 1,
          user_id: 'user1',
          total_amount: 2899.00,
          status: 'paid',
          shipping_address: '北京市朝阳区建国路88号',
          created_at: '2025-11-15T10:30:00Z',
          updated_at: '2025-11-15T10:30:00Z'
        },
        {
          id: 2,
          user_id: 'user2',
          total_amount: 1599.00,
          status: 'shipped',
          shipping_address: '上海市浦东新区陆家嘴环路1000号',
          created_at: '2025-11-14T15:20:00Z',
          updated_at: '2025-11-14T16:45:00Z'
        },
        {
          id: 3,
          user_id: 'user3',
          total_amount: 899.00,
          status: 'delivered',
          shipping_address: '广州市天河区珠江新城华夏路10号',
          created_at: '2025-11-13T09:15:00Z',
          updated_at: '2025-11-15T11:20:00Z'
        }
      ]
      setOrders(mockOrders)
    } finally {
      setLoading(false)
    }
  }, [user, isAdminOrHigher, navigate, filterStatus])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
          : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('更新订单状态失败')
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': '待处理',
      'paid': '已支付',
      'shipped': '已发货',
      'delivered': '已送达',
      'cancelled': '已取消',
      'refunded': '已退款'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'pending': 'bg-warning/10 text-warning',
      'paid': 'bg-info/10 text-info',
      'shipped': 'bg-info/10 text-info',
      'delivered': 'bg-success/10 text-success',
      'cancelled': 'bg-error/10 text-error',
      'refunded': 'bg-error/10 text-error'
    }
    return colorMap[status] || 'bg-text-tertiary/10 text-text-tertiary'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="w-4 h-4" />
      case 'paid':
        return <CheckCircle className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  if (!user || !isAdminOrHigher()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">您没有权限访问此页面</p>
      </div>
    )
  }

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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-h1 font-bold text-text-primary">订单管理</h1>
            <Link to="/admin/products" className="text-brand hover:underline">
              商品管理
            </Link>
          </div>

          {/* 筛选器 */}
          <div className="bg-white border border-background-divider rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-text-secondary">订单状态：</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-background-divider rounded-md focus:border-brand focus:outline-none"
              >
                <option value="all">全部</option>
                <option value="pending">待处理</option>
                <option value="paid">已支付</option>
                <option value="shipped">已发货</option>
                <option value="delivered">已送达</option>
                <option value="cancelled">已取消</option>
                <option value="refunded">已退款</option>
              </select>
            </div>
          </div>

          {/* 订单列表 */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-background-divider rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-text-secondary">
                      订单号: {order.id}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusText(order.status)}</span>
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {new Date(order.created_at).toLocaleDateString('zh-CN')} {new Date(order.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-2">
                    <p className="text-text-primary font-medium mb-1">
                      总金额: ¥{order.total_amount.toFixed(2)}
                    </p>
                    {order.shipping_address && (
                      <p className="text-sm text-text-secondary">
                        收货地址: {order.shipping_address}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'paid')}
                        className="px-3 py-1 bg-info text-white text-sm rounded-md hover:bg-info/80 transition-colors"
                      >
                        标记已支付
                      </button>
                    )}
                    {order.status === 'paid' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="px-3 py-1 bg-info text-white text-sm rounded-md hover:bg-info/80 transition-colors"
                      >
                        标记已发货
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="px-3 py-1 bg-success text-white text-sm rounded-md hover:bg-success/80 transition-colors"
                      >
                        标记已送达
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    <Link
                      to={`/order/${order.id}`}
                      className="inline-flex items-center space-x-2 px-4 py-2 border border-cta-secondary-border text-text-primary font-medium rounded-md hover:border-brand hover:text-brand transition-colors duration-fast"
                    >
                      <Eye className="w-4 h-4" />
                      <span>查看详情</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">暂无符合条件的订单</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}