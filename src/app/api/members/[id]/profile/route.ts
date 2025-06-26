import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = parseInt(params.id);

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        profile: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(member.profile);
  } catch (error) {
    console.error('Error fetching member profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = parseInt(params.id);
    const body = await request.json();
    const { assignments, teamRoles, clientAppreciations, feedback, talentPoolPeriods } = body;

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

    // Upsert the profile (create if doesn't exist, update if it does)
    const profile = await prisma.memberProfile.upsert({
      where: { memberId },
      create: {
        memberId,
        assignments: assignments || null,
        teamRoles: teamRoles || null,
        clientAppreciations: clientAppreciations || null,
        feedback: feedback || null,
        talentPoolPeriods: talentPoolPeriods || null,
      },
      update: {
        assignments: assignments || null,
        teamRoles: teamRoles || null,
        clientAppreciations: clientAppreciations || null,
        feedback: feedback || null,
        talentPoolPeriods: talentPoolPeriods || null,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating member profile:', error);
    return NextResponse.json(
      { error: 'Failed to update member profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete the profile if it exists
    const existingProfile = await prisma.memberProfile.findUnique({
      where: { memberId },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    await prisma.memberProfile.delete({
      where: { memberId },
    });

    return NextResponse.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting member profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete member profile' },
      { status: 500 }
    );
  }
}