import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-background-surface border-t border-background-divider mt-auto">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 关于我们 */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">关于我们</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link to="#" className="hover:text-brand transition-colors">公司介绍</Link></li>
              <li><Link to="#" className="hover:text-brand transition-colors">加入我们</Link></li>
              <li><Link to="#" className="hover:text-brand transition-colors">联系我们</Link></li>
            </ul>
          </div>

          {/* 客户服务 */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">客户服务</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link to="#" className="hover:text-brand transition-colors">帮助中心</Link></li>
              <li><Link to="#" className="hover:text-brand transition-colors">售后服务</Link></li>
              <li><Link to="#" className="hover:text-brand transition-colors">配送说明</Link></li>
              <li><Link to="#" className="hover:text-brand transition-colors">退换货政策</Link></li>
            </ul>
          </div>

          {/* 购物指南 */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">购物指南</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link to="#" className="hover:text-brand transition-colors">如何下单</Link></li>
              <li><Link to="#" className="hover:text-brand transition-colors">支付方式</Link></li>
              <li><Link to="#" className="hover:text-brand transition-colors">发票说明</Link></li>
            </ul>
          </div>

          {/* 法律声明 */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">法律声明</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link to="#" className="hover:text-brand transition-colors">隐私政策</Link></li>
              <li><Link to="#" className="hover:text-brand transition-colors">用户协议</Link></li>
              <li><Link to="#" className="hover:text-brand transition-colors">知识产权</Link></li>
            </ul>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-12 pt-8 border-t border-background-divider text-center text-sm text-text-tertiary">
          <p>© 2025 简洁购物. 专注购物，拒绝广告.</p>
        </div>
      </div>
    </footer>
  )
}
