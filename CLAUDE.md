# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述
**AI Agent/LLM GitHub Trending** - 专注AI Agent和LLM领域的GitHub trending发现平台

### 当前项目状态
- **阶段**: 规划完成，准备开发
- **完成**: 技术架构设计、数据库设计、标签体系设计、开发计划制定
- **下一步**: Phase 1 基础架构开发

### 重要技术决策
- **技术栈**: Next.js 14 + TypeScript + PostgreSQL + Vercel + Neon
- **数据库**: 直接使用PostgreSQL (跳过SQLite过渡)
- **数据源**: GitHub REST API + 多关键词搜索策略
- **缓存**: Next.js内置缓存 + 应用层内存缓存 (暂不用Redis)
- **成本**: 免费层起步，扩展时$45/月

## Development Commands

### 项目初始化 (待实施)
```bash
# 创建Next.js项目
npx create-next-app@latest ai-agent-trending --typescript --tailwind --app

# 安装依赖
npm install @prisma/client prisma pg @types/pg @octokit/rest date-fns clsx lucide-react

# 数据库迁移
npx prisma migrate dev --name init

# 开发服务器
npm run dev

# 数据获取脚本
npm run fetch-data
```

### 核心命令
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 代码检查
- `npm run type-check` - TypeScript类型检查
- `npm run fetch-data` - 手动获取trending数据

## Architecture Overview

### 项目结构
```
ai-agent-trending/
├── src/app/           # Next.js App Router
├── src/components/    # React组件
├── src/lib/          # 工具库和API封装
├── prisma/           # 数据库Schema和迁移
├── scripts/          # 数据处理脚本
└── .github/workflows/ # CI/CD自动化
```

### 核心组件
- **GitHub API Service**: 数据获取和转换
- **AI Classifier**: 项目识别和标签分类
- **Database Layer**: PostgreSQL + Prisma ORM
- **Frontend Components**: 仿GitHub Trending界面

### 数据流
1. **数据获取**: GitHub REST API → 关键词搜索 → 数据标准化
2. **数据处理**: AI项目识别 → 自动标签分类 → 热度计算
3. **数据存储**: PostgreSQL (items, tags, data_sources表)
4. **数据展示**: 前端筛选 → 排序 → 分页展示

### 关键设计决策
- **多数据源架构**: 预留扩展接口支持Medium/ArXiv等
- **标签体系**: 15+预设AI/LLM标签，三大分类(Framework/Application/Technology)
- **渐进式部署**: 免费层验证 → 付费层扩展 → 自建服务器

## Development Guidelines

### 代码规范
- **TypeScript**: 严格类型检查，定义完整接口
- **组件设计**: 单一职责，可复用，props类型化
- **API设计**: RESTful风格，统一错误处理
- **数据库**: Prisma ORM，类型安全的查询

### AI项目识别逻辑
```typescript
// 关键词权重配置
const AI_KEYWORDS = {
  'langchain': { weight: 10, tags: ['framework', 'langchain'] },
  'llm': { weight: 8, tags: ['llm', 'ai'] },
  'ai-agent': { weight: 9, tags: ['agent-tools', 'ai'] }
};

// 项目相关性评分算法
function calculateRelevance(repo: GitHubRepo): number {
  // 基于标题、描述、README内容的关键词匹配
}
```

### 数据库模式
- **items表**: 统一存储不同数据源的内容
- **tags表**: 分层标签体系，支持父子关系
- **item_tags表**: 多对多关联，包含置信度
- **扩展性**: JSONB字段存储原始数据和元数据

### 部署策略
- **开发环境**: 本地PostgreSQL + Next.js dev
- **生产环境**: Vercel + Neon
- **自动化**: GitHub Actions每日定时任务
- **监控**: Vercel Analytics + 自定义错误日志

### 测试策略 (后期实施)
- **单元测试**: 关键算法和工具函数
- **集成测试**: API端点和数据库操作
- **E2E测试**: 用户关键流程

## 上下文恢复指南

当重新进入项目时，Claude Code应该：

1. **读取PROJECT_PLAN.md** - 了解完整项目规划
2. **检查当前开发阶段** - 根据文件结构判断进度
3. **查看最新git提交** - 了解最近的开发活动
4. **确认技术栈版本** - 检查package.json依赖

### 重要文件位置
- `PROJECT_PLAN.md` - 完整项目计划和架构设计
- `prisma/schema.prisma` - 数据库模型定义
- `src/lib/github-api.ts` - GitHub API封装
- `src/lib/classifiers.ts` - AI项目分类逻辑
- `.github/workflows/daily-update.yml` - 自动化任务

### 当前待办任务
见PROJECT_PLAN.md中的"TODO清单和里程碑"部分

---
**最后更新**: 2025-09-11  
**项目状态**: 规划完成，等待Phase 1开发启动
