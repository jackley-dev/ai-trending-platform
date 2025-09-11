import { prisma } from '@/lib/database';
import { Item, TrendingFilters, PaginatedResult } from '@/types';
import { Prisma } from '@prisma/client';

export class ItemRepository {
  // 创建项目
  async create(data: Omit<Item, 'id' | 'createdAt' | 'lastUpdated'>): Promise<Item> {
    return await prisma.item.create({
      data: {
        ...data,
        metrics: data.metrics as Prisma.JsonObject,
        rawData: data.rawData as Prisma.JsonObject,
        processedMetadata: data.processedMetadata as Prisma.JsonObject,
      },
      include: {
        source: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    }) as Item;
  }

  // 根据ID获取项目
  async findById(id: number): Promise<Item | null> {
    return await prisma.item.findUnique({
      where: { id },
      include: {
        source: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    }) as Item | null;
  }

  // 根据外部ID和数据源查找项目
  async findByExternalId(sourceId: number, externalId: string): Promise<Item | null> {
    return await prisma.item.findUnique({
      where: {
        sourceId_externalId: {
          sourceId,
          externalId
        }
      },
      include: {
        source: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    }) as Item | null;
  }

  // 获取trending项目列表
  async findTrending(filters: TrendingFilters): Promise<PaginatedResult<Item>> {
    const {
      tags,
      categories,
      timespan = 'daily',
      minPopularity = 0,
      language,
      sortBy = 'popularity',
      sortOrder = 'desc',
      limit = 50,
      offset = 0
    } = filters;

    // 构建时间范围条件
    const timeCondition = this.buildTimeCondition(timespan);
    
    // 构建where条件
    const whereCondition: Prisma.ItemWhereInput = {
      popularityScore: { gte: minPopularity },
      ...(timeCondition && { trendingDate: timeCondition }),
      ...(categories && categories.length > 0 && {
        primaryCategory: { in: categories }
      }),
      ...(language && {
        processedMetadata: {
          path: ['language'],
          equals: language
        }
      }),
      ...(tags && tags.length > 0 && {
        tags: {
          some: {
            tag: {
              name: { in: tags }
            }
          }
        }
      })
    };

    // 构建排序条件
    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    // 获取总数
    const total = await prisma.item.count({ where: whereCondition });

    // 获取数据
    const items = await prisma.item.findMany({
      where: whereCondition,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        source: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    }) as Item[];

    return {
      items,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        hasMore: offset + limit < total
      }
    };
  }

  // 更新项目热度分数
  async updatePopularity(id: number, score: number): Promise<Item> {
    return await prisma.item.update({
      where: { id },
      data: {
        popularityScore: score,
        lastUpdated: new Date()
      },
      include: {
        source: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    }) as Item;
  }

  // 批量创建或更新项目
  async upsertMany(items: Omit<Item, 'id' | 'createdAt' | 'lastUpdated'>[]): Promise<number> {
    let processedCount = 0;

    for (const item of items) {
      try {
        await prisma.item.upsert({
          where: {
            sourceId_externalId: {
              sourceId: item.sourceId,
              externalId: item.externalId
            }
          },
          update: {
            title: item.title,
            description: item.description,
            url: item.url,
            popularityScore: item.popularityScore,
            metrics: item.metrics as Prisma.JsonObject,
            trendingDate: item.trendingDate,
            lastUpdated: new Date()
          },
          create: {
            ...item,
            metrics: item.metrics as Prisma.JsonObject,
            rawData: item.rawData as Prisma.JsonObject,
            processedMetadata: item.processedMetadata as Prisma.JsonObject,
          }
        });
        processedCount++;
      } catch (error) {
        console.error(`Failed to upsert item ${item.externalId}:`, error);
      }
    }

    return processedCount;
  }

  // 删除过期项目
  async deleteOldItems(beforeDate: Date, minPopularity = 10): Promise<number> {
    const result = await prisma.item.deleteMany({
      where: {
        createdAt: { lt: beforeDate },
        popularityScore: { lt: minPopularity }
      }
    });
    return result.count;
  }

  // 获取统计信息
  async getStats(): Promise<{
    total: number;
    today: number;
    topCategories: Array<{ category: string; count: number }>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCount, categoryStats] = await Promise.all([
      prisma.item.count(),
      prisma.item.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      prisma.item.groupBy({
        by: ['primaryCategory'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ]);

    return {
      total,
      today: todayCount,
      topCategories: categoryStats.map(stat => ({
        category: stat.primaryCategory || 'Uncategorized',
        count: stat._count.id
      }))
    };
  }

  // 搜索项目
  async search(query: string, limit = 20): Promise<Item[]> {
    return await prisma.item.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { authorName: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        popularityScore: 'desc'
      },
      take: limit,
      include: {
        source: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    }) as Item[];
  }

  // 辅助方法：构建时间条件
  private buildTimeCondition(timespan: 'daily' | 'weekly' | 'monthly'): Prisma.DateTimeFilter | undefined {
    const now = new Date();
    let startDate: Date;

    switch (timespan) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return undefined;
    }

    return { gte: startDate };
  }

  // 辅助方法：构建排序条件
  private buildOrderBy(sortBy: string, sortOrder: 'asc' | 'desc'): Prisma.ItemOrderByWithRelationInput {
    switch (sortBy) {
      case 'popularity':
        return { popularityScore: sortOrder };
      case 'date':
        return { publishedAt: sortOrder };
      case 'relevance':
        // 可以根据多个字段组合排序
        return [
          { popularityScore: 'desc' },
          { publishedAt: 'desc' }
        ] as any;
      default:
        return { popularityScore: sortOrder };
    }
  }
}