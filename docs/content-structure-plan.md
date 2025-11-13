# 内容结构规划 - 简洁电商购物网站

结合 `docs/jd_analysis.md` 的京东拆解结果与当前 `jd-shop/src` 代码，以下为最新版的信息架构与内容规划。目标是维持无广告、聚焦转化的体验，同时让文档与 React Router SPA 实现保持一致。

## 1. 设计依据与目标
- **信息来源**：京东深度分析、UI 设计规范（`docs/design-specification.md`）、权限系统设计（`docs/role-permission-system-design.md`）。
- **体验原则**：
  1. 去广告化：移除浮层、弹窗、运营活动噪音。
  2. 快速决策：突出搜索、分类、筛选，提升商品展示密度。
  3. 单页流程：从浏览→加购→结算→售后保持最少跳转。
  4. 语义 UI：继续使用 `text-text-primary` / `bg-background-*` 这类 token，方便主题统一调整。

## 2. 应用架构（SPA + React Router 6）
应用由 `src/App.tsx` 统一注册路由，表内同时列出核心内容模块与对应组件。

| 路径 | 组件 | 内容重心 |
| --- | --- | --- |
| `/` | `pages/HomePage.tsx` | Hero 主推、分类快捷入口、热门/新品商品网格。 |
| `/category/:id` | `pages/CategoryPage.tsx` | 分类面包屑 + 筛选 + 商品卡片 + 分页。 |
| `/search` | `pages/SearchPage.tsx` | 搜索结果与排序、空状态提示。 |
| `/product/:id` | `pages/ProductPage.tsx` | 图文详情、价格/库存、评价摘要、推荐区。 |
| `/cart` | `pages/CartPage.tsx` | 购物车列表、优惠占位、价格汇总、CTA。 |
| `/checkout` | `pages/CheckoutPage.tsx` | 地址选择、配送/支付方式、订单汇总、模拟支付。 |
| `/account` | `pages/AccountPage.tsx` | 订单列表、地址管理、密码修改入口。 |
| `/order/:id` | `pages/OrderDetailPage.tsx` | 订单时间线、物流信息、价格明细、售后操作。 |
| `/login` | `pages/LoginPage.tsx` | 登录/注册切换、密码可见切换。 |
| `/admin/products` | `pages/AdminProductsPage.tsx` | 商品 CRUD、库存调整、Zod 表单验证。 |
| `/super-admin/users` | `pages/SuperAdminUsersPage.tsx` | 用户列表、角色变更、角色历史、权限重载。 |

## 3. 内容模块与要点
### 3.1 用户购物主线
1. **发现**：主页 Hero + 分类导航 + 搜索条。首页在桌面端提供 4×2 分类卡片和 8+8 商品网格；移动端降为 2 列。
2. **筛选**：分类/搜索页沿用左侧筛选 + 顶部排序结构（在移动端折叠为抽屉）。
3. **决策**：商品详情强调图片（跟随 `design-specification` 中“图片占 50-60% 视口”）与 Sticky Buy Box；价格、库存、评分、促销标签都直接来自 `products` 表字段。
4. **加购/结算**：`CartPage` 采用双列布局（大屏）或单列（小屏），数量调整即时刷新价格；`CheckoutPage` 将地址/支付/摘要放在同页完成。
5. **支付反馈**：支付成功/失败通过 `sonner` 或内置状态提示，`OrderDetailPage` 提供重试加载逻辑（详见 `pages/OrderDetailPage.tsx`）。

### 3.2 账户与售后
- **Account**：左右分栏布局；左栏为导航（订单、地址、密码），右栏为对应卡片或表单。地址列表允许设默认、编辑、删除。
- **订单**：`OrderDetailPage` 使用时间线展示状态（pending → paid → shipped → completed）。空状态、错误状态均由组件级提示处理。
- **密码修改**：`user-password` Edge Function 提供 API；客户端在 `AccountPage` 中以三输入框 + 显示/隐藏控件形式呈现。

### 3.3 权限扩展
- **管理员**：
  - 列表展示全部商品，支持搜索与分页。
  - 表单字段与 `Product` 类型吻合，提交前使用 `productSchema` 校验。
  - 操作依赖 `admin-products` Edge Function，所有请求都在 `src/lib/api.ts` 中统一带上 `Authorization/apikey`。
- **超级管理员**：
  - 用户卡片显示邮箱、角色 badge、创建时间、最近操作。
  - 操作按钮（设为管理员、解除管理员、查看历史）按角色条件渲染。
  - 支持“重新检查权限”按钮，通过 `refreshUserRole()` 解决 Supabase Edge Function 503 备选路径。

## 4. 响应式与内容密度
| 场景 | 策略 |
| --- | --- |
| 桌面 ≥1024px | 首页/分类保持 4 列网格；购物车、结算使用左右双列；管理员/超级管理员页面以表格 + 卡片混合布局呈现。 |
| 平板 768-1023px | 商品列表降为 3 列；筛选抽屉改为顶部弹出；表单两列控件自动堆叠。 |
| 移动 <768px | 单列流式布局，CTA 采用全宽按钮，筛选/排序折叠为 Bottom Sheet。 |

**信息密度**：商品列表卡片提供图片、标题、评分、价格/原价与库存提示；详情页保持 tab 化内容，防止滚动过长。其余页面遵循“第一屏展示核心操作”的要求。

## 5. 内容依赖
- **数据表**：`products`、`categories`、`cart_items`、`orders`、`order_items`、`addresses`、`profiles`、`roles`、`user_role_history`。
- **Edge Functions**：`admin-products`、`super-admin-users`、`user-password`、`user-role`（详见 `supabase/functions/`）。
- **事件系统**：`src/lib/events.ts` 提供购物车更新事件，导航徽章与购物车页面共享状态。

## 6. 更新指引
- 新增页面或内容区块时，请同步更新本表格及 `README.md` 的“应用结构概览”。
- 若改动数据 schema（如新增商品属性），需同时更新：`src/lib/supabase.ts` 类型、相关页面展示、`docs/design-specification.md` 对应组件说明。
- 任何与权限相关的内容（角色、路由守卫、Edge Function）都要同步 `docs/role-permission-implementation-progress.md`。

该规划文档现已与 React 代码里的路由与组件命名保持一致，可直接作为后续 IA/内容讨论的基准。EOF
