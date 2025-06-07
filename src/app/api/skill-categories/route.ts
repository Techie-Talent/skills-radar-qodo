import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const skillCategories = await prisma.skillCategory.findMany({
      include: {
        skills: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(skillCategories);
  } catch (error) {
    console.error('Error fetching skill categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, groupingCriteria } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const skillCategory = await prisma.skillCategory.create({
      data: {
        name,
        groupingCriteria,
      },
    });

    return NextResponse.json(skillCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating skill category:', error);
    return NextResponse.json(
      { error: 'Failed to create skill category' },
      { status: 500 }
    );
  }
}