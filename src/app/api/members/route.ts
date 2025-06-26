import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const name = searchParams.get('name');
    const knowledgeAreaId = searchParams.get('knowledgeAreaId');
    const skillCategoryId = searchParams.get('skillCategoryId');
    const skillId = searchParams.get('skillId');
    const currentClient = searchParams.get('currentClient');
    const memberCategory = searchParams.get('memberCategory');
    const minExpertiseLevel = searchParams.get('minExpertiseLevel');
    const location = searchParams.get('location');
    const includeSkills = searchParams.get('include_skills') === 'true';
    const includeProfile = searchParams.get('include_profile') === 'true';

    // Build where clause
    const where: Record<string, unknown> = {};

    // Name filter
    if (name) {
      where.OR = [
        { fullName: { contains: name, mode: 'insensitive' } },
        { email: { contains: name, mode: 'insensitive' } }
      ];
    }

    // Current client filter
    if (currentClient) {
      if (currentClient === 'unassigned') {
        where.currentClient = null;
      } else {
        where.currentClient = currentClient;
      }
    }

    // Member category filter
    if (memberCategory) {
      where.category = memberCategory;
    }

    // Location filter
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Skills-based filters
    if (knowledgeAreaId || skillCategoryId || skillId || minExpertiseLevel) {
      where.skills = {
        some: {
          ...(skillId && { skillId: parseInt(skillId) }),
          ...(minExpertiseLevel && { 
            expertiseLevel: { gte: parseInt(minExpertiseLevel) } 
          }),
          skill: {
            ...(knowledgeAreaId && { knowledgeAreaId: parseInt(knowledgeAreaId) }),
            ...(skillCategoryId && { categoryId: parseInt(skillCategoryId) })
          }
        }
      };
    }

    const members = await prisma.member.findMany({
      where,
      include: {
        profile: includeProfile,
        ...(includeSkills && {
          skills: {
            include: {
              skill: {
                include: {
                  knowledgeArea: true,
                  category: true,
                },
              },
            },
          },
        }),
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