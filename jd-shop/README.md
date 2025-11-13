# JD Shop 前端应用

基于 React 18 + Vite + Supabase 的电商示例，提供完整的三级权限购物流程。此文档聚焦 `jd-shop/` 子目录的开发、构建与调试说明。

## 运行脚本
| 命令 | 说明 |
| --- | --- |
| `pnpm install-deps` | 同步依赖（所有脚本都会先调用它，保证 CI/本地一致）。 |
| `pnpm dev` | 启动 Vite 开发服务器（默认 http://localhost:5173）。 |
| `pnpm build` | `tsc -b` + `vite build`，用于本地验证。 |
| `pnpm build:prod` | 在 `BUILD_MODE=prod` 下构建生产包。 |
| `pnpm preview` | 预览 `dist/`。 |
| `pnpm lint` | 运行 eslint（包含 react-hooks 规则）。 |
| `pnpm clean` | 清理 node_modules / pnpm store，解决缓存异常。 |

> 以 `pnpm` 为默认包管理器；如果使用 npm/yarn，请自行转换命令并确保 lockfile 同步。

## 环境变量
1. 在 `jd-shop/` 下创建 `.env`（可由仓库根目录的 `.env.example` 复制而来）。
2. 必填变量：
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<public-anon-key>
   ```
3. Edge Function / Supabase CLI 运行时仍需 `SUPABASE_SERVICE_ROLE_KEY` 等安全变量，切勿写入前端 `.env`；请在部署平台或 Supabase CLI 的 `.env` 中配置。
4. 更多细节、推荐做法见仓库根目录的《环境变量配置指南》。

## 代码结构
```
src/
├── components/            # 复用 UI（Radix + Tailwind），子目录 ui/* 为共享原子组件
├── pages/                 # 路由级页面（Home, Category, Product, Cart, Checkout, Account, Admin, SuperAdmin）
├── contexts/              # 全局状态（AuthContext 负责 Supabase Auth + 角色）
├── hooks/                 # 业务 hooks（如 usePermission、useCart 等）
├── lib/                   # Supabase 客户端、Edge Function API、事件总线、校验 schema
└── main.tsx / App.tsx     # 路由和入口
```
- Supabase 辅助脚本与 Edge Function 源文件放在 `supabase/functions/`。
- Tailwind 主题定义见 `tailwind.config.js`，语义化颜色/排版在 `src/index.css` 内落地。

## 功能速览
- **购物体验**：主页、分类、搜索、商品详情、购物车、结算、订单详情完整串联。
- **账户中心**：地址管理、订单列表、密码修改（通过 `user-password` Edge Function）。
- **收藏夹**：商品详情页可收藏/取消收藏，账户页「我的收藏」集中管理与跳转。
- **管理员**：`/admin/products` 允许增删改查商品并更新库存，使用 `admin-products` Edge Function 与 Zod 表单校验。
- **超级管理员**：`/super-admin/users` 查看用户、切换角色、浏览角色历史，调用 `super-admin-users` Edge Function。
- **权限守卫**：`useRequireRole / useRequireAdmin / useRequireSuperAdmin` 基于 `AuthContext` 中的角色信息进行导航拦截。

## 与 Supabase 交互
- `src/lib/supabase.ts` 负责创建客户端并集中导出主要表的 TypeScript 类型。
- `src/lib/api.ts` 对 Edge Function 进行轻量封装，统一在请求头内传入 `Authorization`/`apikey`。
- Edge Function 源码位于仓库根 `supabase/functions/*`（生产使用）以及 `jd-shop/supabase/functions/*`（实验/示例）。
- `setup_super_admin.sql` 可在本地数据库中创建初始角色和超级管理员用户。

## 数据表补充：favorites（收藏夹）
用于存储用户收藏的商品，请确保本地 Supabase 项目中存在如下表结构与 RLS 策略：

```sql
create table if not exists public.favorites (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.favorites enable row level security;

create policy "users can view own favorites"
  on public.favorites
  for select
  using (auth.uid() = user_id);

create policy "users can manage own favorites"
  on public.favorites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

前端默认通过 `supabase.from('favorites')` 直接读写，若自定义 schema，请同步更新 `src/lib/supabase.ts` 中的类型定义与查询语句。

## 测试 & 验证
- 交互式黑盒脚本位于 `../tests/scripts/`，运行这些脚本前请更新脚本内的 `BASE_URL` 以指向当前部署。
- 关键人工验证（角色守卫、购物车、结算、Edge Function 调用）可参考 `docs/role-permission-system-design.md` 中的验收清单。
- 建议在修改权限/Edge Function 相关代码后执行：登录 → 刷新 → 切换角色 → 访问 `/admin/products` `/super-admin/users`，确认 `AuthContext` 日志无异常。

## 常见问题
| 现象 | 解决方案 |
| --- | --- |
| 启动报错 `VITE_SUPABASE_URL is not defined` | 确认 `.env` 位于 `jd-shop/` 且前缀为 `VITE_`；重启 `pnpm dev`。 |
| Edge Function 401/403 | 确认用户已登录、RLS 策略允许，且 CLI/部署环境配置了 `SUPABASE_SERVICE_ROLE_KEY`。 |
| hooks 依赖告警 | 按 eslint 提示补齐依赖或在 `useCallback`/`useMemo` 中包裹。 |
| 样式不生效 | 确保 Tailwind safelist/主题 token 已加入 `tailwind.config.js`，或检查类名是否存在 `text-text-*` 这类语义 token。 |

欢迎在此目录下继续开发组件、路由和 Supabase glue 逻辑，提交前请运行 `pnpm lint && pnpm build` 并更新相关文档。EOF
