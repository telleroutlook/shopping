const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置，如果不存在则从 .env 文件加载
require('dotenv').config({ path: './jd-shop/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// 尝试使用服务角色密钥（如果有）
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

async function runMigrations() {
  console.log('开始执行数据库迁移...');

  // 读取迁移文件
  const fs = require('fs');
  const path = require('path');

  // 获取迁移文件列表
  const migrationsDir = './supabase/migrations';
  const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort();

  console.log('找到迁移文件:', files);

  for (const file of files) {
    console.log(`正在执行迁移: ${file}`);
    
    try {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // 分割并执行SQL语句
      const statements = sql.split(/;\s*(?=\n|$)/).filter(stmt => stmt.trim() !== '');
      
      for (const statement of statements) {
        const trimmedStmt = statement.trim();
        if (trimmedStmt) {
          console.log(` 执行语句: ${trimmedStmt.substring(0, 100)}${trimmedStmt.length > 100 ? '...' : ''}`);
          
          const { error } = await supabase.rpc('execute_sql', {
            sql_command: trimmedStmt
          }).select();
          
          if (error && !error.message.includes('does not exist') && !error.message.includes('already exists')) {
            console.warn(`  警告: 执行SQL时遇到问题:`, error.message);
            // 对于某些预期的错误（如表已存在），我们继续执行
          } else if (error) {
            console.log(`  信息:`, error.message);
          } else {
            console.log(`  成功执行`);
          }
        }
      }
      
      console.log(`迁移 ${file} 完成\n`);
    } catch (error) {
      console.error(`执行迁移 ${file} 时出错:`, error.message);
    }
  }

  console.log('数据库迁移执行完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigrations().catch(console.error);
}

module.exports = { runMigrations };