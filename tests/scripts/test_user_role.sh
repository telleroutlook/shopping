#!/bin/bash
# 测试用户角色API

SUPABASE_URL="https://ojbbeonzbanvepugeoso.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYmJlb256YmFudmVwdWdlb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDE1NzUsImV4cCI6MjA3ODQxNzU3NX0.4nFRIK9DVbdsYNm4zfQVcwgRTGmO83n9Mc5KJreXo3Q"

# 登录获取token
echo "测试用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email":"qwzbngcq@minimax.com","password":"JNIvPndCNu"}')

echo "Login Response: $LOGIN_RESPONSE"

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "登录失败"
  exit 1
fi

echo "Access Token: ${ACCESS_TOKEN:0:50}..."

# 测试用户角色API
echo -e "\n测试用户角色API..."
curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/user-role" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  | jq .
