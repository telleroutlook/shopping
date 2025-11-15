const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './jd-shop/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// 使用 anon key 连接
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('检查与 Supabase 的连接...');
  
  // 尝试查询一个表以检查连接
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('无法访问 products 表:', error.message);
      console.log('这可能意味着表不存在，需要使用服务角色密钥创建表。');
      return false;
    } else {
      console.log('成功连接到 Supabase，products 表存在');
      return true;
    }
  } catch (err) {
    console.log('连接错误:', err.message);
    return false;
  }
}

async function runMigrations() {
  console.log('注意：数据库迁移需要 Supabase 服务角色密钥才能执行 DDL 操作。');
  console.log('当前使用匿名密钥，仅能执行查询操作。');
  
  const isConnected = await checkConnection();
  
  if (!isConnected) {
    console.log('\n要完成数据库迁移，您需要：');
    console.log('1. 在 supabase/.env 中添加 SUPABASE_SERVICE_ROLE_KEY');
    console.log('2. 然后使用 Supabase CLI 或数据库客户端直接执行迁移文件');
    console.log('\n迁移文件位于：');
    console.log('- /supabase/migrations/001_create_ecommerce_tables.sql');
    console.log('- /supabase/migrations/002_insert_test_data.sql');
    console.log('以及现有的迁移文件');
  }
  
  console.log('\n迁移文件列表：');
  const fs = require('fs');
  const path = require('path');
  
  const migrationsDir = './supabase/migrations';
  const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort();
  
  files.forEach(file => {
    console.log(`- ${file}`);
  });
  
  console.log('\n数据库迁移检查完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigrations().catch(console.error);
}

module.exports = { runMigrations };