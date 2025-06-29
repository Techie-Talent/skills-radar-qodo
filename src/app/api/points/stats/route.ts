import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");

    // Get current active period if no specific period requested
    let targetPeriod;
    if (periodId) {
      targetPeriod = await prisma.pointPeriod.findUnique({
        where: { id: parseInt(periodId) },
      });
    } else {
      targetPeriod = await prisma.pointPeriod.findFirst({
        where: { isActive: true },
        orderBy: { startDate: "desc" },
      });
    }

    if (!targetPeriod) {
      return NextResponse.json(
        { error: "No active period found" },
        { status: 404 }
      );
    }

    // Get all points for the period
    const points = await prisma.point.findMany({
      where: { periodId: targetPeriod.id },
      include: {
        giver: true,
        receiver: true,
      },
    });

    // Calculate statistics
    const totalPointsGiven = points.reduce(
      (sum, point) => sum + point.amount,
      0
    );
    const totalMembers = await prisma.member.count();
    const membersWhoGavePoints = new Set(points.map((p) => p.giverId)).size;
    const membersWhoReceivedPoints = new Set(points.map((p) => p.receiverId))
      .size;

    // Top receivers
    const receiverStats = points.reduce((acc, point) => {
      const receiverId = point.receiverId;
      if (!acc[receiverId]) {
        acc[receiverId] = {
          member: point.receiver,
          totalPoints: 0,
          pointsCount: 0,
        };
      }
      acc[receiverId].totalPoints += point.amount;
      acc[receiverId].pointsCount += 1;
      return acc;
    }, {} as Record<number, { totalPoints: number; pointsCount: number; member: Record<string, string | number | null | Date> }>);

    const topReceivers = Object.values(receiverStats)
      .sort(
        (
          a: (typeof receiverStats)[number],
          b: (typeof receiverStats)[number]
        ) => b.totalPoints - a.totalPoints
      )
      .slice(0, 10);

    // Top givers (by number of allocations)
    const giverStats = points.reduce((acc, point) => {
      const giverId = point.giverId;
      if (!acc[giverId]) {
        acc[giverId] = {
          member: point.giver,
          totalPointsGiven: 0,
          allocationsCount: 0,
        };
      }
      acc[giverId].totalPointsGiven += point.amount;
      acc[giverId].allocationsCount += 1;
      return acc;
    }, {} as Record<number, { totalPointsGiven: number; allocationsCount: number; member: Record<string, string | number | null | Date> }>);

    const topGivers = Object.values(giverStats)
      .sort(
        (a: (typeof giverStats)[number], b: (typeof giverStats)[number]) =>
          b.allocationsCount - a.allocationsCount
      )
      .slice(0, 10);

    // Points distribution by amount
    const pointsDistribution = points.reduce((acc, point) => {
      acc[point.amount] = (acc[point.amount] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Daily points activity
    const dailyActivity = points.reduce((acc, point) => {
      const date = point.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, points: 0, allocations: 0 };
      }
      acc[date].points += point.amount;
      acc[date].allocations += 1;
      return acc;
    }, {} as Record<string, { date: string; points: number; allocations: number }>);

    const dailyActivityArray = Object.values(dailyActivity).sort(
      (a: (typeof dailyActivity)[number], b: (typeof dailyActivity)[number]) =>
        a.date.localeCompare(b.date)
    );

    // Participation rate
    const participationRate =
      totalMembers > 0 ? (membersWhoGavePoints / totalMembers) * 100 : 0;

    // Average points per allocation
    const averagePointsPerAllocation =
      points.length > 0 ? totalPointsGiven / points.length : 0;

    const stats = {
      period: targetPeriod,
      overview: {
        totalPointsGiven,
        totalAllocations: points.length,
        totalMembers,
        membersWhoGavePoints,
        membersWhoReceivedPoints,
        participationRate: Math.round(participationRate * 100) / 100,
        averagePointsPerAllocation:
          Math.round(averagePointsPerAllocation * 100) / 100,
      },
      topReceivers,
      topGivers,
      pointsDistribution,
      dailyActivity: dailyActivityArray,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching points statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
