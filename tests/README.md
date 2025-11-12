# 测试脚本说明

## 目录结构

```
tests/
├── scripts/          # 可执行测试脚本
├── reports/          # 测试报告输出目录
├── user-roles/       # 用户权限测试配置
└── README.md         # 本文档
```

## 测试类型

### 1. 用户权限测试
- `scripts/test-normal-user.sh` - 普通用户功能测试
- `scripts/test-admin-user.sh` - 管理员功能测试  
- `scripts/test-superadmin-user.sh` - 超级管理员功能测试

### 2. 功能模块测试
- `scripts/test-shopping-flow.sh` - 完整购物流程测试
- `scripts/test-role-management.sh` - 角色管理功能测试

## 使用方法

### 运行单用户权限测试
```bash
# 测试普通用户
./tests/scripts/test-normal-user.sh

# 测试管理员
./tests/scripts/test-admin-user.sh

# 测试超级管理员
./tests/scripts/test-superadmin-user.sh
```

### 运行完整测试套件
```bash
# 运行所有测试
./tests/scripts/run-all-tests.sh
```

## 测试账户信息

详细的测试账户信息请参考项目根目录的 `README.md` 文件。

## 环境要求

- 测试网站：https://xpak1yu0vzmo.space.minimaxi.com
- 浏览器：Chrome/Firefox/Safari
- 网络：稳定的互联网连接
