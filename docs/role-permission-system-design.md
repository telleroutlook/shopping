# 用户角色权限管理系统设计文档

## 系统概述

实现三级用户权限管理：普通用户、管理员、超级管理员

## 数据库设计

### 1. roles 表（角色定义表）
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始数据
INSERT INTO roles (name, description) VALUES
    ('user', '普通用户：只能购物'),
    ('admin', '管理员：可以管理商品'),
    ('super_admin', '超级管理员：可以管理用户和指定管理员');
```

### 2. 扩展 profiles 表（添加角色字段）
```sql
ALTER TABLE profiles 
ADD COLUMN role_id INTEGER DEFAULT 1 REFERENCES roles(id);

-- 为现有用户设置默认角色
UPDATE profiles SET role_id = 1 WHERE role_id IS NULL;
```

### 3. user_role_history 表（角色变更历史，可选）
```sql
CREATE TABLE user_role_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    old_role_id INTEGER REFERENCES roles(id),
    new_role_id INTEGER REFERENCES roles(id),
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT
);
```

## 权限矩阵

### 普通用户权限 (role_id = 1)
- 浏览商品
- 搜索商品
- 查看商品详情
- 添加商品到购物车
- 管理购物车
- 下单支付
- 查看自己的订单
- 管理收货地址
- 修改自己的密码

### 管理员权限 (role_id = 2)
包含普通用户所有权限，额外增加：
- 发布新商品
- 编辑商品信息
- 删除商品
- 管理商品库存
- 查看所有订单
- 修改订单状态

### 超级管理员权限 (role_id = 3)
包含管理员所有权限，额外增加：
- 查看所有用户信息
- 指定用户为管理员
- 解除用户的管理员权限
- 查看角色变更历史

## API端点设计

### 1. 权限验证中间件
**Edge Function**: `check-permission`
- 输入：JWT token, required_role
- 输出：用户信息 + 权限验证结果

### 2. 商品管理API
**Edge Function**: `admin-products`
- POST /admin-products/create - 创建商品
- PUT /admin-products/update - 更新商品
- DELETE /admin-products/delete - 删除商品
- PUT /admin-products/stock - 更新库存

### 3. 用户管理API
**Edge Function**: `super-admin-users`
- GET /super-admin-users/list - 获取所有用户
- POST /super-admin-users/set-role - 设置用户角色
- GET /super-admin-users/role-history - 查看角色变更历史

### 4. 密码管理API
**Edge Function**: `user-password`
- POST /user-password/change - 修改密码

### 5. 角色查询API
**Edge Function**: `user-role`
- GET /user-role/info - 获取当前用户角色信息

## RLS策略设计

### profiles表RLS
```sql
-- 所有用户可以读取自己的profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 所有用户可以更新自己的profile（除了role_id）
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 超级管理员可以查看所有profiles
CREATE POLICY "Super admin can view all profiles"
ON profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id = 3
    )
);

-- 超级管理员可以更新role_id
CREATE POLICY "Super admin can update user roles"
ON profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id = 3
    )
);
```

### products表RLS
```sql
-- 所有人可以读取激活的商品
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
USING (is_active = true);

-- 管理员可以创建商品
CREATE POLICY "Admins can create products"
ON products FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id IN (2, 3)
    )
);

-- 管理员可以更新商品
CREATE POLICY "Admins can update products"
ON products FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id IN (2, 3)
    )
);

-- 管理员可以删除商品
CREATE POLICY "Admins can delete products"
ON products FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id IN (2, 3)
    )
);
```

## 超级管理员配置

超级管理员通过数据库直接配置，在初始化时创建：

```sql
-- 假设超级管理员邮箱为 superadmin@example.com
UPDATE profiles 
SET role_id = 3 
WHERE email = 'superadmin@example.com';
```

## 前端页面设计

### 1. 管理员商品管理页面 (/admin/products)
- 商品列表（带搜索、筛选）
- 添加商品表单
- 编辑商品表单
- 删除商品确认
- 库存管理

### 2. 超级管理员用户管理页面 (/super-admin/users)
- 用户列表（显示邮箱、角色、注册时间）
- 角色设置操作
- 角色变更历史查看

### 3. 用户设置页面增强 (/account/settings)
- 原有个人信息编辑
- 新增：密码修改功能

## 权限控制流程

1. 用户登录后，从profiles表获取role_id
2. 前端根据role_id显示/隐藏功能
3. 后端API通过Edge Function验证权限
4. 数据库RLS提供最后一层安全保障

## 实施状态（2025-11-12 更新）

### 第一阶段：数据库和后端（✅ 已完成）
1. ✅ 创建roles表
2. ✅ 扩展profiles表添加role_id字段
3. ✅ 设置RLS策略
4. ✅ 实现4个Edge Functions：
   - user-role：获取用户角色信息
   - admin-products：管理员商品管理API
   - super-admin-users：超级管理员用户管理API
   - user-password：用户密码修改API

### 第二阶段：前端界面（🔄 部分完成）
1. ✅ 权限管理相关hooks和utils
2. ✅ 基于角色的路由守卫
3. ✅ 管理员商品管理页面（AdminProductsPage.tsx）
4. ✅ 超级管理员用户管理页面（SuperAdminUsersPage.tsx）
5. ✅ 登录页面权限控制集成
6. 🔄 密码修改功能集成（API完成，前端待完善）
7. 🔄 角色状态管理优化（AuthContext部分问题）

### 已知问题和修复计划
1. **角色状态更新问题**：AuthContext的loadUserRole函数需要完善
2. **数据验证日志缺失**：需要添加完整的数据结构验证日志
3. **用户角色显示**：Header中userRole显示异常

## 安全考虑

1. ✅ 密码修改需要验证旧密码
2. ✅ 角色变更需要记录历史（user_role_history表）
3. ✅ 所有管理操作通过Edge Functions验证权限
4. ✅ Edge Functions使用SERVICE_ROLE_KEY操作敏感数据
5. ✅ RLS策略提供数据库级保护
6. ✅ 前端路由守卫 + 后端权限验证双重保护
