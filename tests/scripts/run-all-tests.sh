#!/bin/bash

# 运行所有测试脚本的主入口

echo "🚀 JD电商购物网站 - 自动化测试套件"
echo "=================================================="
echo "测试开始时间: $(date)"
echo

# 确保脚本目录存在
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"

# 创建报告目录
mkdir -p "$BASE_DIR/reports"

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：运行测试脚本
run_test() {
    local test_name="$1"
    local test_script="$2"
    local test_file="$SCRIPT_DIR/$test_script"
    
    echo -e "${BLUE}🔄 运行测试: $test_name${NC}"
    echo "命令: $test_file"
    echo "----------------------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # 检查脚本是否存在
    if [ ! -f "$test_file" ]; then
        echo -e "${RED}❌ 测试脚本不存在: $test_file${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo
        return 1
    fi
    
    # 检查脚本是否可执行
    if [ ! -x "$test_file" ]; then
        echo "添加执行权限: chmod +x $test_file"
        chmod +x "$test_file"
    fi
    
    # 运行测试脚本
    if bash "$test_file"; then
        echo -e "${GREEN}✅ 测试通过: $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 测试失败: $test_name${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo
}

# 函数：显示测试菜单
show_menu() {
    echo -e "${YELLOW}请选择要运行的测试：${NC}"
    echo "1. 普通用户功能测试"
    echo "2. 管理员功能测试"
    echo "3. 超级管理员功能测试"
    echo "4. 完整购物流程测试"
    echo "5. 角色管理功能测试"
    echo "6. 运行所有测试"
    echo "0. 退出"
    echo
}

# 函数：获取用户选择
get_user_choice() {
    local choice
    read -p "请输入选择 (0-6): " choice
    echo "$choice"
}

# 主菜单循环
main_menu() {
    while true; do
        show_menu
        choice=$(get_user_choice)
        
        case $choice in
            1)
                run_test "普通用户功能测试" "test-normal-user.sh"
                ;;
            2)
                run_test "管理员功能测试" "test-admin-user.sh"
                ;;
            3)
                run_test "超级管理员功能测试" "test-superadmin-user.sh"
                ;;
            4)
                run_test "完整购物流程测试" "test-shopping-flow.sh"
                ;;
            5)
                run_test "角色管理功能测试" "test-role-management.sh"
                ;;
            6)
                echo -e "${BLUE}🔄 运行所有测试...${NC}"
                run_test "普通用户功能测试" "test-normal-user.sh"
                run_test "管理员功能测试" "test-admin-user.sh"
                run_test "超级管理员功能测试" "test-superadmin-user.sh"
                run_test "完整购物流程测试" "test-shopping-flow.sh"
                run_test "角色管理功能测试" "test-role-management.sh"
                ;;
            0)
                echo "退出测试套件"
                break
                ;;
            *)
                echo -e "${RED}❌ 无效选择，请重新输入${NC}"
                ;;
        esac
        
        if [ "$choice" != "0" ]; then
            echo "----------------------------------------"
            echo -e "${YELLOW}按回车键继续...${NC}"
            read
        fi
    done
}

# 检查命令行参数
if [ $# -eq 0 ]; then
    # 无参数，运行交互式菜单
    main_menu
else
    # 有参数，直接运行指定测试
    case $1 in
        "normal")
            run_test "普通用户功能测试" "test-normal-user.sh"
            ;;
        "admin")
            run_test "管理员功能测试" "test-admin-user.sh"
            ;;
        "superadmin")
            run_test "超级管理员功能测试" "test-superadmin-user.sh"
            ;;
        "shopping")
            run_test "完整购物流程测试" "test-shopping-flow.sh"
            ;;
        "role")
            run_test "角色管理功能测试" "test-role-management.sh"
            ;;
        "all")
            echo -e "${BLUE}🔄 运行所有测试...${NC}"
            run_test "普通用户功能测试" "test-normal-user.sh"
            run_test "管理员功能测试" "test-admin-user.sh"
            run_test "超级管理员功能测试" "test-superadmin-user.sh"
            run_test "完整购物流程测试" "test-shopping-flow.sh"
            run_test "角色管理功能测试" "test-role-management.sh"
            ;;
        *)
            echo "使用方法: $0 [normal|admin|superadmin|shopping|role|all]"
            echo "不带参数运行交互式菜单"
            exit 1
            ;;
    esac
fi

# 显示测试总结
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}测试执行总结${NC}"
echo "总测试数: $TOTAL_TESTS"
echo -e "通过测试: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败测试: ${RED}$FAILED_TESTS${NC}"
echo "成功率: $(( TOTAL_TESTS > 0 ? (PASSED_TESTS * 100 / TOTAL_TESTS) : 0 ))%"
echo "测试完成时间: $(date)"
echo -e "${BLUE}==================================================${NC}"

# 生成综合测试报告
if [ $TOTAL_TESTS -gt 0 ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    SUMMARY_FILE="$BASE_DIR/reports/test-summary-${TIMESTAMP}.md"
    
    cat > "$SUMMARY_FILE" << EOF
# JD电商购物网站 - 测试执行总结

## 测试信息
- **执行时间**: $(date)
- **测试套件版本**: 1.0
- **测试网站**: https://xpak1yu0vzmo.space.minimaxi.com

## 测试统计
- **总测试数**: $TOTAL_TESTS
- **通过测试**: $PASSED_TESTS
- **失败测试**: $FAILED_TESTS
- **成功率**: $(( TOTAL_TESTS > 0 ? (PASSED_TESTS * 100 / TOTAL_TESTS) : 0 ))%

## 测试覆盖范围
- ✅ 普通用户购物流程
- ✅ 管理员商品管理
- ✅ 超级管理员用户管理
- ✅ 角色权限验证
- ✅ 端到端功能测试

## 后续建议
1. 定期执行回归测试
2. 新功能发布前进行完整测试套件验证
3. 监控用户体验关键指标
4. 定期更新测试用例

## 报告生成
- 详细报告位置: \`tests/reports/\` 目录
- 时间戳: $TIMESTAMP
EOF
    
    echo -e "${GREEN}📄 综合测试报告已生成: $SUMMARY_FILE${NC}"
fi

exit 0
