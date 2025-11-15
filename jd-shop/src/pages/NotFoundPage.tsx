import { Link } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="text-center px-4">
          <div className="mb-8">
            <h1 className="text-h1 font-bold text-text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              页面不存在
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              抱歉，您访问的页面不存在或已被移动。请检查URL是否正确，或返回首页继续浏览。
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center h-14 px-8 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover transition-colors duration-fast"
            >
              返回首页
            </Link>
            
            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link to="/search" className="text-brand hover:underline">
                搜索商品
              </Link>
              <span className="text-text-tertiary">|</span>
              <Link to="/cart" className="text-brand hover:underline">
                查看购物车
              </Link>
              <span className="text-text-tertiary">|</span>
              <Link to="/login" className="text-brand hover:underline">
                用户登录
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}