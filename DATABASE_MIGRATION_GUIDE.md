# 数据库迁移说明

## 当前状态
- 前端项目已成功构建并可以运行
- 测试脚本运行正常
- 数据库表结构需要创建
- 已创建迁移文件，但无法通过 API 执行（需要服务角色密钥）

## 迁移文件
以下 SQL 文件已创建，需要在 Supabase 项目中执行：

1. `supabase/migrations/001_create_ecommerce_tables.sql` - 创建电商系统核心表
2. `supabase/migrations/002_insert_test_data.sql` - 插入测试数据
3. 现有的迁移文件（角色系统、RLS策略等）

## 执行迁移的步骤

### 方法1：使用 Supabase 仪表板
1. 登录到 Supabase 仪表板
2. 选择你的项目
3. 转到 "SQL 编辑器" 选项卡
4. 按以下顺序执行 SQL 文件：
   - 先执行现有的迁移文件
   - 再执行 `001_create_ecommerce_tables.sql`
   - 最后执行 `002_insert_test_data.sql`

### 方法2：使用 Supabase CLI
1. 安装 Supabase CLI：
   ```bash
   # Ubuntu/Debian
   curl -L https://cli.supabase.com/install.sh | sh
   ```

2. 在项目根目录初始化 Supabase 项目：
   ```bash
   supabase init
   supabase link --project-ref [your-project-ref]
   ```

3. 执行迁移：
   ```bash
   supabase db push
   ```

### 方法3：使用数据库客户端
1. 使用 PostgreSQL 客户端连接到 Supabase 数据库
2. 在数据库中按顺序执行迁移文件

## 验证迁移
迁移完成后，你可以：
1. 启动前端应用：`cd jd-shop && pnpm dev`
2. 访问应用并测试功能
3. 验证商品、购物车、订单等功能是否正常工作

## 注意事项
- 迁移需要 Supabase 服务角色密钥
- `SUPABASE_SERVICE_ROLE_KEY` 应配置在服务器端环境变量中
- 确保 RLS (Row Level Security) 策略已正确设置

## 完成后
一旦数据库迁移完成，前端应用将能够连接到实际的数据库，而不是依赖模拟数据。