-- Migration: fix_profiles_rls_circular_dependency
-- Created at: 1762871869

-- 删除旧的重复策略
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Allow insert profile on signup" ON profiles;

-- 创建新的简化策略:用户可以读取自己的profile(包括role信息)
CREATE POLICY "Users can select own profile"
ON profiles FOR SELECT
TO public
USING (auth.uid() = id);

-- 保持insert策略
CREATE POLICY "Users can insert own profile on signup"
ON profiles FOR INSERT
TO public
WITH CHECK (auth.uid() = id);;