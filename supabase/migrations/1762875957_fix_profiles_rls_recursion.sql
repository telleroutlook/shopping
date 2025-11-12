-- Migration: fix_profiles_rls_recursion
-- Created at: 1762875957

-- 删除有递归问题的策略
DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can update user roles" ON profiles;

-- Users can select own profile 策略已足够
-- 超级管理员查询所有用户时使用service role key(通过Edge Function);