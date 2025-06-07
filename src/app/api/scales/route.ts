import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const scales = await prisma.scale.findMany({
      include: {
        skills: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(scales);
  } catch (error) {
    console.error('Error fetching scales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scales' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, values } = body;

    if (!name || !type || !values) {
      return NextResponse.json(
        { error: 'Name, type, and values are required' },
        { status: 400 }
      );
    }

    const scale = await prisma.scale.create({
      data: {
        name,
        type,
        values,
      },
    });

    return NextResponse.json(scale, { status: 201 });
  } catch (error) {
    console.error('Error creating scale:', error);
    return NextResponse.json(
      { error: 'Failed to create scale' },
      { status: 500 }
    );
  }
}