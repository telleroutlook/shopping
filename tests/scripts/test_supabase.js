// 测试Supabase查询
// 配置Supabase URL和密钥
const SUPABASE_URL = process.env.SUPABASE_URL || "your_supabase_url_here"
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "your_supabase_anon_key_here"

if (SUPABASE_URL === "your_supabase_url_here" || SUPABASE_ANON_KEY === "your_supabase_anon_key_here") {
  console.log('✗ 请设置 SUPABASE_URL 和 SUPABASE_ANON_KEY 环境变量')
  process.exit(1)
}

// 测试查询(不需要认证的roles表)
fetch(`${SUPABASE_URL}/rest/v1/roles?select=*`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('✓ Roles查询成功:')
  console.log(JSON.stringify(data, null, 2))
})
.catch(err => {
  console.error('✗ Roles查询失败:', err.message)
})