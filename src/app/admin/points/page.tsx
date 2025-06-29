import { Suspense } from 'react';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Gift, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

async function getPointsOverview() {
  const [periods, recentPoints, topReceivers, topGivers] = await Promise.all([
    // Get periods with counts
    prisma.pointPeriod.findMany({
      include: {
        _count: {
          select: {
            points: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      },
      take: 5
    }),

    // Get recent points
    prisma.point.findMany({
      include: {
        giver: true,
        receiver: true,
        period: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    }),

    // Get top point receivers
    prisma.point.groupBy({
      by: ['receiverId'],
      _sum: {
        amount: true
      },
      _count: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 5
    }),

    // Get top point givers
    prisma.point.groupBy({
      by: ['giverId'],
      _sum: {
        amount: true
      },
      _count: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 5
    })
  ]);

  // Get member details for top receivers and givers
  const receiverIds = topReceivers.map(r => r.receiverId);
  const giverIds = topGivers.map(g => g.giverId);
  const memberIds = [...new Set([...receiverIds, ...giverIds])];

  const members = await prisma.member.findMany({
    where: {
      id: {
        in: memberIds
      }
    },
    select: {
      id: true,
      fullName: true,
      email: true
    }
  });

  const memberMap = members.reduce((acc, member) => {
    acc[member.id] = member;
    return acc;
  }, {} as Record<number, typeof members[0]>);

  const topReceiversWithNames = topReceivers.map(receiver => ({
    ...receiver,
    member: memberMap[receiver.receiverId]
  }));

  const topGiversWithNames = topGivers.map(giver => ({
    ...giver,
    member: memberMap[giver.giverId]
  }));

  const activePeriods = periods.filter(p => p.isActive && !p.isClosed);
  const totalPoints = periods.reduce((sum, period) => sum + period._count.points, 0);

  return {
    periods,
    recentPoints,
    topReceivers: topReceiversWithNames,
    topGivers: topGiversWithNames,
    activePeriods,
    totalPoints
  };
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString();
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString();
}

export default async function PointsOverviewPage() {
  const data = await getPointsOverview();

  return (
    <PermissionGuard permission="admin.read">
      <SidebarLayout breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Admin', href: '/admin' },
        { label: 'Points System' }
      ]}>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">Points System</h1>
                <p className="text-muted-foreground mt-2">
                  Manage team recognition and point allocation
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/admin/points/periods">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Periods
                  </Link>
                </Button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Periods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.periods.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Periods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{data.activePeriods.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Points Given</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalPoints}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.recentPoints.length}</div>
                  <p className="text-xs text-muted-foreground">Last 10 points</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Recent Points Activity
                  </CardTitle>
                  <CardDescription>
                    Latest point allocations across all periods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recentPoints.length > 0 ? (
                      data.recentPoints.map((point) => (
                        <div key={point.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {point.giver?.fullName || point.giver?.email}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium">
                                {point.receiver?.fullName || point.receiver?.email}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {point.message && (
                                <p className="mb-1">&ldquo;{point.message}&rdquo;</p>
                              )}
                              <p>{formatDateTime(point.createdAt)} • {point.period?.name}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {point.amount} {point.amount === 1 ? 'point' : 'points'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No points have been given yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Recipients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Point Recipients
                  </CardTitle>
                  <CardDescription>
                    Team members who have received the most points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.topReceivers.length > 0 ? (
                      data.topReceivers.map((receiver, index) => (
                        <div key={receiver.receiverId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">
                                {receiver.member?.fullName || receiver.member?.email || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {receiver._count.amount} allocation{receiver._count.amount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {receiver._sum.amount} points
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No points have been received yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Periods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Periods
                </CardTitle>
                <CardDescription>
                  Latest point allocation periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.periods.length > 0 ? (
                    data.periods.map((period) => (
                      <div key={period.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{period.name}</span>
                            <Badge variant={period.isActive && !period.isClosed ? "default" : "secondary"}>
                              {period.isClosed ? 'Closed' : period.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(period.startDate)} - {formatDate(period.endDate)} • 
                            {period.pointsPerMember} points per member
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{period._count.points}</p>
                          <p className="text-xs text-muted-foreground">points given</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Periods Created</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first point period to start team recognition.
                      </p>
                      <Button asChild>
                        <Link href="/admin/points/periods">
                          Create First Period
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </Suspense>
      </SidebarLayout>
    </PermissionGuard>
  );
}