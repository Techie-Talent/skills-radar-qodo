import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, startDate, endDate, pointsPerMember = 3 } = body

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'name, startDate, and endDate are required' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Check for overlapping periods
    const overlappingPeriod = await prisma.pointPeriod.findFirst({
      where: {
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } }
            ]
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } }
            ]
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          }
        ]
      }
    })

    if (overlappingPeriod) {
      return NextResponse.json(
        { error: 'Period overlaps with existing period' },
        { status: 400 }
      )
    }

    // Create the period
    const period = await prisma.pointPeriod.create({
      data: {
        name: name.trim(),
        startDate: start,
        endDate: end,
        pointsPerMember: parseInt(pointsPerMember),
        isActive: true,
        isClosed: false
      },
      include: {
        _count: {
          select: {
            points: true
          }
        }
      }
    })

    return NextResponse.json(period, { status: 201 })
  } catch (error) {
    console.error('Error creating point period:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    const periods = await prisma.pointPeriod.findMany({
      include: {
        _count: {
          select: {
            points: true
          }
        },
        ...(includeStats && {
          points: {
            include: {
              giver: true,
              receiver: true
            }
          }
        })
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json(periods)
  } catch (error) {
    console.error('Error fetching point periods:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isActive, isClosed } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Period ID is required' },
        { status: 400 }
      )
    }

    const period = await prisma.pointPeriod.update({
      where: { id: parseInt(id) },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof isClosed === 'boolean' && { isClosed }),
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            points: true
          }
        }
      }
    })

    return NextResponse.json(period)
  } catch (error) {
    console.error('Error updating point period:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}