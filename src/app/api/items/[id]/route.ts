import { NextRequest, NextResponse } from 'next/server';
import { ItemRepository } from '@/lib/repositories/ItemRepository';

const itemRepo = new ItemRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid item ID'
      }, { status: 400 });
    }

    const item = await itemRepo.findById(id);
    
    if (!item) {
      return NextResponse.json({
        success: false,
        error: 'Item not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error(`API Error - GET /api/items/${params.id}:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}