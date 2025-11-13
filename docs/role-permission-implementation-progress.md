# 用户角色权限管理系统实施进度（2025-11-13 更新）

项目当前已完成三级角色（普通用户 / 管理员 / 超级管理员）的端到端实现，覆盖数据库、RLS 策略、Edge Functions 与前端路由守卫。本文件同步最新进展并列出仍需关注的事项。

## 1. 状态概览
| 层级 | 完成度 | 说明 |
| --- | --- | --- |
| 数据库 & RLS | ✅ | `roles`、`profiles.role_id`、`user_role_history` 已上线；对应策略已允许管理员/超级管理员执行必要操作。 |
| Edge Functions | ✅ | `admin-products`、`super-admin-users`、`user-role`、`user-password` 均可用，部署源位于 `supabase/functions/*`。 |
| 前端 Auth & Hooks | ✅ | `AuthContext` 直接查询 `profiles` + `roles` 数据，`useRequireRole`/`useRequireAdmin`/`useRequireSuperAdmin` 封装路由守卫。 |
| 管理员 UI | ✅ | `pages/AdminProductsPage.tsx` 已可增删改商品、更新库存，并通过 `adminProductsApi` 写入。 |
| 超级管理员 UI | ✅ | `pages/SuperAdminUsersPage.tsx` 支持列表、角色修改、历史查看与权限重载。 |
| 文档/测试 | 🔄 | 本文档已更新；黑盒脚本仍需加入角色流的实际断言，可在 `tests/scripts` 中补充。 |

## 2. 数据库与策略
- **核心表**：`roles`（角色定义）、`profiles.role_id`（用户角色）、`user_role_history`（角色流转）。
- **策略摘要**：
  - 普通用户：仅能读取/修改自己的 profile、购物车、订单、地址。
  - 管理员：在 `products` 等表上具备 INSERT/UPDATE 权限，但仍受 RLS 限制。
  - 超级管理员：可读取所有 profile、修改 role_id，并访问 `user_role_history`。
- **脚本**：`setup_super_admin.sql` 可在新环境快速创建初始角色与超级管理员账号。

## 3. Edge Function 输出
| 函数 | 目录 | 功能要点 |
| --- | --- | --- |
| `user-role` | `supabase/functions/user-role` | 根据 JWT 直接查询 `profiles` + `roles`，提供当前用户角色。前端已在 `AuthContext` 中改为直接访问数据库，Edge Function 作为备用方案保留。 |
| `admin-products` | `supabase/functions/admin-products` | 统一处理 create/update/delete/stock 操作，附带 RLS 权限校验。 |
| `super-admin-users` | `supabase/functions/super-admin-users` | 列表所有用户、调整角色、返回 `user_role_history`。 |
| `user-password` | `supabase/functions/user-password` | 校验旧密码并更新 Supabase Auth。 |

> 说明：`jd-shop/supabase/functions/*` 中的同名文件保留用于本地试验，生产部署以仓库根的 `supabase/functions/*` 为准。

## 4. 前端集成要点
- **认证上下文**：`src/contexts/AuthContext.tsx` 直接查询 `profiles` 表以绕过 Edge Function 503 问题，仍保留 `refreshUserRole()` 以应对权限变更后重新拉取。
- **权限 Hook**：`src/hooks/usePermission.ts` 暴露 `useRequireRole` / `useRequireAdmin` / `useRequireSuperAdmin`，在管理员 / 超级管理员页面做导航级拦截，并提供 `useCheckRole` 供页面内部做条件渲染。
- **API 封装**：`src/lib/api.ts` 根据 `import.meta.env.VITE_SUPABASE_URL` 调用 Edge Functions，并携带 `Authorization + apikey` 头部，所有“高权限”操作经此入口完成。
- **UI 显示**：
  - 管理员页以 `productSchema` 校验输入，错误信息通过 `sonner` 与内联提示呈现。
  - 超级管理员页提供角色颜色、Badge、历史抽屉以及“重新检查权限”按钮。

## 5. 待办与建议
1. **测试脚本补强**：`tests/scripts/test-admin-user.sh`、`test-superadmin-user.sh` 目前只生成 checklist，可引导测试者在报告里记录 Edge Function 响应或截图。
2. **日志策略**：`AuthContext` 仍打印大量调试日志，可视情况切换为 `debug` 标志或使用 `import.meta.env.DEV` 控制。
3. **Edge Function 健康监控**：建议在 Supabase 上启用日志告警，或在前端对 503 结果添加退避重试。
4. **角色枚举集中化**：目前前端 `ROLES` 与 Edge Function 中的 `ROLES` 各自维护，未来可通过共享常量（例如 `supabase/functions/_shared` + `src/constants/roles.ts`）保持一致。

如需进一步扩展权限（例如运营、客服角色），可在 `roles` 表新增记录、更新 RLS，并在 `AuthContext` 与 `usePermission` 中追加对应常量和守卫。EOF
