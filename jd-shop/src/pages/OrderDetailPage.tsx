import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Package, MapPin, CreditCard, CheckCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase, Order, OrderItem } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const loadOrder = useCallback(async () => {
    if (!user) return

    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!orderData) {
        navigate('/account')
        return
      }

      // 如果URL标记支付成功但订单状态还是pending，等待后重新加载
      const paymentStatus = searchParams.get('payment')
      if (paymentStatus === 'success' && orderData.status === 'pending') {
        // 等待500ms后重新加载，最多重试3次
        const maxRetries = 3
        let retries = 0
        
        const reloadOrder = async (): Promise<void> => {
          await new Promise(resolve => setTimeout(resolve, 500))
          const { data: refreshedOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .maybeSingle()
          
          if (refreshedOrder && refreshedOrder.status !== 'pending') {
            setOrder(refreshedOrder)
          } else if (retries < maxRetries) {
            retries++
            await reloadOrder()
          } else {
            // 重试失败，使用当前数据
            setOrder(orderData)
          }
        }
        
        await reloadOrder()
      } else {
        setOrder(orderData)
      }

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id)

      if (itemsData) setOrderItems(itemsData)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }, [user, id, searchParams, navigate])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (id) {
      // 检查是否是支付成功后跳转
      const paymentStatus = searchParams.get('payment')
      if (paymentStatus === 'success') {
        setShowSuccessMessage(true)
        // 5秒后隐藏成功消息
        setTimeout(() => setShowSuccessMessage(false), 5000)
      }
      loadOrder()
    }
  }, [id, user, searchParams, loadOrder, navigate])

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

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary mb-4">订单不存在</p>
            <Link to="/account" className="text-brand hover:underline">返回订单列表</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto">
          <div className="mb-6 text-sm text-text-secondary">
            <Link to="/" className="hover:text-brand">首页</Link>
            <span className="mx-2">/</span>
            <Link to="/account" className="hover:text-brand">我的订单</Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">订单详情</span>
          </div>

          {/* 订单状态 */}
          <div className="bg-white border border-background-divider rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-h2 font-semibold text-text-primary mb-2">
                  订单号: {order.order_number}
                </h1>
                <p className="text-text-secondary">
                  下单时间: {new Date(order.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary mb-2">订单状态</p>
                <p className="text-2xl font-bold text-brand">
                  {getStatusText(order.status)}
                </p>
              </div>
            </div>
          </div>

          {/* 支付成功提示 */}
          {showSuccessMessage && (
            <div className="bg-success/10 border border-success rounded-lg p-6 mb-6 animate-fade-in">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                <div>
                  <p className="font-semibold text-success text-lg">支付成功！</p>
                  <p className="text-sm text-text-secondary mt-1">
                    您的订单已成功支付，我们会尽快为您发货
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：订单信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 商品列表 */}
              <div className="bg-white border border-background-divider rounded-lg p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  商品信息
                </h2>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-background-divider last:border-0 last:pb-0">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-text-primary mb-2">
                          {item.product_name}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-text-secondary">
                            ¥{item.unit_price.toFixed(2)} x {item.quantity}
                          </p>
                          <p className="font-semibold text-text-primary">
                            ¥{item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 收货信息 */}
              <div className="bg-white border border-background-divider rounded-lg p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  收货信息
                </h2>
                <div className="space-y-2">
                  <p className="text-text-primary">
                    <span className="text-text-secondary">收货人：</span>
                    {order.recipient_name}
                  </p>
                  <p className="text-text-primary">
                    <span className="text-text-secondary">联系电话：</span>
                    {order.recipient_phone}
                  </p>
                  <p className="text-text-primary">
                    <span className="text-text-secondary">收货地址：</span>
                    {order.shipping_address}
                  </p>
                </div>
              </div>

              {/* 支付信息 */}
              <div className="bg-white border border-background-divider rounded-lg p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  支付信息
                </h2>
                <p className="text-text-primary">
                  <span className="text-text-secondary">支付方式：</span>
                  {order.payment_method === 'alipay' ? '支付宝' :
                   order.payment_method === 'wechat' ? '微信支付' :
                   order.payment_method === 'card' ? '银行卡' : order.payment_method}
                </p>
              </div>
            </div>

            {/* 右侧：价格明细 */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-background-surface rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold text-text-primary">价格明细</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>商品总额:</span>
                    <span>¥{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>运费:</span>
                    <span className={order.shipping_fee === 0 ? 'text-success' : ''}>
                      {order.shipping_fee === 0 ? '免费' : `¥${order.shipping_fee.toFixed(2)}`}
                    </span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>优惠:</span>
                      <span>-¥{order.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-background-divider">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>实付金额:</span>
                    <span className="text-error">¥{order.final_amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2 pt-4">
                  {order.status === 'pending' && (
                    <button className="w-full h-12 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors">
                      去支付
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button className="w-full h-12 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors">
                      确认收货
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <button className="w-full h-12 border-2 border-cta-secondary-border text-text-primary font-semibold rounded-md hover:border-brand hover:text-brand transition-colors">
                      申请售后
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
