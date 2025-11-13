# IFLOW · JD Shop 项目协作指引（2025-11-13）

IFLOW 旨在让多位 Agent/开发者在本仓库协同时保持一致。本文与 `AGENTS.md`、根级 README、`jd-shop/README.md`、`docs/role-permission-implementation-progress.md` 同步更新。

## 1. 核心原则
1. **工作目录**：前端代码改动集中在 `jd-shop/`；共享 UI 在 `src/components/ui`，页面在 `src/pages`，跨页面状态在 `src/contexts`，领域 hooks 在 `src/hooks`，Supabase/Stripe glue 在 `src/lib`。遵守 `AGENTS.md` 中的模块划分。
2. **文档优先**：任何结构或流程变化须同步 `README.md`、`docs/content-structure-plan.md`、`docs/role-permission-implementation-progress.md` 等关键文件。
3. **Tailwind + 语义 Token**：遵循 `text-text-primary`、`bg-background-surface` 等语义类名，避免直接写死颜色，确保与设计系统对齐。
4. **权限敏感**：涉及 `src/lib/supabase.ts`、`supabase/functions/*` 的改动需要同时通知前端与平台负责人，并更新权限文档。

## 2. 仓库结构与职责
| 路径 | 负责人/用途 | 说明 |
| --- | --- | --- |
| `jd-shop/` | 前端 | React 18 + Vite + Tailwind。所有 UI/逻辑修改必须在此目录执行 `pnpm lint`、`pnpm build`。 |
| `docs/` | 设计 & 架构 | 保留设计规范、内容规划、权限设计、UI/UX 评审，禁止冗余测试报告。 |
| `supabase/` | 平台 | 生产 Edge Functions、SQL 迁移、策略。部署前需确保 `.env` 中提供 `SUPABASE_URL` 与 `SUPABASE_SERVICE_ROLE_KEY`。 |
| `tests/` | QA | 黑盒脚本与生成的 Markdown 报告，输出放在 `tests/reports/`。 |
| 其他根级文档 | 共享 | `环境变量配置指南.md` 描述变量策略；`setup_super_admin.sql` 初始化权限数据。 |

## 3. 环境与命令
所有命令在 `jd-shop/` 执行：
- `pnpm install-deps`：安装依赖（被其他脚本自动调用）。
- `pnpm dev`：本地开发。
- `pnpm build` / `pnpm build:prod`：构建与类型检查。
- `pnpm lint`：ESLint + react-hooks 规则。
- `pnpm preview`：本地预览 `dist/`。
- `pnpm clean`：清除 node_modules 与 pnpm store，定位缓存异常。

测试脚本示例：
```bash
./tests/scripts/run-all-tests.sh admin
./tests/scripts/test-shopping-flow.sh
```
执行后在 `tests/reports/` 生成时间戳报告，务必手动勾选通过/失败条目。

## 4. 环境变量与密钥
- React/Vite 端仅使用 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（见 `.env.example` 与《环境变量配置指南》）。
- Edge Function / CLI 在 `supabase/.env` 或部署控制台中设置 `SUPABASE_SERVICE_ROLE_KEY`、`STRIPE_SECRET_KEY` 等高权限变量。
- **禁止** 将服务密钥写入提交的文件或控制台输出。

## 5. 迭代流程
1. **需求拆解**：在 Issue/任务中引用对应文档章节（如内容规划、权限设计）。
2. **实现阶段**：
   - 在 `jd-shop/` 内创建/修改组件；需要全局状态时优先考虑 Context + hooks。
   - Supabase schema 变更 → 更新 `supabase/migrations/` 并同步 README/文档。
3. **自测**：
   - UI 变动 → 截图附在 PR 描述中。
   - 权限相关 → 逐一使用普通用户/管理员/超级管理员账号验证。
   - 运行相关测试脚本或列出“未运行原因”。
4. **提交信息**：使用 `<type>[:emoji] 动词短语`，例如 `docs: refresh flow guide`、`feat: add admin stock widget`。
5. **PR 清单**：问题背景、主要修改、执行过的命令、测试结果、可视化证据、是否触及 Supabase/环境。

## 6. 角色与账号
参见根 README “测试账号”章节，保持以下惯例：
- 普通用户：用于购物流程自测。
- 管理员：验证 `/admin/products` 全套 CRUD 与库存。
- 超级管理员：验证 `/super-admin/users` 的角色切换与历史列表。
若引入新角色，需同步更新：`docs/role-permission-system-design.md`、`docs/role-permission-implementation-progress.md`、`src/hooks/usePermission.ts`、`tests/scripts/*`。

## 7. 文档与知识同步
- **必读**：`AGENTS.md`（架构准则）、根 README、`jd-shop/README.md`、`docs/content-structure-plan.md`、`docs/role-permission-implementation-progress.md`。
- **附加**：`docs/ui-ux-analysis.md`（设计评审）、`docs/design-specification.md`（token 与组件规范）。
- 更新任一核心文档后，需在 PR 描述中注明“Docs updated: ...”。

## 8. 常见问题排查
| 症状 | 处理 |
| --- | --- |
| 登录后无权限 | 检查 `AuthContext` 日志、确认 `profiles.role_id` 是否正确，必要时调用 `refreshUserRole()`。 |
| Edge Function 503 | 使用直接数据库查询兜底（如现有 `AuthContext`），同时检查 Supabase 平台状态。 |
| 样式失效 | 确认 Tailwind safelist 和语义 token 是否存在；执行 `pnpm dev --force` 清缓存。 |
| 构建失败 | 确认 `pnpm install-deps` 是否成功、`tsconfig` 项目引用是否同步。 |

保持 IFLOW、README 与代码一致是每次迭代的交付要求，如发现文档滞后，请在同一次 PR 中修复并引用本指引。EOF
