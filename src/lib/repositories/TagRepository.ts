import { prisma } from '@/lib/database';
import { Tag, TagMatch } from '@/types';

export class TagRepository {
  // 获取所有标签
  async findAll(): Promise<Tag[]> {
    return await prisma.tag.findMany({
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        parent: true,
        children: true
      }
    }) as Tag[];
  }

  // 根据分类获取标签
  async findByCategory(category: string): Promise<Tag[]> {
    return await prisma.tag.findMany({
      where: { category },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    }) as Tag[];
  }

  // 获取热门标签
  async findFeatured(): Promise<Tag[]> {
    return await prisma.tag.findMany({
      where: { isFeatured: true },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' }
      ]
    }) as Tag[];
  }

  // 根据名称查找标签
  async findByName(name: string): Promise<Tag | null> {
    return await prisma.tag.findUnique({
      where: { name }
    }) as Tag | null;
  }

  // 根据名称列表查找标签
  async findByNames(names: string[]): Promise<Tag[]> {
    return await prisma.tag.findMany({
      where: {
        name: { in: names }
      }
    }) as Tag[];
  }

  // 创建标签
  async create(data: Omit<Tag, 'id' | 'createdAt'>): Promise<Tag> {
    return await prisma.tag.create({
      data
    }) as Tag;
  }

  // 更新标签
  async update(id: number, data: Partial<Tag>): Promise<Tag> {
    return await prisma.tag.update({
      where: { id },
      data
    }) as Tag;
  }

  // 为项目添加标签
  async addItemTags(itemId: number, tagMatches: TagMatch[]): Promise<void> {
    // 先删除现有的自动生成的标签
    await prisma.itemTag.deleteMany({
      where: {
        itemId,
        source: { in: ['auto', 'ai'] }
      }
    });

    // 添加新标签
    for (const match of tagMatches) {
      const tag = await this.findByName(match.tagName);
      if (tag) {
        await prisma.itemTag.upsert({
          where: {
            itemId_tagId: {
              itemId,
              tagId: tag.id
            }
          },
          update: {
            confidence: match.confidence,
            source: match.source
          },
          create: {
            itemId,
            tagId: tag.id,
            confidence: match.confidence,
            source: match.source
          }
        });
      }
    }
  }

  // 获取项目的标签
  async getItemTags(itemId: number): Promise<Tag[]> {
    const itemTags = await prisma.itemTag.findMany({
      where: { itemId },
      include: { tag: true },
      orderBy: {
        confidence: 'desc'
      }
    });

    return itemTags.map(it => it.tag) as Tag[];
  }

  // 获取标签统计信息
  async getTagStats(): Promise<Array<{ tag: string; count: number }>> {
    const stats = await prisma.itemTag.groupBy({
      by: ['tagId'],
      _count: {
        itemId: true
      },
      orderBy: {
        _count: {
          itemId: 'desc'
        }
      },
      take: 20
    });

    const tagIds = stats.map(s => s.tagId);
    const tags = await prisma.tag.findMany({
      where: {
        id: { in: tagIds }
      },
      select: {
        id: true,
        name: true,
        displayName: true
      }
    });

    return stats.map(stat => {
      const tag = tags.find(t => t.id === stat.tagId);
      return {
        tag: tag?.displayName || tag?.name || 'Unknown',
        count: stat._count.itemId
      };
    });
  }

  // 删除未使用的标签
  async cleanupUnusedTags(): Promise<number> {
    // 查找没有关联项目的标签
    const unusedTags = await prisma.tag.findMany({
      where: {
        items: {
          none: {}
        },
        isFeatured: false // 保留特色标签
      }
    });

    if (unusedTags.length === 0) {
      return 0;
    }

    const result = await prisma.tag.deleteMany({
      where: {
        id: {
          in: unusedTags.map(tag => tag.id)
        }
      }
    });

    return result.count;
  }

  // 获取相关标签建议
  async getSuggestedTags(itemId: number, limit = 5): Promise<Tag[]> {
    // 基于已有标签找相关标签
    const currentTags = await prisma.itemTag.findMany({
      where: { itemId },
      select: { tagId: true }
    });

    if (currentTags.length === 0) {
      // 如果没有标签，返回热门标签
      return await this.findFeatured();
    }

    // 找到与当前标签经常一起出现的其他标签
    const relatedTags = await prisma.tag.findMany({
      where: {
        items: {
          some: {
            item: {
              tags: {
                some: {
                  tagId: {
                    in: currentTags.map(t => t.tagId)
                  }
                }
              }
            }
          }
        },
        id: {
          notIn: currentTags.map(t => t.tagId)
        }
      },
      take: limit,
      orderBy: {
        isFeatured: 'desc'
      }
    });

    return relatedTags as Tag[];
  }
}