#!/usr/bin/env tsx

import { GitHubService } from '../src/lib/github-api';
import { AIProjectClassifier } from '../src/lib/classifiers';
import { ItemRepository } from '../src/lib/repositories/ItemRepository';
import { TagRepository } from '../src/lib/repositories/TagRepository';
import { prisma } from '../src/lib/database';

class LimitedFetchService {
  private github: GitHubService;
  private classifier: AIProjectClassifier;
  private itemRepo: ItemRepository;
  private tagRepo: TagRepository;

  constructor() {
    this.github = new GitHubService();
    this.classifier = new AIProjectClassifier();
    this.itemRepo = new ItemRepository();
    this.tagRepo = new TagRepository();
  }

  async fetchLimitedData(): Promise<void> {
    console.log('🚀 开始有限数据获取...');

    try {
      // 1. 测试连接
      const connected = await this.github.testConnection();
      if (!connected) {
        throw new Error('GitHub API connection failed');
      }
      console.log('✅ GitHub API 连接成功');

      // 2. 获取GitHub数据源
      const githubSource = await prisma.dataSource.findUnique({
        where: { name: 'github' }
      });

      if (!githubSource) {
        throw new Error('GitHub data source not found');
      }

      // 3. 使用单个保守的查询
      const query = 'langchain OR llamaindex OR autogen stars:>100';
      console.log(`📥 查询: ${query}`);

      const response = await (this.github as any).octokit.rest.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 20 // 限制为20个结果
      });

      console.log(`📊 获取到 ${response.data.items.length} 个项目`);

      let processed = 0;
      let relevant = 0;

      for (const repo of response.data.items) {
        const rawItem = { source: 'github', data: repo };
        const standardItem = this.github.transform(rawItem);
        const classification = await this.classifier.classifyContent(standardItem);

        if (classification.isRelevant) {
          try {
            await this.saveItem(githubSource.id, standardItem, classification);
            relevant++;
            console.log(`✅ 保存: ${standardItem.title} (${classification.primaryCategory})`);
          } catch (error) {
            console.error(`❌ 保存失败: ${standardItem.title}`, error instanceof Error ? error.message : String(error));
          }
        }
        processed++;
      }

      console.log(`\n📈 处理完成:`);
      console.log(`  获取项目: ${response.data.items.length}`);
      console.log(`  处理项目: ${processed}`);
      console.log(`  相关项目: ${relevant}`);
      console.log(`  相关率: ${((relevant / response.data.items.length) * 100).toFixed(1)}%`);

    } catch (error) {
      console.error('💥 数据获取失败:', error);
    }
  }

  private async saveItem(sourceId: number, standardItem: any, classification: any): Promise<void> {
    // 检查是否已存在
    const existing = await prisma.item.findUnique({
      where: {
        sourceId_externalId: {
          sourceId,
          externalId: standardItem.url.split('/').pop() || standardItem.title
        }
      }
    });

    if (existing) {
      console.log(`⏭️  项目已存在: ${standardItem.title}`);
      return;
    }

    const itemData = {
      sourceId,
      externalId: standardItem.url.split('/').pop() || standardItem.title,
      title: standardItem.title,
      description: standardItem.description,
      url: standardItem.url,
      authorName: standardItem.author.name,
      authorUrl: standardItem.author.url,
      popularityScore: Math.round(this.github.calculatePopularity(standardItem.metrics)),
      metrics: JSON.stringify(standardItem.metrics),
      primaryCategory: classification.primaryCategory,
      contentType: 'repository' as const,
      publishedAt: standardItem.publishedAt,
      trendingDate: new Date(),
      rawData: JSON.stringify(standardItem),
      processedMetadata: JSON.stringify({
        language: standardItem.language,
        license: standardItem.license,
        topics: standardItem.topics,
        classification: {
          confidence: classification.confidence,
          relevanceScore: classification.relevanceScore,
          reasoning: classification.reasoning
        }
      })
    };

    // 创建新项目
    const item = await prisma.item.create({
      data: itemData
    });

    // 添加标签
    if (classification.suggestedTags.length > 0) {
      await this.tagRepo.addItemTags(item.id, classification.suggestedTags);
    }
  }
}

async function main() {
  const service = new LimitedFetchService();
  await service.fetchLimitedData();
  await prisma.$disconnect();
}

main().catch(console.error);