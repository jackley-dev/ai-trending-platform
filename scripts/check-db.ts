#!/usr/bin/env tsx

import { prisma } from '../src/lib/database';

async function checkDatabase() {
  try {
    const totalItems = await prisma.item.count();
    const recentItems = await prisma.item.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        popularityScore: true,
        primaryCategory: true,
        createdAt: true,
        tags: {
          select: {
            tag: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const tagStats = await prisma.itemTag.groupBy({
      by: ['tagId'],
      _count: true,
      orderBy: {
        _count: {
          tagId: 'desc'
        }
      },
      take: 10
    });

    const tags = await prisma.tag.findMany({
      where: {
        id: {
          in: tagStats.map(s => s.tagId)
        }
      }
    });

    console.log(`📊 数据库状态:`);
    console.log(`  总项目数: ${totalItems}`);
    console.log(`  最新项目:`);

    recentItems.forEach((item, i) => {
      const itemTags = item.tags.map(t => t.tag.name).join(', ');
      console.log(`    ${i + 1}. ${item.title}`);
      console.log(`       分类: ${item.primaryCategory} | 热度: ${item.popularityScore}`);
      console.log(`       标签: ${itemTags}`);
      console.log(`       时间: ${item.createdAt.toLocaleString()}`);
    });

    console.log(`\n  热门标签:`);
    tagStats.forEach((stat, i) => {
      const tag = tags.find(t => t.id === stat.tagId);
      if (tag) {
        console.log(`    ${i + 1}. ${tag.name}: ${stat._count} 项目`);
      }
    });

  } catch (error) {
    console.error('数据库查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();