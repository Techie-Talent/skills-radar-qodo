import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, rating, isAnonymous, receiverId, teamId } = body

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Ensure either receiverId or teamId is provided, but not both
    if ((!receiverId && !teamId) || (receiverId && teamId)) {
      return NextResponse.json(
        { error: 'Either receiverId or teamId must be provided, but not both' },
        { status: 400 }
      )
    }

    // Validate rating if provided
    if (rating !== null && rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // For now, we'll create feedback without a giver (anonymous by default)
    // In a real app, you'd get the giver from the authenticated session
    const feedback = await prisma.feedback.create({
      data: {
        content: content.trim(),
        rating: rating || null,
        isAnonymous: isAnonymous || true, // Default to anonymous for public feedback
        giverId: null, // Would be set from authenticated user session
        receiverId: receiverId || null,
        teamId: teamId || null,
      },
      include: {
        giver: true,
        receiver: true,
        team: true,
      }
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const teamId = searchParams.get('teamId')
    const limit = parseInt(searchParams.get('limit') || '10')

    let feedback

    if (memberId) {
      feedback = await prisma.feedback.findMany({
        where: {
          receiverId: parseInt(memberId)
        },
        include: {
          giver: true,
          receiver: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })
    } else if (teamId) {
      feedback = await prisma.feedback.findMany({
        where: {
          teamId: parseInt(teamId)
        },
        include: {
          giver: true,
          team: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })
    } else {
      return NextResponse.json(
        { error: 'Either memberId or teamId parameter is required' },
        { status: 400 }
      )
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}