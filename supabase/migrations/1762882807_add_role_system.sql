-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入三种角色
INSERT INTO roles (name, description) VALUES
    ('user', '普通用户：只能购物'),
    ('admin', '管理员：可以管理商品'),
    ('super_admin', '超级管理员：可以管理用户和指定管理员')
ON CONFLICT (name) DO NOTHING;

-- 扩展profiles表，添加角色字段
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role_id INTEGER DEFAULT 1 REFERENCES roles(id);

-- 为现有用户设置默认角色（普通用户）
UPDATE profiles SET role_id = 1 WHERE role_id IS NULL;

-- 创建用户角色变更历史表
CREATE TABLE IF NOT EXISTS user_role_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    old_role_id INTEGER REFERENCES roles(id),
    new_role_id INTEGER REFERENCES roles(id),
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_history_user_id ON user_role_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_history_changed_at ON user_role_history(changed_at DESC);
