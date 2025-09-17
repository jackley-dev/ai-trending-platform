# 🚀 部署指南

## 环境要求

- Node.js 18+
- PostgreSQL 数据库
- GitHub Personal Access Token

## 本地开发环境搭建

### 1. 克隆项目
```bash
git clone <repository-url>
cd ai-agent-trending
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境变量配置
复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

必需的环境变量：
- `DATABASE_URL`: PostgreSQL连接字符串
- `GITHUB_TOKEN`: GitHub Personal Access Token (需要 `public_repo` 权限)
- `NEXTAUTH_SECRET`: 随机生成的密钥
- `NEXT_PUBLIC_APP_URL`: 应用URL

### 4. 数据库初始化
```bash
# 运行数据库迁移
npx prisma migrate dev

# 生成Prisma客户端
npx prisma generate

# 初始化种子数据
npx prisma db seed

# 创建示例数据用于测试
tsx scripts/create-sample-data.ts
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 生产环境部署

### Vercel 部署

1. **准备Neon数据库**
   - 注册 [Neon](https://neon.tech)
   - 创建新项目与分支
   - 在 `Connection Details` 中复制 PostgreSQL 连接字符串

2. **配置Vercel**
   - Fork 此项目到GitHub
   - 在 [Vercel](https://vercel.com) 导入项目
   - 配置环境变量：
     - `DATABASE_URL`: Neon PostgreSQL URL
     - `GITHUB_TOKEN`: GitHub Personal Access Token
     - `NEXTAUTH_SECRET`: 随机密钥
     - `NEXT_PUBLIC_APP_URL`: Vercel部署URL

3. **数据库初始化**
   ```bash
   # 在Vercel项目设置中运行一次性命令
   npx prisma db push
   npx prisma db seed
   ```

4. **设置GitHub Actions Secrets**
   在GitHub仓库设置中添加：
   - `VERCEL_TOKEN`: Vercel API Token
   - `VERCEL_ORG_ID`: Vercel Organization ID
   - `VERCEL_PROJECT_ID`: Vercel Project ID
   - `DATABASE_URL`: Neon PostgreSQL URL
   - `GITHUB_TOKEN`: GitHub Token用于数据同步

### 自定义服务器部署

1. **服务器要求**
   - Ubuntu 20.04+
   - Node.js 18+
   - PostgreSQL 13+
   - PM2 (进程管理)

2. **部署步骤**
   ```bash
   # 1. 克隆代码
   git clone <repository-url>
   cd ai-agent-trending
   
   # 2. 安装依赖
   npm ci --production
   
   # 3. 构建项目
   npm run build
   
   # 4. 配置环境变量
   cp .env.example .env.production
   # 编辑 .env.production
   
   # 5. 数据库初始化
   npx prisma migrate deploy
   npx prisma db seed
   
   # 6. 启动应用
   pm2 start ecosystem.config.js --env production
   ```

3. **Nginx配置示例**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 数据同步设置

### 自动数据同步
项目包含GitHub Actions工作流，自动在以下情况触发数据同步：
- 每天UTC 02:00 (北京时间10:00)
- 手动触发

### 手动数据同步
```bash
npm run fetch-data
```

可选参数：
- `--dry-run`: 试运行模式，不保存数据
- `--timespan daily|weekly|monthly`: 指定时间范围
- `--limit N`: 限制获取项目数量

## 监控和维护

### 日志查看
```bash
# 生产环境日志
pm2 logs ai-agent-trending

# Vercel日志
vercel logs
```

### 数据库维护
```bash
# 查看数据库状态
npx prisma studio

# 重置数据库
npx prisma migrate reset
```

### 性能监控
- 使用Vercel Analytics监控性能
- 监控数据库连接池使用情况
- 关注GitHub API rate limit使用

## 故障排查

### 常见问题

1. **GitHub API Rate Limit**
   - 解决：使用有效的GitHub Token
   - 检查：Token权限和剩余配额

2. **数据库连接失败**
   - 检查：DATABASE_URL格式
   - 验证：数据库服务器可达性

3. **构建失败**
   - 检查：Node.js版本兼容性
   - 验证：所有环境变量设置

4. **数据同步失败**
   - 查看：GitHub Actions日志
   - 检查：API权限和网络连接

## 开发工具

### 有用的命令
```bash
# 开发模式
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 数据同步
npm run fetch-data

# 测试
npm run test
```

### 数据库管理
```bash
# 查看数据库
npx prisma studio

# 创建迁移
npx prisma migrate dev --name <name>

# 重置数据库
npx prisma migrate reset
```
