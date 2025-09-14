#!/usr/bin/env tsx

import { GitHubService } from '../src/lib/github-api';
import { AIProjectClassifier } from '../src/lib/classifiers';
import { ItemRepository } from '../src/lib/repositories/ItemRepository';
import { TagRepository } from '../src/lib/repositories/TagRepository';
import { prisma } from '../src/lib/database';

interface SyncOptions {
  timespan?: 'daily' | 'weekly' | 'monthly';
  dryRun?: boolean;
  verbose?: boolean;
}

class TrendingSyncService {
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

  async syncTrendingData(options: SyncOptions = {}): Promise<{
    fetched: number;
    processed: number;
    relevant: number;
    errors: number;
  }> {
    const { timespan = 'daily', dryRun = false, verbose = false } = options;
    
    console.log(`🚀 开始同步 ${timespan} trending数据...`);
    if (dryRun) console.log('🔍 DRY RUN 模式 - 不会实际保存数据');

    let fetched = 0;
    let processed = 0;
    let relevant = 0;
    let errors = 0;

    try {
      // 1. 测试数据库连接
      console.log('🔌 测试数据库连接...');
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ 数据库连接成功');

      // 2. 测试GitHub API连接
      console.log('🔌 测试GitHub API连接...');
      const connected = await this.github.testConnection();
      if (!connected) {
        throw new Error('GitHub API connection failed');
      }
      console.log('✅ GitHub API 连接成功');

      // 2. 获取数据源配置
      const githubSource = await prisma.dataSource.findUnique({
        where: { name: 'github' }
      });

      if (!githubSource) {
        throw new Error('GitHub data source not found in database');
      }

      // 3. 创建同步任务记录
      const job = await prisma.processingJob.create({
        data: {
          sourceId: githubSource.id,
          jobType: 'fetch',
          status: 'running',
          startedAt: new Date(),
          metadata: JSON.stringify({ timespan, dryRun })
        }
      });

      console.log(`📋 创建同步任务: ${job.id}`);

      try {
        // 4. 获取trending数据
        console.log('📥 获取GitHub trending数据...');
        const rawItems = await this.github.fetchTrending(timespan);
        fetched = rawItems.length;
        console.log(`📊 获取到 ${fetched} 个项目`);

        if (verbose) {
          console.log('🔍 前5个项目预览:');
          rawItems.slice(0, 5).forEach((item, i) => {
            const repo = item.data;
            console.log(`  ${i + 1}. ${repo.full_name} (⭐ ${repo.stargazers_count})`);
          });
        }

        // 5. 处理每个项目
        for (const rawItem of rawItems) {
          try {
            // 转换为标准格式
            const standardItem = this.github.transform(rawItem);
            
            // AI分类和标签提取
            const classification = await this.classifier.classifyContent(standardItem);
            
            if (!classification.isRelevant) {
              if (verbose) {
                console.log(`⏭️  跳过不相关项目: ${standardItem.title}`);
              }
              continue;
            }

            relevant++;
            
            if (verbose) {
              console.log(`✨ 发现AI/LLM项目: ${standardItem.title}`);
              console.log(`   分类: ${classification.primaryCategory}`);
              console.log(`   置信度: ${(classification.confidence * 100).toFixed(1)}%`);
              console.log(`   标签: ${classification.suggestedTags.map(t => t.tagName).join(', ')}`);
            }

            if (!dryRun) {
              // 保存到数据库
              await this.saveItem(standardItem, classification, githubSource.id);
            }

            processed++;

          } catch (error) {
            errors++;
            console.error(`❌ 处理项目失败: ${rawItem.data.full_name}`, error);
          }
        }

        // 6. 更新任务状态
        await prisma.processingJob.update({
          where: { id: job.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            itemsProcessed: processed,
            metadata: JSON.stringify({
              timespan,
              dryRun,
              stats: { fetched, processed, relevant, errors }
            })
          }
        });

        console.log('\n📈 同步完成统计:');
        console.log(`  获取项目: ${fetched}`);
        console.log(`  处理项目: ${processed}`);
        console.log(`  相关项目: ${relevant}`);
        console.log(`  错误数量: ${errors}`);
        console.log(`  相关率: ${fetched > 0 ? ((relevant / fetched) * 100).toFixed(1) : 0}%`);

      } catch (error) {
        // 更新任务为失败状态
        await prisma.processingJob.update({
          where: { id: job.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        throw error;
      }

    } catch (error) {
      console.error('💥 同步失败:', error);
      errors++;
    }

    return { fetched, processed, relevant, errors };
  }

  private async saveItem(
    standardItem: any,
    classification: any,
    sourceId: number
  ): Promise<void> {
    // 检查是否已存在
    const existing = await this.itemRepo.findByExternalId(
      sourceId,
      standardItem.url.split('/').pop() || standardItem.title
    );

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

    let item;
    if (existing) {
      // 更新现有项目
      item = await prisma.item.update({
        where: { id: existing.id },
        data: {
          ...itemData,
          lastUpdated: new Date()
        }
      });
    } else {
      // 创建新项目
      item = await prisma.item.create({
        data: itemData
      });
    }

    // 添加标签
    if (classification.suggestedTags.length > 0) {
      await this.tagRepo.addItemTags(item.id, classification.suggestedTags);
    }
  }

  async cleanupOldData(): Promise<number> {
    console.log('🧹 清理过期数据...');
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deleted = await this.itemRepo.deleteOldItems(thirtyDaysAgo, 5);
    
    if (deleted > 0) {
      console.log(`🗑️  删除了 ${deleted} 个过期低热度项目`);
    }
    
    return deleted;
  }

  async getStats(): Promise<void> {
    console.log('\n📊 数据库统计:');
    
    const stats = await this.itemRepo.getStats();
    console.log(`  总项目数: ${stats.total}`);
    console.log(`  今日新增: ${stats.today}`);
    
    console.log('  热门分类:');
    stats.topCategories.slice(0, 5).forEach((cat, i) => {
      console.log(`    ${i + 1}. ${cat.category}: ${cat.count}`);
    });

    const tagStats = await this.tagRepo.getTagStats();
    console.log('  热门标签:');
    tagStats.slice(0, 5).forEach((tag, i) => {
      console.log(`    ${i + 1}. ${tag.tag}: ${tag.count}`);
    });
  }
}

// CLI入口
async function main() {
  const args = process.argv.slice(2);
  const options: SyncOptions = {};
  
  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--timespan':
        options.timespan = args[++i] as 'daily' | 'weekly' | 'monthly';
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        console.log(`
用法: tsx scripts/fetch-trending.ts [选项]

选项:
  --timespan <daily|weekly|monthly>  时间范围 (默认: daily)
  --dry-run                          预览模式，不实际保存数据
  --verbose                          详细输出
  --help                             显示此帮助信息

示例:
  tsx scripts/fetch-trending.ts
  tsx scripts/fetch-trending.ts --timespan weekly --verbose
  tsx scripts/fetch-trending.ts --dry-run
        `);
        process.exit(0);
    }
  }

  const syncService = new TrendingSyncService();
  
  try {
    // 执行同步
    const result = await syncService.syncTrendingData(options);
    
    // 清理旧数据 (仅在非dry-run模式)
    if (!options.dryRun) {
      await syncService.cleanupOldData();
    }
    
    // 显示统计信息
    await syncService.getStats();
    
    console.log('\n🎉 同步任务完成!');
    
    if (result.errors > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 同步任务失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 只有直接运行脚本时才执行main函数
if (require.main === module) {
  main().catch(console.error);
}

export { TrendingSyncService };