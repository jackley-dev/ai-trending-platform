import { StandardItem, Classification, TagMatch, ItemClassifier, KeywordConfig } from '@/types';

export class AIProjectClassifier implements ItemClassifier {
  private keywordConfig: KeywordConfig;
  private minRelevanceScore = 0.3;

  constructor() {
    this.keywordConfig = this.getKeywordConfig();
  }

  // 分类内容
  async classifyContent(item: StandardItem): Promise<Classification> {
    const relevanceScore = this.calculateRelevance(item);
    const isRelevant = relevanceScore >= this.minRelevanceScore;
    
    if (!isRelevant) {
      return {
        primaryCategory: 'other',
        confidence: 0,
        suggestedTags: [],
        isRelevant: false,
        relevanceScore,
        reasoning: 'Item does not meet AI/LLM relevance threshold'
      };
    }

    const suggestedTags = await this.extractTags(item);
    const primaryCategory = this.determinePrimaryCategory(suggestedTags, item);
    const confidence = this.calculateConfidence(suggestedTags, relevanceScore);

    return {
      primaryCategory,
      confidence,
      suggestedTags,
      isRelevant,
      relevanceScore,
      reasoning: this.generateReasoning(suggestedTags, relevanceScore, item)
    };
  }

  // 提取标签
  async extractTags(item: StandardItem): Promise<TagMatch[]> {
    const allMatches: TagMatch[] = [];

    // 1. 基于关键词匹配
    const keywordMatches = this.extractKeywordTags(item);
    allMatches.push(...keywordMatches);

    // 2. 基于描述语义分析
    const semanticMatches = this.extractSemanticTags(item);
    allMatches.push(...semanticMatches);

    // 3. 基于项目特征分析
    const featureMatches = this.extractFeatureTags(item);
    allMatches.push(...featureMatches);

    // 去重、排序和筛选
    const uniqueMatches = this.deduplicateAndRankTags(allMatches);
    
    return uniqueMatches.slice(0, 8); // 最多返回8个标签
  }

  // 计算相关性分数
  calculateRelevance(item: StandardItem): number {
    let score = 0;
    const weights = {
      title: 0.4,
      description: 0.3,
      topics: 0.2,
      metrics: 0.1
    };

    // 标题权重分析
    const titleScore = this.analyzeText(item.title, this.keywordConfig);
    score += titleScore * weights.title;

    // 描述权重分析
    const descScore = this.analyzeText(item.description, this.keywordConfig);
    score += descScore * weights.description;

    // Topics分析
    if (item.topics && item.topics.length > 0) {
      const topicsText = item.topics.join(' ');
      const topicsScore = this.analyzeText(topicsText, this.keywordConfig);
      score += topicsScore * weights.topics;
    }

    // 基于流行度的权重调整
    const popularityBonus = Math.min(0.2, item.metrics.primary / 1000);
    score += popularityBonus * weights.metrics;

    return Math.min(1.0, score);
  }

