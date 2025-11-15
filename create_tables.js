const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ihompiuebyblhticlybk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlob21waXVlYnlibGh0aWNseWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTA4NzEsImV4cCI6MjA3ODY2Njg3MX0.zzj42eUgAjDy2DTmDebwHzycumVbSMuQ2LplpQkcVuA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('开始创建电商表...');

    // 创建商品表 (使用 SQL RPC)
    const { data, error } = await supabase.rpc('create_products_table');
    
    if (error) {
      console.log('尝试手动创建商品表...');
      
      // 手动创建商品的替代方案 - 插入一些测试数据
      const testProducts = [
        {
          name: 'iPhone 15 Pro Max',
          description: '苹果最新旗舰手机，采用钛金属材质，搭载A17 Pro芯片，配备48MP主摄像头系统。',
          price: 8999.00,
          category_id: null, // 暂时没有分类ID
          is_active: true
        },
        {
          name: 'MacBook Pro 16英寸',
          description: '全新M3 Max芯片，16英寸Liquid Retina XDR显示屏，适合专业创意工作者。',
          price: 22999.00,
          category_id: null,
          is_active: true
        },
        {
          name: 'AirPods Pro 3',
          description: '全新AirPods Pro 3代，支持主动降噪、空间音频和自适应透明度模式。',
          price: 1899.00,
          category_id: null,
          is_active: true
        }
      ];
      
      console.log('创建测试商品数据...');
      const { error: insertError } = await supabase
        .from('products')
        .insert(testProducts);
        
      if (insertError) {
        console.error('插入测试商品失败:', insertError.message);
        console.log('products表可能还不存在，错误信息:', insertError);
      } else {
        console.log('测试商品创建成功！');
      }
    } else {
      console.log('商品表创建成功');
    }

  } catch (error) {
    console.error('创建表时出错:', error);
  }
}

createTables();