import { NextRequest, NextResponse } from 'next/server';
import { ItemRepository } from '@/lib/repositories/ItemRepository';

// 标记为动态路由，避免静态生成
export const dynamic = 'force-dynamic';

const itemRepo = new ItemRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 2 characters long'
      }, { status: 400 });
    }

    const items = await itemRepo.search(query.trim(), limit);

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        query: query.trim(),
        count: items.length,
        limit
      }
    });

  } catch (error) {
    console.error('API Error - GET /api/search:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      data: null
    }, { status: 500 });
  }
}