  // 私有辅助方法
  private getKeywordConfig(): KeywordConfig {
    return {
      // Framework 关键词
      'langchain': { weight: 10, tags: ['langchain'], category: 'framework' },
      'llamaindex': { weight: 10, tags: ['llamaindex'], category: 'framework' },
      'autogen': { weight: 10, tags: ['autogen'], category: 'framework' },
      'crewai': { weight: 10, tags: ['crewai'], category: 'framework' },
      'langgraph': { weight: 10, tags: ['langgraph'], category: 'framework' },
      'transformers': { weight: 9, tags: ['transformers'], category: 'framework' },
      
      // Application 关键词
      'chatbot': { weight: 8, tags: ['chatbot'], category: 'application' },
      'chat-bot': { weight: 8, tags: ['chatbot'], category: 'application' },
      'code-generation': { weight: 9, tags: ['code-generation'], category: 'application' },
      'code-generator': { weight: 9, tags: ['code-generation'], category: 'application' },
      'rag': { weight: 9, tags: ['rag'], category: 'application' },
      'retrieval-augmented': { weight: 9, tags: ['rag'], category: 'application' },
      'agent-tools': { weight: 8, tags: ['agent-tools'], category: 'application' },
      'ai-agent': { weight: 9, tags: ['agent-tools'], category: 'application' },
      'content-generation': { weight: 7, tags: ['content-generation'], category: 'application' },
      'data-analysis': { weight: 7, tags: ['data-analysis'], category: 'application' },

      // Technology 关键词  
      'openai': { weight: 8, tags: ['openai-api'], category: 'technology' },
      'openai-api': { weight: 9, tags: ['openai-api'], category: 'technology' },
      'huggingface': { weight: 8, tags: ['huggingface'], category: 'technology' },
      'hugging-face': { weight: 8, tags: ['huggingface'], category: 'technology' },
      'vector-database': { weight: 8, tags: ['vector-database'], category: 'technology' },
      'vector-db': { weight: 8, tags: ['vector-database'], category: 'technology' },
      'fine-tuning': { weight: 8, tags: ['fine-tuning'], category: 'technology' },
      'finetune': { weight: 8, tags: ['fine-tuning'], category: 'technology' },
      'prompt-engineering': { weight: 7, tags: ['prompt-engineering'], category: 'technology' },
      'prompt-optimizer': { weight: 7, tags: ['prompt-engineering'], category: 'technology' },

      // 通用AI关键词
      'llm': { weight: 9, tags: ['llm'], category: 'technology' },
      'large-language-model': { weight: 9, tags: ['llm'], category: 'technology' },
      'artificial-intelligence': { weight: 6, tags: ['ai'], category: 'technology' },
      'machine-learning': { weight: 5, tags: ['ml'], category: 'technology' },
      'deep-learning': { weight: 5, tags: ['dl'], category: 'technology' },
      'neural-network': { weight: 5, tags: ['neural'], category: 'technology' },
      'gpt': { weight: 7, tags: ['openai-api'], category: 'technology' },
      'claude': { weight: 7, tags: ['anthropic'], category: 'technology' },
      'anthropic': { weight: 7, tags: ['anthropic'], category: 'technology' }
    };
  }

  private extractKeywordTags(item: StandardItem): TagMatch[] {
    const matches: TagMatch[] = [];
    const text = `${item.title} ${item.description}`.toLowerCase();
    const topics = item.topics?.join(' ').toLowerCase() || '';

    for (const [keyword, config] of Object.entries(this.keywordConfig)) {
      let confidence = 0;
      let source: TagMatch['source'] = 'keyword';
      let reasoning = '';

      // 检查标题
      if (item.title.toLowerCase().includes(keyword)) {
        confidence = Math.max(confidence, 0.9);
        reasoning = `Found "${keyword}" in title`;
      }

      // 检查描述
      if (item.description.toLowerCase().includes(keyword)) {
        confidence = Math.max(confidence, 0.7);
        reasoning = reasoning || `Found "${keyword}" in description`;
      }

      // 检查topics
      if (topics.includes(keyword)) {
        confidence = Math.max(confidence, 0.8);
        reasoning = reasoning || `Found "${keyword}" in topics`;
      }

      if (confidence > 0) {
        for (const tag of config.tags) {
          matches.push({
            tagName: tag,
            confidence: confidence * (config.weight / 10),
            source,
            reasoning
          });
        }
      }
    }

    return matches;
  }

  private extractSemanticTags(item: StandardItem): TagMatch[] {
    const matches: TagMatch[] = [];
    const text = `${item.title} ${item.description}`.toLowerCase();

    // 语义模式匹配
    const semanticPatterns = [
      { pattern: /(conversational|dialogue|chat|talk)/i, tag: 'chatbot', confidence: 0.6 },
      { pattern: /(generate|creation|synthesis|produce)/i, tag: 'content-generation', confidence: 0.5 },
      { pattern: /(analysis|analyze|insight|examine)/i, tag: 'data-analysis', confidence: 0.5 },
      { pattern: /(assistant|helper|tool|utility)/i, tag: 'agent-tools', confidence: 0.4 },
      { pattern: /(embedding|vector|similarity|search)/i, tag: 'vector-database', confidence: 0.6 },
      { pattern: /(training|train|finetune|adapt)/i, tag: 'fine-tuning', confidence: 0.6 }
    ];

    for (const { pattern, tag, confidence } of semanticPatterns) {
      if (pattern.test(text)) {
        matches.push({
          tagName: tag,
          confidence,
          source: 'description',
          reasoning: `Semantic pattern match for ${tag}`
        });
      }
    }

    return matches;
  }

