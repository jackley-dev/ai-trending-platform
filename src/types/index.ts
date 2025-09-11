// 数据源类型
export interface DataSource {
  id: number;
  name: string;
  type: 'repository' | 'blog' | 'paper' | 'news';
  displayName: string;
  baseUrl?: string;
  apiConfig?: Record<string, any>;
  updateFrequencyHours: number;
  isActive: boolean;
  createdAt: Date;
  lastUpdated?: Date;
}

// 项目/内容主类型
export interface Item {
  id: number;
  sourceId: number;
  externalId: string;
  title: string;
  description?: string;
  url: string;
  authorName?: string;
  authorUrl?: string;
  popularityScore: number;
  metrics: Record<string, any>;
  primaryCategory?: string;
  contentType: 'repository' | 'article' | 'paper' | 'tutorial';
  publishedAt: Date;
  lastUpdated: Date;
  trendingDate?: Date;
  rawData?: Record<string, any>;
  processedMetadata: Record<string, any>;
  createdAt: Date;
  
  // 关联数据
  source?: DataSource;
  tags?: ItemTag[];
}

// 标签类型
export interface Tag {
  id: number;
  name: string;
  slug: string;
  category: 'framework' | 'application' | 'technology' | 'industry';
  parentId?: number;
  displayName?: string;
  description?: string;
  color: string;
  icon?: string;
  sortOrder: number;
  isFeatured: boolean;
  createdAt: Date;
  
  // 关联数据
  parent?: Tag;
  children?: Tag[];
  items?: ItemTag[];
}

// 项目标签关联类型
export interface ItemTag {
  id: number;
  itemId: number;
  tagId: number;
  confidence: number;
  source: 'auto' | 'manual' | 'ai';
  createdAt: Date;
  
  // 关联数据
  item?: Item;
  tag?: Tag;
}

// 任务调度类型
export interface ProcessingJob {
  id: number;
  sourceId: number;
  jobType: 'fetch' | 'classify' | 'update_metrics' | 'cleanup';
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  itemsProcessed: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

// GitHub API 相关类型
export interface GitHubRepo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description?: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  clone_url: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language?: string;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license?: {
    key: string;
    name: string;
    url?: string;
  };
  topics: string[];
  default_branch: string;
}

// 标准化项目类型 (用于适配器模式)
export interface StandardItem {
  title: string;
  description: string;
  url: string;
  author: {
    name: string;
    url?: string;
    avatarUrl?: string;
  };
  publishedAt: Date;
  metrics: {
    primary: number;    // 主要指标 (stars, views, likes)
    secondary?: number; // 次要指标 (forks, comments, shares)
    engagement?: number; // 互动指标
  };
  categories: string[];
  language?: string;
  license?: string;
  topics?: string[];
}

// 数据源适配器接口
export interface DataSourceAdapter {
  readonly name: string;
  readonly type: 'repository' | 'blog' | 'paper' | 'news';
  
  // 数据获取
  fetchLatest(config: any): Promise<RawItem[]>;
  fetchTrending(timespan: 'daily' | 'weekly' | 'monthly'): Promise<RawItem[]>;
  
  // 数据转换
  transform(rawItem: any): StandardItem;
  extractTags(item: StandardItem): Promise<TagMatch[]>;
  calculatePopularity(metrics: any): number;
  
  // 验证
  validateConfig(config: any): boolean;
  testConnection(): Promise<boolean>;
}

// 原始项目数据类型
export interface RawItem {
  source: string;
  data: any; // 原始API响应数据
}

// 标签匹配类型
export interface TagMatch {
  tagName: string;
  confidence: number;
  source: 'keyword' | 'description' | 'ai' | 'manual';
  reasoning?: string;
}

// 分类结果类型
export interface Classification {
  primaryCategory: string;
  confidence: number;
  suggestedTags: TagMatch[];
  isRelevant: boolean;
  relevanceScore: number;
  reasoning?: string;
}

// 项目分类器接口
export interface ItemClassifier {
  classifyContent(item: StandardItem): Promise<Classification>;
  extractTags(item: StandardItem): Promise<TagMatch[]>;
  calculateRelevance(item: StandardItem): number;
}

// 筛选和排序类型
export interface TrendingFilters {
  tags?: string[];
  categories?: string[];
  timespan?: 'daily' | 'weekly' | 'monthly';
  minPopularity?: number;
  language?: string;
  sortBy?: 'popularity' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// 分页结果类型
export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// 统计信息类型
export interface TrendingStats {
  totalItems: number;
  todayItems: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
  languageDistribution: Array<{
    language: string;
    count: number;
  }>;
}

// AI关键词权重配置
export interface KeywordConfig {
  [keyword: string]: {
    weight: number;
    tags: string[];
    category?: string;
  };
}

// 环境变量类型
export interface EnvConfig {
  DATABASE_URL: string;
  GITHUB_TOKEN: string;
  NEXTAUTH_SECRET?: string;
  VERCEL_URL?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}