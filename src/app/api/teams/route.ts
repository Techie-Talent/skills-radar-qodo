import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, parentTeamId } = body

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      )
    }

    // Check if team name already exists
    const existingTeam = await prisma.team.findUnique({
      where: { name: name.trim() }
    })

    if (existingTeam) {
      return NextResponse.json(
        { error: 'A team with this name already exists' },
        { status: 400 }
      )
    }

    // Validate parent team exists if provided
    if (parentTeamId) {
      const parentTeam = await prisma.team.findUnique({
        where: { id: parseInt(parentTeamId) }
      })

      if (!parentTeam) {
        return NextResponse.json(
          { error: 'Parent team not found' },
          { status: 400 }
        )
      }
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        parentTeamId: parentTeamId ? parseInt(parentTeamId) : null,
      },
      include: {
        parentTeam: true,
        _count: {
          select: {
            members: true,
            subTeams: true,
            feedback: true
          }
        }
      }
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeMembers = searchParams.get('includeMembers') === 'true'

    const teams = await prisma.team.findMany({
      include: {
        parentTeam: true,
        subTeams: true,
        ...(includeMembers && {
          members: {
            include: {
              member: true
            }
          }
        }),
        _count: {
          select: {
            members: true,
            subTeams: true,
            feedback: true
          }
        }
      },
      orderBy: [
        { parentTeamId: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}