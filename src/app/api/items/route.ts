import { NextRequest, NextResponse } from 'next/server';
import { ItemRepository } from '@/lib/repositories/ItemRepository';
import { TrendingFilters } from '@/types';

const itemRepo = new ItemRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const filters: TrendingFilters = {
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      categories: searchParams.get('categories')?.split(',').filter(Boolean),
      timespan: (searchParams.get('timespan') as 'daily' | 'weekly' | 'monthly') || 'daily',
      minPopularity: parseInt(searchParams.get('minPopularity') || '0'),
      language: searchParams.get('language') || undefined,
      sortBy: (searchParams.get('sortBy') as 'popularity' | 'date' | 'relevance') || 'popularity',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // 获取trending数据
    const result = await itemRepo.findTrending(filters);
    
    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('API Error - GET /api/items:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      data: null
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 这里可以添加手动触发数据同步的功能
    const body = await request.json();
    const { action } = body;

    if (action === 'sync') {
      // 触发数据同步（需要适当的权限验证）
      return NextResponse.json({
        success: true,
        message: 'Data sync triggered successfully'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('API Error - POST /api/items:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}