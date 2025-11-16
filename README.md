# JD Shop · React + Supabase 电商示例

一个使用 React 18、TypeScript、Tailwind CSS 与 Supabase 构建的无广告电商演示项目。核心代码位于 `jd-shop/`，其余目录提供设计资料、Supabase Edge Function 源码以及黑盒测试脚本。

## 仓库布局
- `jd-shop/` – Vite + React 应用，包含 UI 组件、页面、hooks、上下文、Supabase 客户端与 Edge Function 调用封装。
- `docs/` – 设计规范、内容规划、权限系统等高阶文档。
- `supabase/` – 生产环境使用的 Edge Functions、SQL 迁移与策略（配合 Supabase CLI 部署）。
- `tests/` – 黑盒回归脚本与报告目录（脚本输出会写入 `tests/reports/`）。
- `环境变量配置指南.md` – 更详细的环境变量说明。

> 项目默认遵循 `AGENTS.md` 中的结构约定：UI 放在 `src/components`，页面位于 `src/pages`，跨页面状态在 `src/contexts`，可复用领域逻辑写入 `src/hooks`，而 Supabase/Stripe glue 代码集中在 `src/lib`。

## 技术栈
| 范畴 | 使用内容 |
| --- | --- |
| 前端 | React 18.3 · TypeScript 5.6 · React Router 6 · Tailwind CSS 3.4 · Radix UI · Lucide Icons |
| 构建 | Vite 6 · pnpm 9 · TypeScript 项目引用 (`tsc -b`) |
| 数据 | Supabase (PostgreSQL + Auth + Storage + Edge Functions + RLS) |
| 其他 | react-hook-form + zod 校验、sonner 通知、Embla Carousel、Shadcn 风格 UI 原子组件 |

## 快速开始
1. **安装依赖**
   ```bash
   cd jd-shop
   pnpm install-deps        # 等价于 pnpm install --prefer-offline
   ```
2. **配置环境变量**
   - 复制根目录的 `.env.example` 到 `jd-shop/.env`
     ```bash
     cp ../.env.example .env   # 在 jd-shop/ 目录下执行
     ```
   - 填写至少以下变量（详见《环境变量配置指南》）：
     ```env
     VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
     VITE_SUPABASE_ANON_KEY=<public-anon-key>
     # Edge Function 在服务器侧仍需 SUPABASE_SERVICE_ROLE_KEY，可在部署时注入
     ```
3. **启动开发服务器**
   ```bash
   pnpm dev
   ```
4. **构建 / 预览 / 质量检查**
   ```bash
   pnpm build          # tsc -b + vite build
   pnpm build:prod     # BUILD_MODE=prod vite build
   pnpm preview        # 预览 dist
   pnpm lint           # eslint + react-hooks 规则
   pnpm clean          # 清空 node_modules/.pnpm-store 后重装
   ```

## 应用结构概览
- 路由定义：`src/App.tsx` 使用 `react-router-dom` 配置首页、分类、搜索、详情、购物车、结算、账户、订单详情、管理员及超级管理员入口。
- 状态管理：`src/contexts/AuthContext.tsx` 封装 Supabase Auth、角色加载、登录/注册/登出逻辑，并在 `src/hooks/usePermission.ts` 暴露基于角色的守卫。
- 数据访问：
  - `src/lib/supabase.ts` 创建客户端并集中定义 `Product/Order/...` 类型。
  - `src/lib/api.ts` 通过 `VITE_SUPABASE_URL/functions/v1/*` 调用 `admin-products`、`super-admin-users`、`user-password` Edge Functions。
- 页面示例：`pages/AdminProductsPage.tsx`、`pages/SuperAdminUsersPage.tsx` 体现管理员/超级管理员工作流；`pages/CheckoutPage.tsx` 演示下单与模拟支付流程。

## Supabase 与 Edge Functions
- 主目录 `supabase/functions/` 为线上使用的函数（`admin-products`、`super-admin-users`、`user-password`、`user-role` 等）。
- `jd-shop/supabase/functions/` 保留了调试/验证用的函数样板，可用作实验或 CLI 测试目录。
- 运行 `supabase functions deploy <name>` 前请在 CLI 配置中注入 `SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`。
- 数据库迁移、策略与示例脚本位于 `supabase/migrations/`、`supabase/tables/` 以及根目录的 `setup_super_admin.sql`。

## 测试与验收
- `tests/scripts/run-all-tests.sh` 提供交互式菜单，也可通过 `./tests/scripts/run-all-tests.sh admin` 这类参数运行单套测试。
- 每个脚本顶部的 `BASE_URL`、账号信息可以按需要指向最新部署；执行后会在 `tests/reports/` 下生成带时间戳的 Markdown 记录，手动勾选对应项即可。
- 对 UI、权限、流程等进行人工验证后请按 `docs/role-permission-system-design.md`、`docs/content-structure-plan.md` 的清单进行补充说明。

### 可用测试账号
| 角色 | 登录邮箱 | 密码 | 说明 |
| --- | --- | --- | --- |
| 普通用户（购物、订单） | `jwdexcwf@minimax.com` | `dOV8oYqzll` | 仅可访问 `/cart`、`/checkout`、`/account` 等常规用户页面，不能进入管理端。 |
| 管理员（商品管理） | `qwzbngcq@minimax.com` | `JNIvPndCNu` | 可访问 `/admin/products`，通过 `admin-products` Edge Function 操作商品；无用户/角色管理权限。 |
| 超级管理员（角色 & 用户） | `isexdomo@minimax.com` | `d74Q7MHBvU` | 可访问 `/super-admin/users`、`/super-admin/roles` 等高权限页面，并调用 `super-admin-users` 与 `user-role` Edge Function。 |

> 登录 URL（当前测试部署）：`https://xpak1yu0vzmo.space.minimaxi.com`。在部署到新环境后，请更新上述账号对应的 `BASE_URL` 和 URL 记录，确保脚本与人工测试同步。

## 文档索引
| 主题 | 位置 |
| --- | --- |
| 设计规范 / 色板 / token | `docs/design-specification.md`, `docs/design-tokens.json` |
| IA 与内容规划 | `docs/content-structure-plan.md` |
| 京东调研与研究计划 | `docs/jd_analysis.md`, `docs/research_plan_jd_analysis.md` |
| 权限系统设计与进度 | `docs/role-permission-system-design.md`, `docs/role-permission-implementation-progress.md` |
| UI/UX 评审 | `docs/ui-ux-analysis.md` |
| 环境变量说明 | `环境变量配置指南.md` |

## 贡献指南
1. 遵循 2-space 缩进、函数式组件与 `@/` 路径别名。
2. 对 hooks 的依赖警告进行处理后再提交，`pnpm lint` 必须通过。
3. PR 描述需包含：问题背景、主要修改、执行过的命令/测试、可视化变更截图（如适用）。
4. 影响 `src/lib/supabase.ts` 或 `supabase/functions/` 时同步通知前端与平台负责人。

欢迎继续扩展购物流程、接入真支付或完善自动化测试，提交前请确保文档与代码保持一致。EOF
