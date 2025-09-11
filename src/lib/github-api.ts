import { Octokit } from '@octokit/rest';
import { GitHubRepo, StandardItem, DataSourceAdapter, RawItem, TagMatch } from '@/types';

export class GitHubService implements DataSourceAdapter {
  private octokit: Octokit;
  readonly name = 'github';
  readonly type = 'repository' as const;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || process.env.GITHUB_TOKEN,
      request: {
        timeout: 30000,
      }
    });
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      await this.octokit.rest.users.getAuthenticated();
      return true;
    } catch (error) {
      console.error('GitHub API connection failed:', error);
      return false;
    }
  }

  // 验证配置
  validateConfig(config: any): boolean {
    return !!(config?.token || process.env.GITHUB_TOKEN);
  }

  // 获取最新项目
  async fetchLatest(config: any = {}): Promise<RawItem[]> {
    const { 
      query = '',
      sort = 'stars',
      order = 'desc',
      per_page = 100,
      page = 1 
    } = config;

    try {
      const response = await this.octokit.rest.search.repos({
        q: query || 'stars:>10 created:>2024-01-01',
        sort,
        order,
        per_page,
        page
      });

      return response.data.items.map(repo => ({
        source: 'github',
        data: repo
      }));
    } catch (error) {
      console.error('GitHub API fetch failed:', error);
      return [];
    }
  }

  // 获取trending项目
  async fetchTrending(timespan: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<RawItem[]> {
    const date = this.getDateByTimespan(timespan);
    
    // 使用多个查询策略获取更全面的数据
    const queries = [
      // 基础trending查询
      `created:>${date} stars:>10`,
      // AI相关关键词查询
      ...this.getAIKeywords().map(keyword => 
        `${keyword} created:>${date} stars:>5`
      ),
      // Topic查询
      ...this.getAITopics().map(topic => 
        `topic:${topic} created:>${date} stars:>5`
      )
    ];

    const allResults: RawItem[] = [];

    for (const query of queries) {
      try {
        const response = await this.octokit.rest.search.repos({
          q: query,
          sort: 'stars',
          order: 'desc',
          per_page: 50
        });

        const rawItems = response.data.items.map(repo => ({
          source: 'github',
          data: repo
        }));

        allResults.push(...rawItems);

        // 避免API速率限制
        await this.sleep(1000);
      } catch (error) {
        console.error(`Failed to fetch with query "${query}":`, error);
      }
    }

    // 去重并返回
    return this.deduplicateResults(allResults);
  }

  // 转换为标准格式
  transform(rawItem: any): StandardItem {
    const repo = rawItem.data as GitHubRepo;
    
    return {
      title: repo.full_name,
      description: repo.description || '',
      url: repo.html_url,
      author: {
        name: repo.owner.login,
        url: repo.owner.html_url,
        avatarUrl: repo.owner.avatar_url
      },
      publishedAt: new Date(repo.created_at),
      metrics: {
        primary: repo.stargazers_count,
        secondary: repo.forks_count,
        engagement: repo.open_issues_count
      },
      categories: this.categorizeRepo(repo),
      language: repo.language || undefined,
      license: repo.license?.name || undefined,
      topics: repo.topics || []
    };
  }

  // 提取标签
  async extractTags(item: StandardItem): Promise<TagMatch[]> {
    const tags: TagMatch[] = [];
    const keywords = this.getKeywordWeights();

    // 分析标题
    const titleWords = item.title.toLowerCase().split(/[\s\-_\/]/);
    for (const word of titleWords) {
      const keywordMatch = keywords[word];
      if (keywordMatch) {
        tags.push({
          tagName: keywordMatch.tags[0], // 使用第一个标签
          confidence: 0.9,
          source: 'keyword',
          reasoning: `Found keyword "${word}" in title`
        });
      }
    }

    // 分析描述
    if (item.description) {
      const descWords = item.description.toLowerCase().split(/[\s\-_\.,!?]/);
      for (const word of descWords) {
        const keywordMatch = keywords[word];
        if (keywordMatch) {
          tags.push({
            tagName: keywordMatch.tags[0],
            confidence: 0.7,
            source: 'description',
            reasoning: `Found keyword "${word}" in description`
          });
        }
      }
    }

    // 分析topics
    if (item.topics) {
      for (const topic of item.topics) {
        const topicMatch = keywords[topic];
        if (topicMatch) {
          tags.push({
            tagName: topicMatch.tags[0],
            confidence: 0.8,
            source: 'keyword',
            reasoning: `Found topic "${topic}"`
          });
        }
      }
    }

    // 去重并按置信度排序
    const uniqueTags = this.deduplicateTags(tags);
    return uniqueTags.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  // 计算热度分数
  calculatePopularity(metrics: any): number {
    const { primary = 0, secondary = 0, engagement = 0 } = metrics;
    
    // 基于stars, forks, issues的综合评分
    const starsWeight = 0.6;
    const forksWeight = 0.3;
    const issuesWeight = 0.1;
    
    const score = (
      primary * starsWeight + 
      secondary * forksWeight + 
      engagement * issuesWeight
    ) / 10; // 缩放到合理范围
    
    return Math.min(100, Math.max(0, score));
  }

  // 获取仓库详细信息
  async getRepoDetails(owner: string, repo: string): Promise<GitHubRepo | null> {
    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get repo details for ${owner}/${repo}:`, error);
      return null;
    }
  }

  // 获取trending语言列表
  async getTrendingLanguages(): Promise<string[]> {
    try {
      const response = await this.octokit.rest.search.repos({
        q: 'created:>2024-01-01 stars:>100',
        sort: 'stars',
        order: 'desc',
        per_page: 100
      });

      const languages = response.data.items
        .map(repo => repo.language)
        .filter(Boolean) as string[];

      // 统计并返回top 20
      const langCounts = languages.reduce((acc, lang) => {
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.keys(langCounts)
        .sort((a, b) => langCounts[b] - langCounts[a])
        .slice(0, 20);
    } catch (error) {
      console.error('Failed to get trending languages:', error);
      return [];
    }
  }

  // 私有辅助方法
  private getDateByTimespan(timespan: 'daily' | 'weekly' | 'monthly'): string {
    const now = new Date();
    let daysAgo: number;

    switch (timespan) {
      case 'daily':
        daysAgo = 1;
        break;
      case 'weekly':
        daysAgo = 7;
        break;
      case 'monthly':
        daysAgo = 30;
        break;
    }

    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }

  private getAIKeywords(): string[] {
    return [
      'langchain', 'llm', 'ai-agent', 'chatgpt', 'openai',
      'anthropic', 'huggingface', 'transformers', 'autogen',
      'crewai', 'langgraph', 'llamaindex', 'rag', 'vector-database'
    ];
  }

  private getAITopics(): string[] {
    return [
      'artificial-intelligence', 'machine-learning', 'deep-learning',
      'natural-language-processing', 'chatbot', 'llm', 'ai-agent',
      'langchain', 'openai', 'gpt', 'transformer'
    ];
  }

  private getKeywordWeights(): Record<string, { weight: number; tags: string[] }> {
    return {
      'langchain': { weight: 10, tags: ['langchain'] },
      'llm': { weight: 8, tags: ['llm'] },
      'ai-agent': { weight: 9, tags: ['agent-tools'] },
      'chatbot': { weight: 7, tags: ['chatbot'] },
      'openai': { weight: 8, tags: ['openai-api'] },
      'huggingface': { weight: 7, tags: ['huggingface'] },
      'transformers': { weight: 7, tags: ['transformers'] },
      'autogen': { weight: 8, tags: ['autogen'] },
      'crewai': { weight: 8, tags: ['crewai'] },
      'langgraph': { weight: 8, tags: ['langgraph'] },
      'llamaindex': { weight: 8, tags: ['llamaindex'] },
      'rag': { weight: 7, tags: ['rag'] },
      'vector-database': { weight: 6, tags: ['vector-database'] },
      'fine-tuning': { weight: 6, tags: ['fine-tuning'] },
      'prompt-engineering': { weight: 6, tags: ['prompt-engineering'] }
    };
  }

  private categorizeRepo(repo: GitHubRepo): string[] {
    const categories: string[] = [];
    const keywords = this.getKeywordWeights();
    
    // 基于名称和描述分类
    const text = `${repo.full_name} ${repo.description || ''}`.toLowerCase();
    
    for (const [keyword, config] of Object.entries(keywords)) {
      if (text.includes(keyword)) {
        categories.push(...config.tags);
      }
    }

    // 基于topics分类
    for (const topic of repo.topics || []) {
      const keywordMatch = keywords[topic];
      if (keywordMatch) {
        categories.push(...keywordMatch.tags);
      }
    }

    return [...new Set(categories)]; // 去重
  }

  private deduplicateResults(results: RawItem[]): RawItem[] {
    const seen = new Set<string>();
    return results.filter(item => {
      const id = item.data.id;
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }

  private deduplicateTags(tags: TagMatch[]): TagMatch[] {
    const seen = new Map<string, TagMatch>();
    
    for (const tag of tags) {
      const existing = seen.get(tag.tagName);
      if (!existing || tag.confidence > existing.confidence) {
        seen.set(tag.tagName, tag);
      }
    }
    
    return Array.from(seen.values());
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}