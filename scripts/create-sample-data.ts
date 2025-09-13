import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎭 创建示例数据...');

  // 获取GitHub数据源
  const githubSource = await prisma.dataSource.findUnique({
    where: { name: 'github' }
  });

  if (!githubSource) {
    throw new Error('GitHub数据源未找到');
  }

  // 创建示例项目数据
  const sampleItems = [
    {
      sourceId: githubSource.id,
      externalId: 'langchain-ai/langchain',
      title: 'LangChain',
      description: '⚡ Building applications with LLMs through composability ⚡',
      url: 'https://github.com/langchain-ai/langchain',
      authorName: 'langchain-ai',
      authorUrl: 'https://github.com/langchain-ai',
      popularityScore: 85000,
      metrics: JSON.stringify({
        stars: 85000,
        forks: 13000,
        watchers: 1500,
        issues: 800,
        pullRequests: 150
      }),
      primaryCategory: 'framework',
      contentType: 'repository',
      publishedAt: new Date('2022-10-17'),
      lastUpdated: new Date(),
      trendingDate: new Date(),
      rawData: JSON.stringify({}),
      processedMetadata: JSON.stringify({})
    },
    {
      sourceId: githubSource.id,
      externalId: 'run-llama/llama_index',
      title: 'LlamaIndex',
      description: 'LlamaIndex (formerly GPT Index) is a data framework for your LLM applications',
      url: 'https://github.com/run-llama/llama_index',
      authorName: 'run-llama',
      authorUrl: 'https://github.com/run-llama',
      popularityScore: 32000,
      metrics: JSON.stringify({
        stars: 32000,
        forks: 4500,
        watchers: 600,
        issues: 200,
        pullRequests: 80
      }),
      primaryCategory: 'framework',
      contentType: 'repository',
      publishedAt: new Date('2022-11-02'),
      lastUpdated: new Date(),
      trendingDate: new Date(),
      rawData: JSON.stringify({}),
      processedMetadata: JSON.stringify({})
    },
    {
      sourceId: githubSource.id,
      externalId: 'microsoft/autogen',
      title: 'AutoGen',
      description: 'A programming framework for agentic AI. Discord: https://aka.ms/autogen-dc. Roadmap: https://aka.ms/autogen-roadmap',
      url: 'https://github.com/microsoft/autogen',
      authorName: 'microsoft',
      authorUrl: 'https://github.com/microsoft',
      popularityScore: 28000,
      metrics: JSON.stringify({
        stars: 28000,
        forks: 4100,
        watchers: 450,
        issues: 300,
        pullRequests: 120
      }),
      primaryCategory: 'framework',
      contentType: 'repository',
      publishedAt: new Date('2023-08-18'),
      lastUpdated: new Date(),
      trendingDate: new Date(),
      rawData: JSON.stringify({}),
      processedMetadata: JSON.stringify({})
    },
    {
      sourceId: githubSource.id,
      externalId: 'joaomdmoura/crewai',
      title: 'CrewAI',
      description: 'Framework for orchestrating role-playing, autonomous AI agents. By fostering collaborative intelligence, CrewAI empowers agents to work together seamlessly, tackling complex tasks.',
      url: 'https://github.com/joaomdmoura/crewai',
      authorName: 'joaomdmoura',
      authorUrl: 'https://github.com/joaomdmoura',
      popularityScore: 15000,
      metrics: JSON.stringify({
        stars: 15000,
        forks: 2100,
        watchers: 280,
        issues: 150,
        pullRequests: 65
      }),
      primaryCategory: 'framework',
      contentType: 'repository',
      publishedAt: new Date('2023-10-27'),
      lastUpdated: new Date(),
      trendingDate: new Date(),
      rawData: JSON.stringify({}),
      processedMetadata: JSON.stringify({})
    },
    {
      sourceId: githubSource.id,
      externalId: 'geekan/MetaGPT',
      title: 'MetaGPT',
      description: '🌟 The Multi-Agent Framework: First AI Software Company, Towards Natural Language Programming',
      url: 'https://github.com/geekan/MetaGPT',
      authorName: 'geekan',
      authorUrl: 'https://github.com/geekan',
      popularityScore: 42000,
      metrics: JSON.stringify({
        stars: 42000,
        forks: 5000,
        watchers: 650,
        issues: 180,
        pullRequests: 95
      }),
      primaryCategory: 'application',
      contentType: 'repository',
      publishedAt: new Date('2023-06-30'),
      lastUpdated: new Date(),
      trendingDate: new Date(),
      rawData: JSON.stringify({}),
      processedMetadata: JSON.stringify({})
    },
    {
      sourceId: githubSource.id,
      externalId: 'chroma-core/chroma',
      title: 'Chroma',
      description: 'the AI-native open-source embedding database',
      url: 'https://github.com/chroma-core/chroma',
      authorName: 'chroma-core',
      authorUrl: 'https://github.com/chroma-core',
      popularityScore: 13000,
      metrics: JSON.stringify({
        stars: 13000,
        forks: 1100,
        watchers: 190,
        issues: 85,
        pullRequests: 45
      }),
      primaryCategory: 'technology',
      contentType: 'repository',
      publishedAt: new Date('2022-10-06'),
      lastUpdated: new Date(),
      trendingDate: new Date(),
      rawData: JSON.stringify({}),
      processedMetadata: JSON.stringify({})
    }
  ];

  // 创建项目
  for (const itemData of sampleItems) {
    const item = await prisma.item.upsert({
      where: {
        sourceId_externalId: {
          sourceId: itemData.sourceId,
          externalId: itemData.externalId
        }
      },
      update: {},
      create: itemData
    });

    console.log(`✅ 创建项目: ${item.title} (${item.popularityScore} stars)`);

    // 为每个项目添加相关标签
    const tagMappings = {
      'langchain-ai/langchain': ['langchain', 'rag'],
      'run-llama/llama_index': ['llamaindex', 'rag', 'vector-database'],
      'microsoft/autogen': ['autogen', 'agent-tools'],
      'joaomdmoura/crewai': ['crewai', 'agent-tools'],
      'geekan/MetaGPT': ['agent-tools', 'code-generation'],
      'chroma-core/chroma': ['vector-database', 'huggingface']
    };

    const relevantTagNames = tagMappings[itemData.externalId] || [];
    
    for (const tagName of relevantTagNames) {
      const tag = await prisma.tag.findUnique({ where: { name: tagName } });
      
      if (tag) {
        await prisma.itemTag.upsert({
          where: {
            itemId_tagId: {
              itemId: item.id,
              tagId: tag.id
            }
          },
          update: {},
          create: {
            itemId: item.id,
            tagId: tag.id,
            confidence: 0.9,
            source: 'manual'
          }
        });
        
        console.log(`  📌 添加标签: ${tag.displayName}`);
      }
    }
  }

  console.log('🎉 示例数据创建完成！');
}

main()
  .catch((e) => {
    console.error('❌ 创建示例数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });