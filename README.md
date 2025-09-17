# AI Agent/LLM GitHub Trending

> 🤖 专注AI Agent和LLM领域的GitHub trending发现平台

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://ai-trending-platform.vercel.app)

🌐 **Live Demo**: [https://ai-trending-platform.vercel.app](https://ai-trending-platform.vercel.app)

## ✨ 项目特色

- 🎯 **精准筛选**: 专注AI Agent/LLM相关项目，减少信息噪音
- 🏷️ **智能分类**: 15+预设标签，覆盖Framework/Application/Technology三大类
- ⏰ **实时更新**: 每日自动抓取最新trending项目
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🚀 **高性能**: Next.js + PostgreSQL + Vercel优化部署

## 🎨 界面预览

*界面设计参考GitHub Trending，提供熟悉的用户体验*

## 🚀 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 13+
- GitHub Token (用于API访问)

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/ai-agent-trending.git
cd ai-agent-trending

# 2. 安装依赖
npm install

# 3. 环境配置
cp .env.example .env.local
# 编辑 .env.local 填入必要配置

# 4. 数据库初始化
npx prisma migrate dev --name init
npx prisma db seed

# 5. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用

### 环境变量配置

```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/ai_trending"
GITHUB_TOKEN="your_github_personal_access_token"
NEXTAUTH_SECRET="your_nextauth_secret"
```

## 📊 功能特性

### 核心功能

- ✅ **智能项目发现**: 基于关键词和描述的AI项目识别
- ✅ **多维度筛选**: 按标签、时间范围、热度等筛选
- ✅ **双重排序**: 支持按星数增长和发布时间排序  
- ✅ **自动化更新**: GitHub Actions定时抓取最新数据
- ✅ **移动端优化**: 响应式设计，触摸友好

### 标签体系

**Framework框架类**
- `langchain` `llamaindex` `autogen` `crewai` `langgraph` `transformers`

**Application应用类**  
- `code-generation` `chatbot` `rag` `agent-tools` `content-generation` `data-analysis`

**Technology技术类**
- `openai-api` `huggingface` `vector-database` `fine-tuning` `prompt-engineering`

## 🏗️ 技术架构

### 技术栈

| 类别 | 技术选择 | 说明 |
|------|----------|------|
| **前端框架** | Next.js 14 | App Router + Server Components |
| **类型系统** | TypeScript 5 | 严格类型检查 |
| **样式方案** | Tailwind CSS 3 | 原子化CSS，快速开发 |
| **数据库** | PostgreSQL + Prisma | 关系型数据库 + 类型安全ORM |
| **数据源** | GitHub REST API | 官方API，稳定可靠 |
| **部署平台** | Vercel + Neon | Serverless部署，全球CDN |
| **自动化** | GitHub Actions | 定时任务和CI/CD |

### 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub API    │───▶│  Data Service   │───▶│   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │◄───│   Next.js API   │◄───│  AI Classifier  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 数据模型

```sql
-- 核心数据表
items          # 项目信息主表
tags           # 标签定义表  
item_tags      # 项目标签关联表
data_sources   # 数据源配置表
processing_jobs # 任务调度表
```

## 📁 项目结构

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 主页
│   │   ├── api/               # API路由
│   │   └── globals.css        # 全局样式
│   ├── components/            # React组件
│   │   ├── TrendingList.tsx   # 项目列表
│   │   ├── FilterTags.tsx     # 筛选标签
│   │   └── ItemCard.tsx       # 项目卡片
│   └── lib/                   # 工具库
│       ├── github-api.ts      # GitHub API封装
│       ├── database.ts        # 数据库操作
│       └── classifiers.ts     # AI项目分类器
├── prisma/                    # 数据库Schema
├── scripts/                   # 数据处理脚本
└── .github/workflows/         # GitHub Actions
```

## 🔧 开发指南

### 添加新的数据源

1. 实现 `DataSourceAdapter` 接口
2. 注册到 `data_sources` 表
3. 更新分类器逻辑
4. 添加相应的定时任务

### 扩展标签体系

1. 在数据库中添加新标签
2. 更新关键词权重配置
3. 调整分类算法逻辑
4. 更新前端筛选器

### API端点

```typescript
GET  /api/items              # 获取项目列表
GET  /api/items/[id]         # 获取项目详情
GET  /api/tags               # 获取所有标签
POST /api/sync               # 手动触发数据同步
```

## 📈 数据统计

- 🎯 **日筛选量**: 30-80个AI/LLM相关项目
- 📊 **标签准确率**: >85%
- ⚡ **响应时间**: <2秒
- 🔄 **更新频率**: 每日自动更新

## 🚀 部署指南

### Vercel + Neon (推荐)

1. **创建Neon项目**
   ```bash
   # 获取数据库连接字符串
   DATABASE_URL="postgresql://..."
   ```

2. **部署到Vercel**
   ```bash
   # 连接GitHub仓库，自动部署
   vercel --prod
   ```

3. **配置环境变量**
   - 在Vercel Dashboard中添加环境变量
   - 包括 `DATABASE_URL`（Neon连接串）, `GITHUB_TOKEN` 等

4. **设置定时任务**
   - GitHub Actions会自动触发数据更新
   - 或使用Vercel Cron Jobs

### 自建服务器

详见 `docs/deployment.md` 部署文档

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork项目到你的GitHub
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

### 开发规范

- 使用TypeScript严格模式
- 遵循Prettier代码格式化
- 提交前运行 `npm run lint` 和 `npm run type-check`
- 为新功能添加测试用例

## 📋 开发路线图

### V1.0 - MVP版本 ✅ 
- [x] GitHub数据抓取
- [x] AI项目识别和分类
- [x] 基础筛选排序功能
- [x] 响应式界面设计

### V1.1 - 功能增强 🚧
- [ ] 全文搜索功能
- [ ] 用户收藏和订阅
- [ ] 项目详情页面
- [ ] 数据可视化图表

### V2.0 - 多源集成 📋
- [ ] Medium博客集成
- [ ] ArXiv论文数据
- [ ] 公司技术博客
- [ ] 社交媒体趋势

## 📄 许可证

[MIT License](LICENSE) - 查看 `LICENSE` 文件了解详情

## 🙏 致谢

- [GitHub API](https://docs.github.com/en/rest) - 提供数据源支持
- [Next.js](https://nextjs.org/) - 优秀的React框架
- [Tailwind CSS](https://tailwindcss.com/) - 高效的CSS框架
- [Prisma](https://www.prisma.io/) - 现代化数据库工具链

---

**⭐ 如果这个项目对你有帮助，请给它一个Star！**

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/ai-agent-trending&type=Date)](https://star-history.com/#yourusername/ai-agent-trending&Date)
