#!/usr/bin/env tsx

import { GitHubService } from '../src/lib/github-api';
import { AIProjectClassifier } from '../src/lib/classifiers';
import { ItemRepository } from '../src/lib/repositories/ItemRepository';
import { TagRepository } from '../src/lib/repositories/TagRepository';
import { prisma } from '../src/lib/database';

async function fetchPopularAI() {
  const github = new GitHubService();
  const classifier = new AIProjectClassifier();
  const itemRepo = new ItemRepository();
  const tagRepo = new TagRepository();

  console.log('🔍 搜索高热度AI/LLM项目...');

  // 获取GitHub数据源
  const githubSource = await prisma.dataSource.findUnique({
    where: { name: 'github' }
  });

  if (!githubSource) {
    console.error('GitHub data source not found');
    return;
  }

  // 高价值AI项目关键词搜索
  const popularQueries = [
    'langchain stars:>1000',
    'openai stars:>1000',
    'llama stars:>1000',
    'transformers stars:>1000',
    'chatgpt stars:>1000',
    'anthropic stars:>500',
    'agent-tools stars:>500',
    'rag stars:>500',
    'vector-database stars:>500',
    'llm-agents stars:>200'
  ];

  let processed = 0;
  let relevant = 0;

  for (const query of popularQueries) {
    try {
      console.log(`🔍 搜索: ${query}`);
      const rawItems = await github.fetchLatest({ query, per_page: 20 });

      console.log(`  找到 ${rawItems.length} 个项目`);

      for (const rawItem of rawItems.slice(0, 10)) { // 限制每次处理10个
        try {
          const standardItem = github.transform(rawItem);
          const classification = await classifier.classifyContent(standardItem);

          if (classification.isRelevant) {
            // 检查是否已存在
            const existing = await itemRepo.findByExternalId(
              githubSource.id,
              standardItem.url.split('/').pop() || standardItem.title
            );

            if (!existing) {
              const itemData = {
                sourceId: githubSource.id,
                externalId: standardItem.url.split('/').pop() || standardItem.title,
                title: standardItem.title,
                description: standardItem.description,
                url: standardItem.url,
                authorName: standardItem.author.name,
                authorUrl: standardItem.author.url,
                popularityScore: Math.round(github.calculatePopularity(standardItem.metrics)),
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

              const item = await prisma.item.create({
                data: itemData
              });

              // 添加标签
              if (classification.suggestedTags.length > 0) {
                await tagRepo.addItemTags(item.id, classification.suggestedTags);
              }

              console.log(`  ✅ 新增: ${standardItem.title} (⭐ ${standardItem.metrics.primary})`);
              relevant++;
            } else {
              console.log(`  ⏭️  已存在: ${standardItem.title}`);
            }
          }
          processed++;
        } catch (error) {
          console.error(`    ❌ 处理失败:`, error);
        }
      }

      // API限制延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`搜索失败 "${query}":`, error);
    }
  }

  console.log(`\n📊 同步完成:`);
  console.log(`  处理项目: ${processed}`);
  console.log(`  新增项目: ${relevant}`);

  // 显示最新统计
  const totalItems = await prisma.item.count();
  console.log(`  数据库总计: ${totalItems} 个项目`);
}

fetchPopularAI().catch(console.error).finally(() => prisma.$disconnect());