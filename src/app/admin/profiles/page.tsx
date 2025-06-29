import { PrismaClient } from "@/generated/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import Link from "next/link";
import SidebarLayout from "@/components/layout/sidebar-layout";
import PermissionGuard from "@/components/auth/permission-guard";

const prisma = new PrismaClient();

async function getMembersWithProfiles() {
  const members = await prisma.member.findMany({
    include: {
      profile: true,
      _count: {
        select: {
          skills: true,
          teamMembers: true,
          feedbackReceived: true,
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return members;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function ProfilesAdminPage() {
  const members = await getMembersWithProfiles();

  const publicProfiles = members.filter((m) => m.profile?.isPublic);
  const privateProfiles = members.filter((m) => !m.profile?.isPublic);

  return (
    <SidebarLayout>
      <PermissionGuard permission="members.write">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Public Profiles Management</h1>
            <p className="text-muted-foreground">
              Manage member public profiles and visibility settings
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Public Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {publicProfiles.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Private Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {privateProfiles.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Public Profiles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Public Profiles ({publicProfiles.length})
              </CardTitle>
              <CardDescription>
                Members with public profiles that can be accessed via
                /member/username
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {publicProfiles.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={member.profile?.profileImageUrl || undefined}
                        />
                        <AvatarFallback>
                          {getInitials(member.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {member.fullName || "No Name"}
                          </h3>
                          <Badge variant="secondary">@{member.username}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>{member._count.skills} skills</span>
                          <span>{member._count.teamMembers} teams</span>
                          <span>{member._count.feedbackReceived} feedback</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/member/${member.username}`}
                          target="_blank"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Profile
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/members/${member.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {publicProfiles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No public profiles found. Members need to enable public
                    visibility.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Private Profiles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EyeOff className="h-5 w-5" />
                Private Profiles ({privateProfiles.length})
              </CardTitle>
              <CardDescription>
                Members with private profiles that are not publicly accessible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {privateProfiles.slice(0, 10).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {getInitials(member.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {member.fullName || "No Name"}
                          </h3>
                          {member.username && (
                            <Badge variant="outline">@{member.username}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>{member._count.skills} skills</span>
                          <span>{member._count.teamMembers} teams</span>
                          <span>{member._count.feedbackReceived} feedback</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/members/${member.id}`}>
                          Edit Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {privateProfiles.length > 10 && (
                  <div className="text-center py-4 text-muted-foreground">
                    ... and {privateProfiles.length - 10} more private profiles
                  </div>
                )}
                {privateProfiles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    All members have public profiles enabled.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    </SidebarLayout>
  );
}
