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

    const skillCategory = await prisma.skillCategory.findUnique({
      where: { id },
      include: {
        skills: true,
      },
    });

    if (!skillCategory) {
      return NextResponse.json(
        { error: 'Skill category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(skillCategory);
  } catch (error) {
    console.error('Error fetching skill category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill category' },
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
    const { name, groupingCriteria } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const skillCategory = await prisma.skillCategory.update({
      where: { id },
      data: {
        name,
        groupingCriteria,
      },
    });

    return NextResponse.json(skillCategory);
  } catch (error) {
    console.error('Error updating skill category:', error);
    return NextResponse.json(
      { error: 'Failed to update skill category' },
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

    await prisma.skillCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Skill category deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill category:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill category' },
      { status: 500 }
    );
  }
}