// Supabase查询测试
console.log('=== 开始Supabase查询测试 ===');

// 检查window.supabase是否存在
console.log('1. 检查window.supabase:');
console.log('window.supabase存在:', typeof window.supabase !== 'undefined');
if (typeof window.supabase === 'undefined') {
    console.error('window.supabase未定义！');
} else {
    console.log('window.supabase类型:', typeof window.supabase);
}

// 测试函数
async function testSupabaseQueries() {
    try {
        // 获取当前用户
        console.log('\n2. 获取当前用户:');
        const { data: { user }, error: userError } = await window.supabase.auth.getUser();
        if (userError) {
            console.error('获取用户错误:', userError);
            return;
        }
        console.log('Current user:', user);
        
        if (!user) {
            console.error('未找到用户');
            return;
        }
        
        // 查询profiles
        console.log('\n3. 查询profiles:');
        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('id, email, full_name, role_id')
            .eq('id', user.id)
            .single();
        
        console.log('Profile data:', profile);
        console.log('Profile error:', profileError);
        
        // 查询roles
        if (profile && profile.role_id) {
            console.log('\n4. 查询roles:');
            const { data: role, error: roleError } = await window.supabase
                .from('roles')
                .select('id, name, description')
                .eq('id', profile.role_id)
                .single();
            
            console.log('Role data:', role);
            console.log('Role error:', roleError);
        } else {
            console.log('\n4. 未找到role_id或profile数据');
        }
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 执行测试
testSupabaseQueries();

console.log('=== 测试脚本已执行 ===');