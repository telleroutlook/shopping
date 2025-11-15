import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Eye } from 'lucide-react'
import PageShell from '@/components/PageShell'
import { supabase, Order } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }, [user, navigate])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

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
      'pending': 'text-warning',
      'paid': 'text-info',
      'shipped': 'text-info',
      'delivered': 'text-success',
      'cancelled': 'text-error',
      'refunded': 'text-error'
    }
    return colorMap[status] || 'text-text-secondary'
  }

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
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-h1 font-bold text-text-primary">我的订单</h1>
            <Link to="/account" className="text-brand hover:underline">
              返回账户
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary mb-4">您还没有任何订单</p>
              <Link
                to="/"
                className="inline-flex items-center justify-center h-12 px-6 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors duration-fast"
              >
                立即购物
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
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
                      <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-text-secondary">
                      {new Date(order.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2">
                      <p className="text-text-primary font-medium mb-2">
                        总金额: ¥{order.total_amount.toFixed(2)}
                      </p>
                      {order.shipping_address && (
                        <p className="text-sm text-text-secondary">
                          收货地址: {order.shipping_address}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-end space-x-3">
                      <Link
                        to={`/order/${order.id}`}
                        className="inline-flex items-center space-x-2 h-10 px-4 border border-cta-secondary-border text-text-primary font-medium rounded-md hover:border-brand hover:text-brand transition-colors duration-fast"
                      >
                        <Eye className="w-4 h-4" />
                        <span>查看详情</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </PageShell>
  )
}
