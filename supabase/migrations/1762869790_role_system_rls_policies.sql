-- Migration: role_system_rls_policies
-- Created at: 1762869790

-- =============================================
-- RLS策略：角色权限管理系统
-- =============================================

-- 1. PROFILES表RLS策略
-- 启用RLS（如果未启用）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can update user roles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 所有用户可以读取自己的profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
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

-- 用户可以插入自己的profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 用户可以更新自己的profile（但不能修改role_id）
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND (
        role_id IS NULL 
        OR role_id = (SELECT role_id FROM profiles WHERE id = auth.uid())
    )
);

-- 超级管理员可以更新任何用户的role_id
CREATE POLICY "Super admin can update user roles"
ON profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id = 3
    )
);

-- 2. PRODUCTS表RLS策略
-- 启用RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 删除旧策略
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can create products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- 所有人可以读取激活的商品
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
USING (is_active = true OR auth.uid() IS NOT NULL);

-- 管理员和超级管理员可以创建商品
CREATE POLICY "Admins can create products"
ON products FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id IN (2, 3)
    )
);

-- 管理员和超级管理员可以更新商品
CREATE POLICY "Admins can update products"
ON products FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id IN (2, 3)
    )
);

-- 管理员和超级管理员可以删除商品
CREATE POLICY "Admins can delete products"
ON products FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id IN (2, 3)
    )
);

-- 3. USER_ROLE_HISTORY表RLS策略
ALTER TABLE user_role_history ENABLE ROW LEVEL SECURITY;

-- 超级管理员可以查看所有角色变更历史
CREATE POLICY "Super admin can view role history"
ON user_role_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id = 3
    )
);

-- 超级管理员可以插入角色变更记录
CREATE POLICY "Super admin can insert role history"
ON user_role_history FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role_id = 3
    )
);

-- 4. ROLES表RLS策略
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- 所有登录用户可以查看角色列表
CREATE POLICY "Users can view roles"
ON roles FOR SELECT
USING (auth.uid() IS NOT NULL);;