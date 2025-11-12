-- 确保用户有profile记录
INSERT INTO profiles (id, email, role_id, created_at)
SELECT 
  '812a5fe7-4352-4040-bbb3-ae8d5a83ab1f'::uuid,
  'qwzbngcq@minimax.com',
  3,
  NOW()
ON CONFLICT (id) 
DO UPDATE SET role_id = 3, email = EXCLUDED.email;

-- 查看结果
SELECT id, email, role_id, created_at FROM profiles WHERE email = 'qwzbngcq@minimax.com';
