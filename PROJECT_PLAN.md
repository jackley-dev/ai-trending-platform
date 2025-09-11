# AI Agent/LLM GitHub Trending 项目完整计划

## 🎯 项目目标
创建一个专门聚焦AI Agent/LLM领域的GitHub trending平台，为开发者提供精准的AI相关项目发现和追踪服务。

## 🏗️ 技术架构

### 核心技术栈
- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes + Prisma ORM
- **数据库**: PostgreSQL (直接使用，不走SQLite过渡)
- **部署**: Vercel + Supabase (免费层起步，$0成本验证)
- **定时任务**: GitHub Actions (每日数据更新)
- **缓存策略**: Next.js内置缓存 + 应用层内存缓存 (暂不用Redis)

### 数据获取策略
- **主方案**: GitHub REST API + 多关键词搜索
- **备份方案**: 非官方GitHub Trending API (如需要)
- **数据源**: 预留多源扩展接口(Medium/ArXiv/公司博客等)

### 成本分析结论
- **第一阶段** (0-3个月): $0/月 (免费层)
- **第二阶段** (3-12个月): $45/月 (Pro版本)
- **对比传统云**: 节省运维成本$300-600/月

## 📊 数据库设计 (PostgreSQL)

### 核心表结构
```sql
-- 1. 数据源管理表
CREATE TABLE data_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  base_url VARCHAR(255),
  api_config JSONB,
  update_frequency_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 项目/内容主表
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES data_sources(id),
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  url VARCHAR(1000) NOT NULL,
  author_name VARCHAR(255),
  popularity_score INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  primary_category VARCHAR(100),
  content_type VARCHAR(50) NOT NULL,
  published_at TIMESTAMP NOT NULL,
  trending_date DATE,
  raw_data JSONB,
  processed_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_id, external_id)
);

-- 3. 标签体系
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  parent_id INTEGER REFERENCES tags(id),
  display_name VARCHAR(150),
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 项目标签关联
CREATE TABLE item_tags (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  confidence DECIMAL(3,2) DEFAULT 1.0,
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, tag_id)
);

-- 5. 任务调度表
CREATE TABLE processing_jobs (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES data_sources(id),
  job_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  items_processed INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 关键索引
```sql
CREATE INDEX idx_items_source_trending ON items(source_id, trending_date DESC);
CREATE INDEX idx_items_popularity ON items(popularity_score DESC);
CREATE INDEX idx_items_published ON items(published_at DESC);
CREATE INDEX idx_items_category ON items(primary_category);
CREATE INDEX idx_item_tags_item ON item_tags(item_id);
CREATE INDEX idx_item_tags_tag ON item_tags(tag_id);
```

## 🏷️ AI/LLM标签体系 (15+预设标签)

### Framework标签 (框架类)
- `langchain` - LangChain框架
- `llamaindex` - LlamaIndex数据框架  
- `autogen` - AutoGen多Agent对话
- `crewai` - CrewAI Agent协作平台
- `langgraph` - LangGraph工作流编排
- `transformers` - HuggingFace模型库

### Application标签 (应用类)
- `code-generation` - AI代码生成工具
- `chatbot` - 对话系统和聊天机器人
- `rag` - 检索增强生成系统
- `agent-tools` - AI智能体工具集
- `content-generation` - AI内容创作工具
- `data-analysis` - AI数据分析工具

### Technology标签 (技术类)
- `openai-api` - OpenAI API集成
- `huggingface` - HuggingFace模型和工具
- `vector-database` - 向量存储和检索
- `fine-tuning` - LLM模型微调
- `prompt-engineering` - Prompt优化技术

## 🚀 开发计划 (预计9-12天)

### Phase 1: 基础架构 (3-4天)
**第1天**:
- [ ] Next.js 14项目初始化
- [ ] TypeScript + Tailwind CSS配置
- [ ] Supabase PostgreSQL数据库创建

**第2天**:
- [ ] Prisma ORM配置
- [ ] 数据库Schema实施
- [ ] 基础CRUD操作封装

**第3天**:
- [ ] GitHub REST API集成
- [ ] Octokit客户端配置
- [ ] 数据获取和转换逻辑

**第4天**:
- [ ] 关键词搜索算法实现
- [ ] 数据去重和标准化
- [ ] 基础错误处理

### Phase 2: 核心功能 (4-5天)
**第5天**:
- [ ] AI项目识别逻辑
- [ ] 标签自动分类算法
- [ ] 热度分数计算

**第6天**:
- [ ] 前端基础布局
- [ ] 仿GitHub Trending样式
- [ ] 响应式设计实现

**第7天**:
- [ ] 项目列表组件
- [ ] 标签筛选功能
- [ ] 排序控件 (热度/时间)

**第8-9天**:
- [ ] 分页功能
- [ ] 搜索功能
- [ ] 用户体验优化

### Phase 3: 自动化部署 (2-3天)
**第10天**:
- [ ] Vercel部署配置
- [ ] 环境变量管理
- [ ] 生产环境测试

**第11天**:
- [ ] GitHub Actions工作流
- [ ] 定时数据更新任务
- [ ] 错误监控配置

**第12天**:
- [ ] 性能优化
- [ ] SEO配置
- [ ] 最终测试和发布

## 📁 项目结构
```
ai-agent-trending/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 主页面
│   │   ├── api/               # API路由
│   │   │   ├── items/         # 项目相关API
│   │   │   ├── tags/          # 标签相关API
│   │   │   └── sync/          # 数据同步API
│   │   └── globals.css        # 全局样式
│   ├── components/            # React组件
│   │   ├── TrendingList.tsx   # 项目列表
│   │   ├── FilterTags.tsx     # 标签筛选
│   │   ├── SortControls.tsx   # 排序控件
│   │   └── ItemCard.tsx       # 项目卡片
│   ├── lib/                   # 工具库
│   │   ├── github-api.ts      # GitHub API封装
│   │   ├── database.ts        # 数据库操作
│   │   ├── classifiers.ts     # AI项目分类器
│   │   ├── types.ts           # TypeScript类型
│   │   └── utils.ts           # 工具函数
│   └── styles/               # 样式文件
├── prisma/                   # 数据库Schema
│   ├── schema.prisma         # 数据模型定义
│   └── migrations/           # 数据库迁移
├── scripts/                  # 脚本文件
│   └── fetch-trending.ts     # 数据获取脚本
├── .github/workflows/        # GitHub Actions
│   └── daily-update.yml      # 每日更新工作流
└── docs/                     # 文档
    ├── api.md               # API文档
    └── deployment.md        # 部署指南
