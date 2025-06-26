import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; skillId: string }> }
) {
  try {
    const { skillId } = await params;
    const memberSkillId = parseInt(skillId);
    const body = await request.json();
    const { expertiseLevel, expertiseDescription, assessmentDate } = body;

    if (!expertiseLevel) {
      return NextResponse.json(
        { error: 'expertiseLevel is required' },
        { status: 400 }
      );
    }

    // Check if member skill exists
    const existingMemberSkill = await prisma.memberSkill.findUnique({
      where: { id: memberSkillId },
    });

    if (!existingMemberSkill) {
      return NextResponse.json(
        { error: 'Member skill not found' },
        { status: 404 }
      );
    }

    // Update the member skill
    const updatedMemberSkill = await prisma.memberSkill.update({
      where: { id: memberSkillId },
      data: {
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

    return NextResponse.json(updatedMemberSkill);
  } catch (error) {
    console.error('Error updating member skill:', error);
    return NextResponse.json(
      { error: 'Failed to update member skill' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; skillId: string }> }
) {
  try {
    const { skillId } = await params;
    const memberSkillId = parseInt(skillId);

    // Check if member skill exists
    const existingMemberSkill = await prisma.memberSkill.findUnique({
      where: { id: memberSkillId },
    });

    if (!existingMemberSkill) {
      return NextResponse.json(
        { error: 'Member skill not found' },
        { status: 404 }
      );
    }

    // Delete the member skill
    await prisma.memberSkill.delete({
      where: { id: memberSkillId },
    });

    return NextResponse.json({ message: 'Member skill removed successfully' });
  } catch (error) {
    console.error('Error deleting member skill:', error);
    return NextResponse.json(
      { error: 'Failed to remove member skill' },
      { status: 500 }
    );
  }
}