import { Link } from 'react-router-dom'
import { Check, Package, Home } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function OrderSuccessPage() {
  // 模拟订单数据
  const orderNumber = 'JD' + Date.now().toString().slice(-8)
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-2xl px-4">
          <div className="bg-white border border-background-divider rounded-lg p-8 text-center">
            {/* 成功图标 */}
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-text-primary mb-4">
              订单提交成功！
            </h1>

            <p className="text-text-secondary mb-8">
              感谢您的购买，我们将尽快处理您的订单
            </p>

            {/* 订单信息卡片 */}
            <div className="bg-background-surface rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-secondary">订单号</span>
                <span className="font-mono font-semibold text-text-primary">
                  {orderNumber}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-secondary">预计送达</span>
                <span className="text-text-primary">
                  {estimatedDelivery}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-secondary">订单状态</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-warning/10 text-warning">
                  <Package className="w-4 h-4 mr-1" />
                  待处理
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-4">
              <Link
                to="/orders"
                className="block w-full h-14 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors duration-fast flex items-center justify-center"
              >
                查看我的订单
              </Link>

              <div className="flex items-center justify-center space-x-4 text-sm">
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 text-brand hover:underline"
                >
                  <Home className="w-4 h-4" />
                  <span>返回首页</span>
                </Link>
                <span className="text-text-tertiary">|</span>
                <Link to="/cart" className="text-brand hover:underline">
                  继续购物
                </Link>
              </div>
            </div>
          </div>

          {/* 温馨提示 */}
          <div className="mt-8 bg-info/5 border border-info/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              温馨提示
            </h3>
            <ul className="text-sm text-text-secondary space-y-2 text-left">
              <li>• 我们已收到您的订单，正在处理中</li>
              <li>• 您会收到订单确认邮件和短信通知</li>
              <li>• 如有疑问，请联系客服：400-123-4567</li>
              <li>• 支持7天无理由退换货服务</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}