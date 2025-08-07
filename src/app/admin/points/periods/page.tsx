import { Suspense } from "react";
import SidebarLayout from "@/components/layout/sidebar-layout";
import PermissionGuard from "@/components/auth/permission-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { Calendar, Users, Gift } from "lucide-react";
import Link from "next/link";
import { CreatePeriodDialog } from "./create-period-dialog";

async function getPointPeriods() {
  const periods = await prisma.pointPeriod.findMany({
    include: {
      _count: {
        select: {
          points: true,
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return periods;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString();
}

function getStatusBadge(
  period: Awaited<ReturnType<typeof getPointPeriods>>[number]
) {
  if (period.isClosed) {
    return <Badge variant="secondary">Closed</Badge>;
  }
  if (period.isActive) {
    const now = new Date();
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);

    if (now < start) {
      return <Badge variant="outline">Upcoming</Badge>;
    } else if (now > end) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  }
  return <Badge variant="secondary">Inactive</Badge>;
}

export default async function PointPeriodsPage() {
  const periods = await getPointPeriods();

  const activePeriods = periods.filter((p) => p.isActive && !p.isClosed);
  const totalPoints = periods.reduce(
    (sum, period) => sum + period._count.points,
    0
  );

  return (
    <PermissionGuard permission="admin.manage">
      <SidebarLayout
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Points", href: "/admin/points" },
          { label: "Periods" },
        ]}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">Point Periods</h1>
                <p className="text-muted-foreground mt-2">
                  Manage point allocation periods for team recognition
                </p>
              </div>
              <CreatePeriodDialog />
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Periods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{periods.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Periods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {activePeriods.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Points Given
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPoints}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Points/Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {periods.length > 0
                      ? Math.round(totalPoints / periods.length)
                      : 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Periods List */}
            <div className="space-y-4">
              {periods.length > 0 ? (
                periods.map((period) => (
                  <Card key={period.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">
                              {period.name}
                            </CardTitle>
                            {getStatusBadge(period)}
                          </div>
                          <CardDescription>
                            {formatDate(period.startDate)} -{" "}
                            {formatDate(period.endDate)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/points/periods/${period.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Points per member:
                          </span>
                          <span className="font-medium">
                            {period.pointsPerMember}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Points given:
                          </span>
                          <span className="font-medium">
                            {period._count.points}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Duration:
                          </span>
                          <span className="font-medium">
                            {Math.ceil(
                              (new Date(period.endDate).getTime() -
                                new Date(period.startDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            days
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">
                            {period.isClosed
                              ? "Closed"
                              : period.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Point Periods
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first point period to start recognizing team
                      members.
                    </p>
                    <CreatePeriodDialog />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Suspense>
      </SidebarLayout>
    </PermissionGuard>
  );
}
