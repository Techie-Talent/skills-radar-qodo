import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const knowledgeAreas = await prisma.knowledgeArea.findMany({
      include: {
        skills: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(knowledgeAreas);
  } catch (error) {
    console.error('Error fetching knowledge areas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge areas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const knowledgeArea = await prisma.knowledgeArea.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(knowledgeArea, { status: 201 });
  } catch (error) {
    console.error('Error creating knowledge area:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge area' },
      { status: 500 }
    );
  }
}