  private extractFeatureTags(item: StandardItem): TagMatch[] {
    const matches: TagMatch[] = [];

    // 基于语言特征
    if (item.language === 'Python') {
      matches.push({
        tagName: 'data-analysis',
        confidence: 0.3,
        source: 'keyword',
        reasoning: 'Python language suggests data analysis capability'
      });
    }

    if (item.language === 'JavaScript' || item.language === 'TypeScript') {
      matches.push({
        tagName: 'chatbot',
        confidence: 0.3,
        source: 'keyword', 
        reasoning: 'JS/TS language suggests web-based AI applications'
      });
    }

    // 基于流行度特征
    if (item.metrics.primary > 1000) {
      // 高星项目可能是重要框架
      const existingFrameworkTags = ['langchain', 'llamaindex', 'transformers'];
      const hasFrameworkTag = existingFrameworkTags.some(tag => 
        item.title.toLowerCase().includes(tag) || 
        item.description.toLowerCase().includes(tag)
      );
      
      if (hasFrameworkTag) {
        matches.push({
          tagName: 'framework',
          confidence: 0.4,
          source: 'manual',
          reasoning: 'High popularity suggests important framework'
        });
      }
    }

    return matches;
  }

  private analyzeText(text: string, keywordConfig: KeywordConfig): number {
    if (!text) return 0;
    
    const normalizedText = text.toLowerCase();
    let totalScore = 0;
    let maxScore = 0;

    for (const [keyword, config] of Object.entries(keywordConfig)) {
      if (normalizedText.includes(keyword)) {
        const score = config.weight / 10;
        totalScore += score;
        maxScore = Math.max(maxScore, score);
      }
    }

    // 返回平均分和最高分的加权平均
    return Math.min(1.0, (totalScore * 0.3 + maxScore * 0.7));
  }

  private determinePrimaryCategory(tags: TagMatch[], item: StandardItem): string {
    if (tags.length === 0) return 'other';

    // 按置信度排序，找到最高置信度的标签类别
    const sortedTags = tags.sort((a, b) => b.confidence - a.confidence);
    const topTag = sortedTags[0];

    // 根据标签名称推断主分类
    const categoryMap: Record<string, string> = {
      'langchain': 'framework',
      'llamaindex': 'framework', 
      'autogen': 'framework',
      'crewai': 'framework',
      'langgraph': 'framework',
      'transformers': 'framework',
      'chatbot': 'application',
      'code-generation': 'application',
      'rag': 'application',
      'agent-tools': 'application',
      'content-generation': 'application',
      'data-analysis': 'application',
      'openai-api': 'technology',
      'huggingface': 'technology',
      'vector-database': 'technology',
      'fine-tuning': 'technology',
      'prompt-engineering': 'technology'
    };

    return categoryMap[topTag.tagName] || 'application';
  }

  private calculateConfidence(tags: TagMatch[], relevanceScore: number): number {
    if (tags.length === 0) return 0;

    const avgTagConfidence = tags.reduce((sum, tag) => sum + tag.confidence, 0) / tags.length;
    
    // 综合标签置信度和相关性分数
    return (avgTagConfidence * 0.7 + relevanceScore * 0.3);
  }

  private generateReasoning(tags: TagMatch[], relevanceScore: number, item: StandardItem): string {
    const reasons: string[] = [];
    
    if (relevanceScore > 0.7) {
      reasons.push('High AI/LLM relevance score');
    }
    
    if (tags.length > 0) {
      const topTags = tags.slice(0, 3).map(tag => tag.tagName);
      reasons.push(`Identified as: ${topTags.join(', ')}`);
    }
    
    if (item.metrics.primary > 500) {
      reasons.push('High community interest');
    }

    return reasons.join('. ') || 'Automated classification based on content analysis';
  }

  private deduplicateAndRankTags(tags: TagMatch[]): TagMatch[] {
    const tagMap = new Map<string, TagMatch>();

    // 去重，保留最高置信度的标签
    for (const tag of tags) {
      const existing = tagMap.get(tag.tagName);
      if (!existing || tag.confidence > existing.confidence) {
        tagMap.set(tag.tagName, tag);
      }
    }

    // 按置信度排序
    return Array.from(tagMap.values())
      .sort((a, b) => b.confidence - a.confidence)
      .filter(tag => tag.confidence > 0.3); // 过滤低置信度标签
  }
}