import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { giverId, receiverId, amount, message, periodId } = body;

    // Validate required fields
    if (!giverId || !receiverId || !amount || !periodId) {
      return NextResponse.json(
        { error: "giverId, receiverId, amount, and periodId are required" },
        { status: 400 }
      );
    }

    // Validate amount
    if (![1, 2, 3].includes(amount)) {
      return NextResponse.json(
        { error: "Amount must be 1, 2, or 3 points" },
        { status: 400 }
      );
    }

    // Prevent self-assignment
    if (giverId === receiverId) {
      return NextResponse.json(
        { error: "Cannot give points to yourself" },
        { status: 400 }
      );
    }

    // Check if period exists and is active
    const period = await prisma.pointPeriod.findUnique({
      where: { id: parseInt(periodId) },
    });

    if (!period) {
      return NextResponse.json(
        { error: "Point period not found" },
        { status: 400 }
      );
    }

    if (!period.isActive || period.isClosed) {
      return NextResponse.json(
        { error: "Point period is not active or has been closed" },
        { status: 400 }
      );
    }

    // Check if giver and receiver exist
    const [giver, receiver] = await Promise.all([
      prisma.member.findUnique({ where: { id: parseInt(giverId) } }),
      prisma.member.findUnique({ where: { id: parseInt(receiverId) } }),
    ]);

    if (!giver || !receiver) {
      return NextResponse.json(
        { error: "Giver or receiver not found" },
        { status: 400 }
      );
    }

    // Check if points already given to this receiver in this period
    const existingPoints = await prisma.point.findUnique({
      where: {
        giverId_receiverId_periodId: {
          giverId: parseInt(giverId),
          receiverId: parseInt(receiverId),
          periodId: parseInt(periodId),
        },
      },
    });

    if (existingPoints) {
      return NextResponse.json(
        { error: "Points already given to this member in this period" },
        { status: 400 }
      );
    }

    // Check total points given by this member in this period
    const totalPointsGiven = await prisma.point.aggregate({
      where: {
        giverId: parseInt(giverId),
        periodId: parseInt(periodId),
      },
      _sum: {
        amount: true,
      },
    });

    const currentTotal = totalPointsGiven._sum.amount || 0;
    if (currentTotal + amount > period.pointsPerMember) {
      return NextResponse.json(
        {
          error: `Cannot exceed ${period.pointsPerMember} points per period. You have ${currentTotal} points remaining.`,
        },
        { status: 400 }
      );
    }

    // Create the point allocation
    const point = await prisma.point.create({
      data: {
        amount: parseInt(amount),
        message: message?.trim() || null,
        giverId: parseInt(giverId),
        receiverId: parseInt(receiverId),
        periodId: parseInt(periodId),
      },
      include: {
        giver: true,
        receiver: true,
        period: true,
      },
    });

    return NextResponse.json(point, { status: 201 });
  } catch (error) {
    console.error("Error creating point allocation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");
    const giverId = searchParams.get("giverId");
    const receiverId = searchParams.get("receiverId");

    const whereClause: Prisma.PointWhereInput = {};

    if (periodId) {
      whereClause.periodId = parseInt(periodId);
    }
    if (giverId) {
      whereClause.giverId = parseInt(giverId);
    }
    if (receiverId) {
      whereClause.receiverId = parseInt(receiverId);
    }

    const points = await prisma.point.findMany({
      where: whereClause,
      include: {
        giver: true,
        receiver: true,
        period: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(points);
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
