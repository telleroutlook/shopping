import { Link } from 'react-router-dom'
import { Store, Heart, Users, Shield } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                关于 JD Shop
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                我们致力于为用户提供优质的购物体验，连接消费者与优质商品，
                让购物变得更加简单、便捷和愉快。
              </p>
            </div>
          </div>
        </section>

        {/* Company Story */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-h2 font-semibold text-text-primary mb-4">
                  我们的故事
                </h2>
                <p className="text-text-secondary max-w-2xl mx-auto">
                  从一个小小的想法开始，我们始终相信优质的产品应该触手可及
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-text-primary leading-relaxed">
                    JD Shop 成立于2020年，怀着"让每个人都能享受优质购物"的使命，
                    我们从零开始构建一个值得信赖的电商平台。
                  </p>
                  <p className="text-text-primary leading-relaxed">
                    我们深知信任是电商的基础，因此我们严格把控商品质量，
                    提供完善的售后服务，确保每一位用户都能获得满意的购物体验。
                  </p>
                  <p className="text-text-primary leading-relaxed">
                    今天，JD Shop 已经成为众多消费者信赖的购物平台，
                    我们将继续努力，为用户提供更多优质的商品和服务。
                  </p>
                </div>
                
                <div className="bg-background-surface rounded-lg p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brand mb-2">100万+</div>
                      <div className="text-text-secondary">注册用户</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brand mb-2">50万+</div>
                      <div className="text-text-secondary">商品SKU</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brand mb-2">99.8%</div>
                      <div className="text-text-secondary">好评率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brand mb-2">24H</div>
                      <div className="text-text-secondary">客服响应</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-background-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-h2 font-semibold text-text-primary mb-4">
                我们的核心价值
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                这些价值观指导着我们的每一个决策和行动
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  诚信为本
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  我们坚持诚信经营，透明定价，提供真实的产品信息，
                  绝不欺骗或误导消费者。
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  用户至上
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  用户的需求和体验是我们最大的关注点，
                  我们不断优化服务，为用户创造价值。
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  团队合作
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  我们相信团队的力量，通过协作和创新，
                  共同为用户提供更好的产品和服务。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-h2 font-semibold text-text-primary mb-12">
                使命与愿景
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white border border-background-divider rounded-lg p-8">
                  <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center mx-auto mb-6">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    我们的使命
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    打造中国领先的电商平台，为消费者提供优质的商品和服务，
                    让购物成为生活的美好体验。
                  </p>
                </div>

                <div className="bg-white border border-background-divider rounded-lg p-8">
                  <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    我们的愿景
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    成为用户最信赖的购物伙伴，通过技术创新和服务优化，
                    构建可持续发展的商业生态系统。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20 bg-background-surface">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-h2 font-semibold text-text-primary mb-12">
                联系我们
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    客服热线
                  </h3>
                  <p className="text-text-secondary">
                    400-123-4567<br />
                    9:00-22:00 全天候服务
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    商务合作
                  </h3>
                  <p className="text-text-secondary">
                    business@jd-shop.com<br />
                    期待与您携手合作
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    公司地址
                  </h3>
                  <p className="text-text-secondary">
                    北京市朝阳区建国路88号<br />
                    SOHO现代城A座22层
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* 返回顶部快捷链接 */}
      <div className="mt-16 text-center">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <Link to="/privacy" className="text-brand hover:underline">
            隐私政策
          </Link>
          <span className="text-text-tertiary">|</span>
          <Link to="/terms" className="text-brand hover:underline">
            用户协议
          </Link>
          <span className="text-text-tertiary">|</span>
          <Link to="/" className="text-brand hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}