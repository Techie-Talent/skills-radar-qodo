import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const scale = await prisma.scale.findUnique({
      where: { id },
      include: {
        skills: true,
      },
    });

    if (!scale) {
      return NextResponse.json(
        { error: 'Scale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scale);
  } catch (error) {
    console.error('Error fetching scale:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scale' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, type, values } = body;

    if (!name || !type || !values) {
      return NextResponse.json(
        { error: 'Name, type, and values are required' },
        { status: 400 }
      );
    }

    const scale = await prisma.scale.update({
      where: { id },
      data: {
        name,
        type,
        values,
      },
    });

    return NextResponse.json(scale);
  } catch (error) {
    console.error('Error updating scale:', error);
    return NextResponse.json(
      { error: 'Failed to update scale' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    await prisma.scale.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Scale deleted successfully' });
  } catch (error) {
    console.error('Error deleting scale:', error);
    return NextResponse.json(
      { error: 'Failed to delete scale' },
      { status: 500 }
    );
  }
}