import { NextRequest, NextResponse } from 'next/server';
import { ItemRepository } from '@/lib/repositories/ItemRepository';
import { TagRepository } from '@/lib/repositories/TagRepository';

const itemRepo = new ItemRepository();
const tagRepo = new TagRepository();

export async function GET(request: NextRequest) {
  try {
    // 并行获取统计数据
    const [itemStats, tagStats] = await Promise.all([
      itemRepo.getStats(),
      tagRepo.getTagStats()
    ]);

    const stats = {
      total: itemStats.total,
      today: itemStats.today,
      tags: {
        active: tagStats.length // 活跃标签总数
      },
      lastUpdate: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('API Error - GET /api/stats:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      data: null
    }, { status: 500 });
  }
}