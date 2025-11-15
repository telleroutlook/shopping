import { Link } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-h1 font-bold text-text-primary">用户协议</h1>
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
                  1. 协议接受
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    欢迎使用JD Shop平台服务（以下简称"本服务"）。本用户协议（以下简称"本协议"）是您与JD Shop之间关于使用本服务的法律协议。
                  </p>
                  <p>
                    通过访问或使用本服务，您即表示同意受本协议条款的约束。如果您不同意这些条款，请不要使用本服务。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  2. 服务描述
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    JD Shop提供以下服务：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>在线商品销售</li>
                    <li>商品搜索和浏览</li>
                    <li>订单处理和支付</li>
                    <li>客户服务支持</li>
                    <li>用户账户管理</li>
                    <li>商品评价系统</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  3. 用户义务
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    作为用户，您同意：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>提供准确、完整和最新的注册信息</li>
                    <li>保护您的账户安全，不与他人共享</li>
                    <li>不得从事任何违法或欺诈行为</li>
                    <li>尊重知识产权，不上传侵权内容</li>
                    <li>遵守所有适用的法律法规</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  4. 订单和支付
                </h2>
                <div className="text-text-secondary space-y-4">
                  <ul className="list-disc list-inside space-y-2">
                    <li>所有订单都需经过我们的确认</li>
                    <li>价格信息如有变更，以订单确认时为准</li>
                    <li>支付完成后订单即生效</li>
                    <li>我们保留拒绝或取消订单的权利</li>
                    <li>如遇缺货或价格错误，我们会及时通知并协商处理</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  5. 退换货政策
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    我们支持7天无理由退换货，但以下商品除外：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>定制商品</li>
                    <li>鲜活易腐商品</li>
                    <li>拆封后影响人身安全或卫生的商品</li>
                    <li>已超过7天的商品</li>
                  </ul>
                  <p>
                    退换货的商品需保持原包装完整，不影响二次销售。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  6. 知识产权
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    本平台的所有内容，包括但不限于商品图片、文字描述、商标、logo等，均受知识产权保护。
                    未经书面许可，用户不得复制、分发或使用这些内容。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  7. 免责声明
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    在法律允许的最大范围内，我们不承担以下责任：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>因不可抗力导致的服务中断</li>
                    <li>因用户操作失误造成的损失</li>
                    <li>第三方服务商的违约行为</li>
                    <li>网络故障或系统维护造成的临时无法访问</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  8. 协议变更
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    我们保留随时修改本协议的权利。重大变更会提前30天通过网站公告或邮件通知用户。
                    继续使用服务即表示您接受修改后的协议。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  9. 争议解决
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    本协议的履行和解释适用中华人民共和国法律。如发生争议，双方应首先通过友好协商解决；
                    协商不成的，任何一方均可向有管辖权的人民法院提起诉讼。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  10. 联系我们
                </h2>
                <div className="text-text-secondary space-y-4">
                  <p>
                    如果您对本协议有任何疑问，请联系我们：
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>邮箱：legal@jd-shop.com</li>
                    <li>电话：400-123-4567</li>
                    <li>地址：北京市朝阳区建国路88号</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <Link to="/privacy" className="text-brand hover:underline">
                隐私政策
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