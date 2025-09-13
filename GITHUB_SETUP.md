# 🚀 GitHub 部署配置指南

## 📋 快速开始

你的GitHub仓库：**https://github.com/jackley-dev/ai-trending-platform**

## 🔑 第一步：配置 GitHub Secrets

**重要**：GitHub Actions 需要以下 Secrets 才能正常工作。

### 访问设置页面
1. 打开：https://github.com/jackley-dev/ai-trending-platform/settings/secrets/actions
2. 点击 "New repository secret"

### 需要添加的 Secrets

| Secret 名称 | 值 | 获取方法 |
|------------|---|---------|
| `DATABASE_URL` | `postgresql://...` | 见下方数据库设置 |
| `GITHUB_TOKEN` | `ghp_xxxxxxxxxxxx` | 你的现有token或创建新token |
| `NEXTAUTH_SECRET` | `随机字符串` | 生成随机密钥 |

## 🗄️ 第二步：设置生产数据库

### 推荐：Railway (免费 + 简单)

1. **注册 Railway**
   - 访问：https://railway.app
   - 用GitHub账号登录

2. **创建数据库**
   - 点击 "New Project"
   - 选择 "Provision PostgreSQL"
   - 等待部署完成

3. **获取连接URL**
   - 点击数据库服务
   - 进入 "Connect" 标签
   - 复制 "Postgres Connection URL"
   - 格式类似：`postgresql://postgres:password@viaduct.proxy.rlwy.net:12345/railway`

### 其他免费选项
- **Neon**: https://neon.tech (PostgreSQL)
- **Supabase**: https://supabase.com (PostgreSQL)
- **PlanetScale**: https://planetscale.com (MySQL)

## 🔐 第三步：GitHub Token 设置

如果需要新的token：

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 设置名称：`AI Trending Platform`
4. 选择权限：
   - ✅ `public_repo`
   - ✅ `read:user`
5. 点击 "Generate token"
6. **立即复制** token（只显示一次）

## 🚀 第四步：Vercel 部署

### 自动部署选项（推荐）
1. 访问：https://vercel.com/import/git
2. 选择 `jackley-dev/ai-trending-platform`
3. 配置环境变量：
   ```
   DATABASE_URL = 你的Railway数据库URL
   GITHUB_TOKEN = 你的GitHub Token
   NEXTAUTH_SECRET = 随机字符串32位以上
   NEXT_PUBLIC_APP_URL = https://你的项目名.vercel.app
   ```
4. 点击 "Deploy"

### 手动部署选项
1. Fork 这个仓库到你的账号
2. 在Vercel导入你fork的仓库
3. 按上述步骤配置环境变量

## ✅ 验证部署成功

### 检查清单
- [ ] GitHub Secrets 已配置 (3个)
- [ ] 数据库连接成功
- [ ] Vercel 部署完成
- [ ] 网站可以正常访问
- [ ] GitHub Actions 可以手动触发

### 测试GitHub Actions
1. 访问：https://github.com/jackley-dev/ai-trending-platform/actions
2. 选择 "Daily Data Sync"
3. 点击 "Run workflow" 手动测试
4. 等待执行完成，检查是否成功

## 🎉 完成！

部署成功后：
- ✅ 网站每天自动更新AI项目数据
- ✅ 三分类智能标签系统工作正常  
- ✅ 按最新发布时间默认排序
- ✅ 响应式设计适配各种设备

## 🆘 遇到问题？

### 常见错误处理

1. **GitHub Actions 失败**
   - 检查Secrets拼写是否正确
   - 确认数据库URL可连接
   - 验证GitHub Token权限

2. **数据库连接错误**
   - 确认DATABASE_URL格式正确
   - 检查数据库服务是否正常
   - 尝试在Railway控制台测试连接

3. **部署失败**
   - 检查所有环境变量是否设置
   - 确认Node.js版本兼容（18+）
   - 查看Vercel部署日志

需要帮助请在GitHub仓库创建Issue！