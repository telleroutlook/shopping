import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CreditCard, Smartphone, Wallet, Lock, AlertCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase, CartItem, Product, Address } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cartEvents } from '@/lib/events'

interface CartItemWithProduct extends CartItem {
  product: Product
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  
  // 信用卡表单
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    try {
      // 加载购物车
      const { data: cart } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)

      if (cart && cart.length > 0) {
        const productIds = cart.map(item => item.product_id)
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)

        const itemsWithProducts = cart.map(item => {
          const product = products?.find(p => p.id === item.product_id)
          if (!product) {
            throw new Error(`Product with ID ${item.product_id} not found`)
          }
          return {
            ...item,
            product
          }
        })
        setCartItems(itemsWithProducts)
      } else {
        setCartItems([])
      }

      // 加载地址
      const { data: addressesData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

      if (addressesData && addressesData.length > 0) {
        setAddresses(addressesData)
        setSelectedAddress(addressesData[0])
      } else {
        setAddresses([])
        setSelectedAddress(null)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadData()
  }, [user, loadData, navigate])

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      alert('请选择收货地址')
      return
    }
    setShowPaymentForm(true)
  }

  const simulatePayment = async (): Promise<boolean> => {
    // 模拟支付处理（2-3秒）
    const delay = 2000 + Math.random() * 1000
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // 90%成功率
    return Math.random() < 0.9
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedAddress || cartItems.length === 0) return

    setPaymentError('')
    setProcessing(true)

    try {
      // 创建订单
      const orderNumber = `ORD${Date.now()}`
      const shippingAddress = `${selectedAddress.province} ${selectedAddress.city} ${selectedAddress.district} ${selectedAddress.detail_address}`

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          total_amount: totalAmount,
          shipping_fee: 0,
          discount_amount: 0,
          final_amount: totalAmount,
          status: 'pending',
          payment_method: paymentMethod,
          recipient_name: selectedAddress.recipient_name,
          recipient_phone: selectedAddress.phone,
          shipping_address: shippingAddress
        })
        .select()
        .maybeSingle()

      if (orderError || !order) throw orderError

      // 创建订单明细
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.main_image,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity
      }))

      await supabase.from('order_items').insert(orderItems)

      // 模拟支付处理
      const paymentSuccess = await simulatePayment()

      if (paymentSuccess) {
        // 支付成功，更新订单状态
        await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', order.id)

        // 清空购物车
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)

        // 触发购物车更新
        cartEvents.emit('cart:updated')

        // 跳转到订单详情
        navigate(`/order/${order.id}?payment=success`)
      } else {
        // 支付失败
        setPaymentError('支付失败，请检查支付信息后重试')
        // 取消订单
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', order.id)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      setPaymentError('支付处理失败，请重试')
    } finally {
      setProcessing(false)
    }
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary mb-4">购物车是空的</p>
            <button onClick={() => navigate('/')} className="text-brand hover:underline">
              去购物
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (addresses.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary mb-4">请先添加收货地址</p>
            <button onClick={() => navigate('/account')} className="text-brand hover:underline">
              去添加地址
            </button>
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
          {!showPaymentForm ? (
            <>
              <h1 className="text-h1 font-bold text-text-primary mb-8">结算</h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* 收货地址 */}
                  <div className="bg-white border border-background-divider rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-text-primary">收货地址</h2>
                      <Link to="/account" className="text-sm text-brand hover:underline">
                        管理地址
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`p-4 border-2 rounded-md cursor-pointer transition-colors ${
                            selectedAddress?.id === addr.id
                              ? 'border-brand bg-brand/5'
                              : 'border-background-divider hover:border-brand/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-text-primary">
                                {addr.recipient_name} {addr.phone}
                              </p>
                              <p className="text-sm text-text-secondary mt-1">
                                {addr.province} {addr.city} {addr.district} {addr.detail_address}
                              </p>
                            </div>
                            {addr.is_default && (
                              <span className="text-xs px-2 py-1 bg-brand text-white rounded">
                                默认
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 支付方式选择 */}
                  <div className="bg-white border border-background-divider rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">支付方式</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'card', name: '信用卡/借记卡', icon: CreditCard },
                        { id: 'alipay', name: '支付宝', icon: Wallet },
                        { id: 'wechat', name: '微信支付', icon: Smartphone }
                      ].map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center p-4 border-2 rounded-md cursor-pointer transition-colors ${
                            paymentMethod === method.id
                              ? 'border-brand bg-brand/5'
                              : 'border-background-divider hover:border-brand/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-3"
                          />
                          <method.icon className="w-5 h-5 mr-2 text-text-secondary" />
                          <span>{method.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 订单摘要 */}
                <div className="lg:sticky lg:top-24 h-fit">
                  <div className="bg-background-surface rounded-lg p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-text-primary">订单摘要</h2>
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-text-secondary truncate mr-2">
                            {item.product.name} x{item.quantity}
                          </span>
                          <span className="text-text-primary flex-shrink-0">
                            ¥{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 py-4 border-y border-background-divider">
                      <div className="flex justify-between text-text-secondary">
                        <span>商品总额:</span>
                        <span>¥{totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-text-secondary">
                        <span>运费:</span>
                        <span className="text-success">免费</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>总计:</span>
                      <span className="text-error">¥{totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleProceedToPayment}
                      disabled={!selectedAddress}
                      className="w-full h-14 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover disabled:bg-background-divider disabled:text-text-tertiary transition-colors duration-fast"
                    >
                      继续支付
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="text-brand hover:underline text-sm"
                  >
                    ← 返回订单信息
                  </button>
                </div>

                <div className="bg-white border border-background-divider rounded-lg p-8">
                  <div className="flex items-center space-x-2 mb-6">
                    <Lock className="w-5 h-5 text-success" />
                    <h1 className="text-h2 font-bold text-text-primary">安全支付</h1>
                  </div>

                  <div className="mb-6 p-4 bg-background-surface rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">支付金额</span>
                      <span className="text-2xl font-bold text-error">¥{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-error">支付失败</p>
                        <p className="text-sm text-error mt-1">{paymentError}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handlePayment} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        卡号 *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                      />
                      <p className="text-xs text-text-tertiary mt-1">
                        测试卡号：4242 4242 4242 4242
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        持卡人姓名 *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="ZHANG SAN"
                        className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          有效期 *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                          placeholder="MM/YY"
                          className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={3}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="123"
                          className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none text-base"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-info/10 rounded-lg">
                      <p className="text-sm text-info">
                        这是一个模拟支付界面。支付将会被模拟处理（90%成功率）。
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full h-14 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover disabled:bg-background-divider disabled:text-text-tertiary transition-colors duration-fast flex items-center justify-center space-x-2"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>处理中...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>确认支付 ¥{totalAmount.toFixed(2)}</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center space-x-4 text-xs text-text-tertiary">
                      <div className="flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>SSL加密</span>
                      </div>
                      <span>•</span>
                      <span>PCI DSS认证</span>
                      <span>•</span>
                      <span>安全支付保障</span>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
