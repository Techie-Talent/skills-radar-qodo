import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const knowledgeArea = await prisma.knowledgeArea.findUnique({
      where: { id },
      include: {
        skills: true,
      },
    });

    if (!knowledgeArea) {
      return NextResponse.json(
        { error: 'Knowledge area not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(knowledgeArea);
  } catch (error) {
    console.error('Error fetching knowledge area:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge area' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const knowledgeArea = await prisma.knowledgeArea.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(knowledgeArea);
  } catch (error) {
    console.error('Error updating knowledge area:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge area' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    await prisma.knowledgeArea.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Knowledge area deleted successfully' });
  } catch (error) {
    console.error('Error deleting knowledge area:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge area' },
      { status: 500 }
    );
  }
}