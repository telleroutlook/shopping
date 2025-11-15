import { Link } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-h1 font-bold text-text-primary">隐私政策</h1>
            <Link to="/" className="text-brand hover:underline">
              返回首页
            </Link>
          </div>

          <div className="bg-white border border-background-divider rounded-lg p-8">
            <div className="prose prose-slate max-w-none">
              <p className="text-text-secondary mb-8">
                最后更新日期：2025年11月15日
              </p>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  1. 信息收集
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    我们可能会收集以下类型的信息：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>个人身份信息（如姓名、邮箱地址、电话号码）</li>
                    <li>支付信息（如信用卡信息、账单地址）</li>
                    <li>浏览和购买历史</li>
                    <li>设备信息和IP地址</li>
                    <li>Cookies和类似技术信息</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  2. 信息使用
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    我们使用收集的信息用于：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>处理和履行您的订单</li>
                    <li>提供客户服务</li>
                    <li>发送订单更新和重要通知</li>
                    <li>改善我们的服务和网站体验</li>
                    <li>防止欺诈和确保安全</li>
                    <li>法律合规要求</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  3. 信息共享
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    我们不会出售、出租或以其他方式向第三方披露您的个人信息，除非：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>获得您的明确同意</li>
                    <li>需要履行订单或提供服务</li>
                    <li>需要遵守法律要求</li>
                    <li>保护我们的权利和用户安全</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  4. 数据安全
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    我们采取合理的技术和组织措施来保护您的个人信息，包括：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>SSL加密传输</li>
                    <li>安全的服务器存储</li>
                    <li>访问控制和权限管理</li>
                    <li>定期安全审计</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  5. 您的权利
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    根据适用法律，您可能拥有以下权利：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>访问您的个人信息</li>
                    <li>更正不准确的信息</li>
                    <li>删除您的个人信息</li>
                    <li>限制或反对处理</li>
                    <li>数据可携带性</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  6. Cookie使用
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    我们使用Cookies来：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>记住您的偏好设置</li>
                    <li>分析网站流量</li>
                    <li>改善用户体验</li>
                    <li>提供个性化内容</li>
                  </ul>
                  <p>
                    您可以通过浏览器设置管理或禁用Cookies，但这可能影响网站功能。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  7. 联系我们
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    如果您对本隐私政策有任何疑问或需要联系我们，请通过以下方式：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>邮箱：privacy@jd-shop.com</li>
                    <li>电话：400-123-4567</li>
                    <li>地址：北京市朝阳区建国路88号</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  8. 政策更新
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    我们可能会不时更新本隐私政策。任何重大变更我们都会提前通知您。
                    继续使用我们的服务即表示您同意更新后的政策。
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <Link to="/terms" className="text-brand hover:underline">
                用户协议
              </Link>
              <span className="text-text-tertiary">|</span>
              <Link to="/about" className="text-brand hover:underline">
                关于我们
              </Link>
              <span className="text-text-tertiary">|</span>
              <Link to="/" className="text-brand hover:underline">
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}