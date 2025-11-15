import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Users, Shield, Crown } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/usePermission'

interface UserRole {
  id: string
  email: string
  full_name: string
  role: {
    id: number
    name: string
    description: string
  }
}

const mockRoles = [
  {
    id: 1,
    name: '普通用户',
    description: '基础的购物功能权限',
    user_count: 1250
  },
  {
    id: 2,
    name: '管理员',
    description: '商品管理和订单处理权限',
    user_count: 5
  },
  {
    id: 3,
    name: '超级管理员',
    description: '完整的系统管理权限',
    user_count: 2
  }
]

const mockUsers: UserRole[] = [
  {
    id: 'user1',
    email: 'user1@example.com',
    full_name: '张三',
    role: { id: 1, name: '普通用户', description: '基础的购物功能权限' }
  },
  {
    id: 'user2',
    email: 'admin@example.com',
    full_name: '李四',
    role: { id: 2, name: '管理员', description: '商品管理和订单处理权限' }
  },
  {
    id: 'user3',
    email: 'superadmin@example.com',
    full_name: '王五',
    role: { id: 3, name: '超级管理员', description: '完整的系统管理权限' }
  }
]

export default function RoleManagementPage() {
  const { user } = useAuth()
  const { isSuperAdmin } = useRole()
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserRole[]>([])
  const [roles, setRoles] = useState(mockRoles)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<number>(0)

  useEffect(() => {
    if (!user || !isSuperAdmin()) {
      navigate('/')
      return
    }
    
    // 模拟加载用户数据
    setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 500)
  }, [user, isSuperAdmin, navigate])

  const handleRoleChange = (userId: string, newRoleId: number) => {
    const newRole = roles.find(r => r.id === newRoleId)
    if (!newRole) return

    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: { 
            id: newRole.id, 
            name: newRole.name, 
            description: newRole.description 
          }}
        : user
    ))

    // 更新角色统计
    setRoles(roles.map(role => {
      if (role.id === newRoleId) {
        return { ...role, user_count: role.user_count + 1 }
      }
      if (users.find(u => u.id === userId)?.role.id === role.id) {
        return { ...role, user_count: Math.max(0, role.user_count - 1) }
      }
      return role
    }))
  }

  const getRoleIcon = (roleId: number) => {
    switch (roleId) {
      case 1:
        return <Users className="w-5 h-5" />
      case 2:
        return <Shield className="w-5 h-5" />
      case 3:
        return <Crown className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
  }

  const getRoleColor = (roleId: number) => {
    switch (roleId) {
      case 1:
        return 'bg-info/10 text-info'
      case 2:
        return 'bg-warning/10 text-warning'
      case 3:
        return 'bg-success/10 text-success'
      default:
        return 'bg-text-tertiary/10 text-text-tertiary'
    }
  }

  if (!user || !isSuperAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">您没有权限访问此页面</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">加载中...</p>
        </div>
      </div>
    )
  }

  const filteredUsers = selectedRole 
    ? users.filter(u => u.role.id === selectedRole)
    : users

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-h1 font-bold text-text-primary">角色管理</h1>
            <Link to="/super-admin/users" className="text-brand hover:underline">
              用户管理
            </Link>
          </div>

          {/* 角色概览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`bg-white border rounded-lg p-6 cursor-pointer transition-all duration-fast ${
                  selectedRole === role.id 
                    ? 'border-brand bg-brand/5' 
                    : 'border-background-divider hover:border-brand hover:shadow-card-hover'
                }`}
                onClick={() => setSelectedRole(selectedRole === role.id ? 0 : role.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRoleColor(role.id)}`}>
                    {getRoleIcon(role.id)}
                  </div>
                  <span className="text-2xl font-bold text-text-primary">
                    {role.user_count}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {role.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {role.description}
                </p>
              </div>
            ))}
          </div>

          {/* 用户列表 */}
          <div className="bg-white border border-background-divider rounded-lg">
            <div className="p-6 border-b border-background-divider">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">
                  {selectedRole ? `角色：${roles.find(r => r.id === selectedRole)?.name}` : '所有用户'}
                  <span className="ml-2 text-sm font-normal text-text-secondary">
                    ({filteredUsers.length} 人)
                  </span>
                </h2>
                {selectedRole !== 0 && (
                  <button
                    onClick={() => setSelectedRole(0)}
                    className="text-sm text-brand hover:underline"
                  >
                    显示全部
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-surface">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      用户信息
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      当前角色
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-divider">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-background-surface/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-text-primary">
                            {userItem.full_name}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {userItem.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userItem.role.id)}`}>
                          {getRoleIcon(userItem.role.id)}
                          <span className="ml-1">{userItem.role.name}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={userItem.role.id}
                          onChange={(e) => handleRoleChange(userItem.id, parseInt(e.target.value))}
                          className="px-3 py-1 border border-background-divider rounded-md focus:border-brand focus:outline-none text-sm"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                <p className="text-text-secondary">
                  {selectedRole ? '此角色下暂无用户' : '暂无用户数据'}
                </p>
              </div>
            )}
          </div>

          {/* 角色权限说明 */}
          <div className="mt-8 bg-background-surface rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              角色权限说明
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-info" />
                  <span className="font-medium text-text-primary">普通用户</span>
                </div>
                <ul className="text-text-secondary space-y-1">
                  <li>• 浏览和搜索商品</li>
                  <li>• 加入购物车和下单</li>
                  <li>• 查看个人订单和地址</li>
                  <li>• 评价商品</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-warning" />
                  <span className="font-medium text-text-primary">管理员</span>
                </div>
                <ul className="text-text-secondary space-y-1">
                  <li>• 商品管理（增删改查）</li>
                  <li>• 订单处理和状态更新</li>
                  <li>• 库存管理</li>
                  <li>• 客服功能</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-4 h-4 text-success" />
                  <span className="font-medium text-text-primary">超级管理员</span>
                </div>
                <ul className="text-text-secondary space-y-1">
                  <li>• 完整的系统管理权限</li>
                  <li>• 用户角色管理</li>
                  <li>• 系统配置和设置</li>
                  <li>• 数据分析和报表</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}