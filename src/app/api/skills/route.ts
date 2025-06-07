import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        knowledgeArea: true,
        category: true,
        scale: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, purpose, knowledgeAreaId, categoryId, scaleId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        purpose,
        knowledgeAreaId: knowledgeAreaId || null,
        categoryId: categoryId || null,
        scaleId: scaleId || null,
      },
      include: {
        knowledgeArea: true,
        category: true,
        scale: true,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}