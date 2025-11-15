import { Link } from 'react-router-dom'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function OrderFailedPage() {
  const handleRetry = () => {
    // 重试逻辑，可以返回购物车或重新尝试支付
    window.history.back()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-2xl px-4">
          <div className="bg-white border border-background-divider rounded-lg p-8 text-center">
            {/* 错误图标 */}
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-error" />
            </div>

            <h1 className="text-2xl font-bold text-text-primary mb-4">
              订单提交失败
            </h1>

            <p className="text-text-secondary mb-8">
              抱歉，订单提交过程中出现了问题。请检查您的信息并重试。
            </p>

            {/* 常见错误原因 */}
            <div className="bg-background-surface rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                可能的原因
              </h3>
              <ul className="text-sm text-text-secondary space-y-3">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full mt-2 flex-shrink-0"></div>
                  <span>支付信息错误或支付渠道暂时不可用</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full mt-2 flex-shrink-0"></div>
                  <span>网络连接不稳定或超时</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full mt-2 flex-shrink-0"></div>
                  <span>库存不足或其他商品问题</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full mt-2 flex-shrink-0"></div>
                  <span>系统维护或临时故障</span>
                </li>
              </ul>
            </div>

            {/* 操作建议 */}
            <div className="space-y-4 mb-8">
              <p className="text-sm text-text-secondary">
                您可以尝试以下操作：
              </p>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• 检查网络连接是否稳定</li>
                <li>• 验证支付信息的准确性</li>
                <li>• 稍后重试或更换支付方式</li>
                <li>• 联系客服寻求帮助</li>
              </ul>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-4">
              <button
                onClick={handleRetry}
                className="w-full h-14 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors duration-fast flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>重新尝试</span>
              </button>

              <Link
                to="/cart"
                className="block w-full h-14 border-2 border-cta-secondary-border text-text-primary font-semibold rounded-md hover:border-brand hover:text-brand transition-colors duration-fast flex items-center justify-center"
              >
                返回购物车
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
                <Link to="/contact" className="text-brand hover:underline">
                  联系客服
                </Link>
              </div>
            </div>
          </div>

          {/* 客服信息 */}
          <div className="mt-8 bg-error/5 border border-error/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              需要帮助？
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              如果问题持续存在，请联系我们的客服团队：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-text-secondary">客服热线：</span>
                <span className="text-text-primary font-medium">400-123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-text-secondary">工作时间：</span>
                <span className="text-text-primary">9:00-22:00</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}