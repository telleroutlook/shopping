-- Migration: setup_test_super_admin
-- Created at: 1762869978

-- 确保测试用户有profile记录并设置为超级管理员
INSERT INTO profiles (id, email, role_id, created_at)
VALUES 
  ('812a5fe7-4352-4040-bbb3-ae8d5a83ab1f', 'qwzbngcq@minimax.com', 3, NOW())
ON CONFLICT (id) 
DO UPDATE SET role_id = 3, email = EXCLUDED.email;

-- 同时确保第二个测试用户也有profile
INSERT INTO profiles (id, email, role_id, created_at)
SELECT 
  id,
  email,
  1,
  NOW()
FROM auth.users 
WHERE email = 'jwdexcwf@minimax.com'
ON CONFLICT (id) 
DO UPDATE SET email = EXCLUDED.email;;