```

## 🔧 核心算法设计

### GitHub数据获取策略
```typescript
class GitHubTrendingService {
  async fetchTrendingData() {
    // 1. 基础trending (通过搜索模拟)
    const generalTrending = await this.searchByDate();
    
    // 2. AI相关关键词搜索
    const aiTrending = await this.searchByKeywords([
      'langchain', 'llm', 'ai-agent', 'chatgpt',
      'openai', 'anthropic', 'huggingface'
    ]);
    
    // 3. 特定topic搜索
    const topicTrending = await this.searchByTopics([
      'artificial-intelligence', 'machine-learning',
      'natural-language-processing', 'chatbot'
    ]);
    
    // 4. 合并去重
    return this.mergeTrendingData([
      generalTrending, aiTrending, topicTrending
    ]);
  }
}
```

### AI项目分类算法
```typescript
interface ItemClassifier {
  classifyContent(item: StandardItem): Promise<Classification>;
  extractTags(item: StandardItem): Promise<TagMatch[]>;
  calculateRelevance(item: StandardItem): number;
}

// 关键词权重配置
const AI_KEYWORDS = {
  'langchain': { weight: 10, tags: ['framework', 'langchain'] },
  'llm': { weight: 8, tags: ['llm', 'ai'] },
  'ai-agent': { weight: 9, tags: ['agent-tools', 'ai'] },
  'chatbot': { weight: 7, tags: ['chatbot', 'application'] },
  'openai': { weight: 8, tags: ['openai-api', 'technology'] }
};
```

## 📊 预期效果和指标

### 数据指标
- **日筛选项目**: 30-80个AI/LLM相关项目
- **标签准确率**: >85%
- **数据更新延迟**: <24小时
- **页面响应时间**: <2秒
- **首次加载时间**: <3秒

### 用户价值
- 🎯 **精准发现**: 专注AI领域，减少信息噪音
- ⏰ **时效性强**: 每日更新，紧跟技术趋势
- 🏷️ **分类清晰**: 多维标签，便于精准筛选
- 📱 **体验优秀**: 响应式设计，移动端友好

## 🔄 版本迭代规划

### V1.0 - MVP版本 (1-2周)
- [x] GitHub数据抓取和展示
- [x] 基础AI项目识别
- [x] 标签筛选和排序
- [x] 每日自动更新

### V1.1 - 功能增强 (2-3周)
- [ ] 全文搜索功能
- [ ] 用户收藏和订阅
- [ ] 项目详情页面
- [ ] 趋势分析图表

### V2.0 - 多源集成 (1-2个月)
- [ ] Medium博客集成
- [ ] ArXiv论文集成
- [ ] 公司技术博客集成
- [ ] Twitter/X趋势集成

### V2.1 - 智能化 (2-3个月)
- [ ] AI内容摘要
- [ ] 个性化推荐
- [ ] 智能分类优化
- [ ] 用户行为分析

## 🎨 设计规范

### UI风格
- 参考GitHub Trending页面设计
- 简洁现代的卡片式布局
- 一致的颜色系统和字体
- 良好的对比度和可访问性

### 响应式设计
- 移动端优先的设计理念
- 断点: sm(640px), md(768px), lg(1024px), xl(1280px)
- 灵活的网格系统
- 触摸友好的交互元素

## 🚨 风险评估和应对

### 技术风险
- **GitHub API限制**: 实施速率限制处理和缓存策略
- **数据质量**: 多重验证和人工审核机制
- **性能问题**: 数据库索引优化和分页加载

### 业务风险
- **用户接受度**: MVP快速验证和迭代
- **竞争对手**: 差异化定位和独特价值
- **成本控制**: 分阶段投入和监控

## 📋 TODO清单和里程碑

### 即将开始的任务
- [ ] 创建Next.js项目骨架
- [ ] 配置开发环境
- [ ] 设计数据库Schema
- [ ] 实现GitHub API集成

### 关键里程碑
- **Week 1**: 基础架构完成，可以获取和存储GitHub数据
- **Week 2**: 前端界面完成，支持基础筛选和排序
- **Week 3**: 自动化部署完成，上线MVP版本
- **Week 4**: 用户反馈收集和第一次迭代

---

**项目负责人**: AI Assistant  
**文档创建时间**: 2025-09-11  
**最后更新时间**: 2025-09-11  
**当前状态**: 规划完成，等待开发启动