# 用户角色权限管理系统设计文档

## 1. 设计目标
本系统围绕三种角色（普通用户/管理员/超级管理员）展开，目标是：
1. 让普通用户只操作自己的购物数据、订单与地址；
2. 让管理员在遵循 RLS 策略的前提下管理 `products`、`orders` 和 `cart_items`；
3. 让超级管理员能调整用户角色、读取历史记录，并保持对 `roles` 与 `user_role_history` 的可见性。

## 2. 数据模型
### 2.1 `roles`
- 所在文件：`supabase/migrations/1762869752_add_role_system.sql`（以及后续迁移中的重复语义）。
- 栏位：`id`（SERIAL PK）、`name`（user/admin/super_admin）、`description`、`created_at`。
- 角色表用于和 Profile 形成 FK，所有超级管理员或管理员操作都直接校验该表。

### 2.2 `profiles`
- 通过迁移 `1762869752_add_role_system.sql`/`1762882807_add_role_system.sql` 增加了 `role_id INTEGER`，默认 `1`（普通用户）。
- 所有 `AuthContext` 的角色读取都在此表中完成，`user-role` Edge Function 也会对缺失 `role_id` 的账户写入默认值以保持后向兼容。

### 2.3 `user_role_history`
- 也是通过上述迁移创建，记录 `user_id`、`old_role_id`、`new_role_id`、`changed_by`、`reason` 与 `changed_at`。
- `super-admin-users` Edge Function 在角色切换后会写入历史，便于审计与前端展示。

## 3. RLS 策略（与迁移文件保持同步）
### 3.1 `profiles`
- 只允许当前用户读取/更新自己的资料；插入限制为 `auth.uid() = id`。
- 超级管理员可读取全部 Profile，并单独允许更新任何用户的 `role_id`（见 `supabase/migrations/1762882808_role_system_rls_policies.sql`）。
- 更新策略禁止普通用户自己提升角色，保持只能写入原有 `role_id`。

### 3.2 `products`
- `is_active = true` 的商品对所有访客可见，且在登录后（`auth.uid()` 不为空）仍可查询历史商品。
- 插入/更新/删除操作仅允许 `role_id IN (2, 3)`（管理员/超级管理员）。

### 3.3 `user_role_history`
- 仅超级管理员可查询或写入记录，其他角色无法触达任何历史数据。

### 3.4 `roles`
- 所有已登录用户可查询角色列表，用于渲染前端 Badge 与筛选（如超级管理员页面展示完整角色名）。

## 4. Edge Functions 与共享中间件
- `supabase/functions/_shared/auth-middleware.ts` 提供 `verifyAuthAndPermissions()`、`withAuthAndPermissions()` 等工具，所有高权限函数都复用它来验证 JWT、读取 Profile、对照 `role_id` 和记录日志。
- `admin-products`（`supabase/functions/admin-products/index.ts`）：统一处理商品 CRUD、库存更新，接口接受 `action` 参数，只有管理员/超级管理员可调用。
- `super-admin-users`：负责 `list_users`、`set_role`（禁止自我改角色、禁止通过 API 升级为超级管理员）与 `role_history`，并在成功写入 `user_role_history`。
- `user-password`：校验旧密码并更新 Supabase Auth（通过 `SUPABASE_SERVICE_ROLE_KEY` 执行），并结合 `sonner` 前端提示。
- `user-role`：当前用户角色查询接口，若 Profile 没有 `role_id` 会自动补齐并返回，包括关联的 `roles` 数据。
- `create-admin-user` & `create-base-tables` 等脚本函数保留作初始化/调试用途，和根目录 `run_migrations.js` 连动，便于在 staging 或新部署时触发。

## 5. 前端集成
- `src/contexts/AuthContext.tsx` 直接从 `profiles` 拉取 `role_id`（而不是每次请求 Edge Function），并在 `refreshUserRole()` 中重新加载，避免因 Edge Function 503 造成角色信息不同步。
- `src/hooks/usePermission.ts` 根据 `role_id` 封装 `useRequireRole` / `useRequireAdmin` / `useRequireSuperAdmin`，在路由表（`src/App.tsx`）中的管理员/超级管理员路径使用这些 hook 做守卫。
- `Header` 和 `PageShell` 通过 `cartEvents` 与 `supabase/lib/events.ts` 持续监听 `cart:updated`，确保徽章与侧边栏在角色切换后仍旧可见（管理员/超级管理员仍可访问）。

## 6. 初始化与运维建议
- 使用 `supabase/migrations/*.sql` 管理 schema，推荐依次运行 `run_migrations.js`（或 Supabase CLI）确保 `roles`、`user_role_history`、RLS 策略等按顺序生效。
- `supabase/migrations/1762869978_setup_test_super_admin.sql` 提供了一个可切换的超级管理员账号（可在新环境或 CI 中多次运行）。
- 每次权限相关改动之后，执行 `tests/scripts/test-admin-user.sh` 与 `test-superadmin-user.sh`，并将结果报告存入 `tests/reports/`；必要时可扩展脚本做 `Edge Function` 响应断言。

## 7. 注意事项
- 角色枚举仍集中在 `supabase/functions/_shared/auth-middleware.ts` + `src/hooks/usePermission.ts` 中，如果后续增加新角色（客服、运营），请同步更新两处常量。
- 所有 Edge Function 均通过 `SUPABASE_SERVICE_ROLE_KEY` 操作敏感数据，请务必在部署平台（Vercel/Cloudflare）中使用机密变量。
