import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, hireDate, currentClient, category, location } = body;

    if (!email || !fullName || !hireDate || !category) {
      return NextResponse.json(
        { error: 'Email, full name, hire date, and category are required' },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        email,
        fullName,
        hireDate: new Date(hireDate),
        currentClient,
        category,
        location,
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}