import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始数据库种子数据初始化...');

  // 1. 创建数据源
  const githubSource = await prisma.dataSource.upsert({
    where: { name: 'github' },
    update: {},
    create: {
      name: 'github',
      type: 'repository',
      displayName: 'GitHub',
      baseUrl: 'https://api.github.com',
      apiConfig: JSON.stringify({
        rateLimit: 5000,
        timeout: 30000
      }),
      updateFrequencyHours: 24,
      isActive: true
    }
  });

  console.log('✅ 创建GitHub数据源:', githubSource.name);

  // 2. 创建标签体系
  const frameworkTags = [
    { name: 'langchain', displayName: 'LangChain', description: 'LLM应用开发框架', color: '#FF6B35', isFeatured: true },
    { name: 'llamaindex', displayName: 'LlamaIndex', description: '数据框架连接LLM', color: '#8B5CF6', isFeatured: true },
    { name: 'autogen', displayName: 'AutoGen', description: '多Agent对话框架', color: '#10B981', isFeatured: true },
    { name: 'crewai', displayName: 'CrewAI', description: 'AI Agent协作平台', color: '#F59E0B', isFeatured: true },
    { name: 'langgraph', displayName: 'LangGraph', description: 'Agent工作流编排', color: '#EF4444', isFeatured: true },
    { name: 'transformers', displayName: 'Transformers', description: 'HuggingFace模型库', color: '#6366F1', isFeatured: true }
  ];

  const applicationTags = [
    { name: 'code-generation', displayName: '代码生成', description: 'AI代码生成工具', color: '#EC4899' },
    { name: 'chatbot', displayName: '聊天机器人', description: '对话系统和聊天机器人', color: '#14B8A6' },
    { name: 'rag', displayName: 'RAG系统', description: '检索增强生成系统', color: '#F97316' },
    { name: 'agent-tools', displayName: 'Agent工具', description: 'AI智能体工具集', color: '#84CC16' },
    { name: 'content-generation', displayName: '内容生成', description: 'AI内容创作工具', color: '#8B5CF6' },
    { name: 'data-analysis', displayName: '数据分析', description: 'AI数据分析工具', color: '#06B6D4' }
  ];

  const technologyTags = [
    { name: 'openai-api', displayName: 'OpenAI API', description: 'OpenAI API集成', color: '#00A67E' },
    { name: 'huggingface', displayName: 'HuggingFace', description: 'HF模型和工具', color: '#FF9D00' },
    { name: 'vector-database', displayName: '向量数据库', description: '向量存储和检索', color: '#7C3AED' },
    { name: 'fine-tuning', displayName: '模型微调', description: 'LLM模型微调', color: '#DC2626' },
    { name: 'prompt-engineering', displayName: '提示工程', description: 'Prompt优化技术', color: '#059669' }
  ];

  // 创建Framework标签
  for (const tagData of frameworkTags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {},
      create: {
        ...tagData,
        slug: tagData.name,
        category: 'framework',
        sortOrder: frameworkTags.indexOf(tagData)
      }
    });
    console.log(`✅ 创建Framework标签: ${tag.displayName}`);
  }

  // 创建Application标签
  for (const tagData of applicationTags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {},
      create: {
        ...tagData,
        slug: tagData.name,
        category: 'application',
        sortOrder: applicationTags.indexOf(tagData)
      }
    });
    console.log(`✅ 创建Application标签: ${tag.displayName}`);
  }

  // 创建Technology标签
  for (const tagData of technologyTags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {},
      create: {
        ...tagData,
        slug: tagData.name,
        category: 'technology',
        sortOrder: technologyTags.indexOf(tagData)
      }
    });
    console.log(`✅ 创建Technology标签: ${tag.displayName}`);
  }

  console.log('🎉 数据库种子数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });