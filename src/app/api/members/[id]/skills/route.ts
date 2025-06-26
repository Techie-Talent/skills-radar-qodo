import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = parseInt(params.id);
    const body = await request.json();
    const { skillId, expertiseLevel, expertiseDescription, assessmentDate } = body;

    if (!skillId || !expertiseLevel) {
      return NextResponse.json(
        { error: 'skillId and expertiseLevel are required' },
        { status: 400 }
      );
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check if member already has this skill
    const existingMemberSkill = await prisma.memberSkill.findUnique({
      where: {
        memberId_skillId: {
          memberId,
          skillId,
        },
      },
    });

    if (existingMemberSkill) {
      return NextResponse.json(
        { error: 'Member already has this skill assigned' },
        { status: 409 }
      );
    }

    // Create the member skill relationship
    const memberSkill = await prisma.memberSkill.create({
      data: {
        memberId,
        skillId,
        expertiseLevel,
        expertiseDescription,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : new Date(),
      },
      include: {
        skill: {
          include: {
            knowledgeArea: true,
            category: true,
            scale: true,
          },
        },
      },
    });

    return NextResponse.json(memberSkill, { status: 201 });
  } catch (error) {
    console.error('Error creating member skill:', error);
    return NextResponse.json(
      { error: 'Failed to assign skill to member' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = parseInt(params.id);

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Get all skills for this member
    const memberSkills = await prisma.memberSkill.findMany({
      where: { memberId },
      include: {
        skill: {
          include: {
            knowledgeArea: true,
            category: true,
            scale: true,
          },
        },
      },
      orderBy: [
        { skill: { knowledgeArea: { name: 'asc' } } },
        { skill: { name: 'asc' } },
      ],
    });

    return NextResponse.json(memberSkills);
  } catch (error) {
    console.error('Error fetching member skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member skills' },
      { status: 500 }
    );
  }
}