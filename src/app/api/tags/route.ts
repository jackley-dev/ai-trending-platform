import { NextRequest, NextResponse } from 'next/server';
import { TagRepository } from '@/lib/repositories/TagRepository';

const tagRepo = new TagRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    
    let tags;
    
    if (featured) {
      // 获取热门标签
      tags = await tagRepo.findFeatured();
    } else if (category) {
      // 按分类获取标签
      tags = await tagRepo.findByCategory(category);
    } else {
      // 获取所有标签
      tags = await tagRepo.findAll();
    }

    return NextResponse.json({
      success: true,
      data: tags
    });

  } catch (error) {
    console.error('API Error - GET /api/tags:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      data: null
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, category, displayName, description, color } = body;

    // 基础验证
    if (!name || !slug || !category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, slug, category'
      }, { status: 400 });
    }

    const tag = await tagRepo.create({
      name,
      slug,
      category,
      displayName,
      description,
      color: color || '#6B7280',
      sortOrder: 0,
      isFeatured: false
    });

    return NextResponse.json({
      success: true,
      data: tag
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - POST /api/tags:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}