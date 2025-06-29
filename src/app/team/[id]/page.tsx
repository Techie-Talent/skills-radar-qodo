import { notFound } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
  Building2,
} from "lucide-react";
import { FeedbackForm } from "@/components/feedback-form";
import { PublicOnlyHeader } from "@/components/layout/public-only-header";
import { getServerSession } from "next-auth";
import Link from "next/link";

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTeamById(id: number) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      parentTeam: true,
      subTeams: {
        include: {
          members: {
            include: {
              member: true,
            },
          },
          _count: {
            select: {
              members: true,
              subTeams: true,
            },
          },
        },
      },
      members: {
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      feedback: {
        where: {
          isAnonymous: false,
        },
        include: {
          giver: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          members: true,
          subTeams: true,
          feedback: true,
        },
      },
    },
  });

  return team;
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

async function getCurrentMember(email?: string) {
  if (!email) return null;

  return await prisma.member.findUnique({
    where: { email },
  });
}

export default async function TeamPublicProfile({ params }: PageProps) {
  const { id } = await params;
  const teamId = parseInt(id);

  if (isNaN(teamId)) {
    notFound();
  }

  const team = await getTeamById(teamId);
  const session = await getServerSession();
  const currentMember = await getCurrentMember(
    session?.user?.email || undefined
  );

  if (!team) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicOnlyHeader />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {team.parentTeam && (
                      <>
                        <Link
                          href={`/team/${team.parentTeam.id}`}
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          {team.parentTeam.name}
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </>
                    )}
                    <CardTitle className="text-3xl">{team.name}</CardTitle>
                  </div>
                  {team.description && (
                    <CardDescription className="text-lg mb-4">
                      {team.description}
                    </CardDescription>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {team._count.members} member
                      {team._count.members !== 1 ? "s" : ""}
                    </div>
                    {team._count.subTeams > 0 && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {team._count.subTeams} subteam
                        {team._count.subTeams !== 1 ? "s" : ""}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <FeedbackForm
                    memberId={0} // Not used for team feedback
                    memberName=""
                    teamId={team.id}
                    teamName={team.name}
                    currentMemberId={currentMember?.id}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Team Members Section */}
            {team.members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members ({team.members.length})
                  </CardTitle>
                  <CardDescription>
                    Current team members and their roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {team.members.map((teamMember) => (
                      <div
                        key={teamMember.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={
                                teamMember.member.profile?.profileImageUrl ||
                                undefined
                              }
                            />
                            <AvatarFallback>
                              {getInitials(teamMember.member.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              {teamMember.member.username ? (
                                <Link
                                  href={`/member/${teamMember.member.username}`}
                                  className="font-medium hover:underline"
                                >
                                  {teamMember.member.fullName ||
                                    teamMember.member.email}
                                </Link>
                              ) : (
                                <span className="font-medium">
                                  {teamMember.member.fullName ||
                                    teamMember.member.email}
                                </span>
                              )}
                              {teamMember.role && (
                                <Badge variant="outline">
                                  {teamMember.role}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Joined{" "}
                              {new Date(
                                teamMember.joinedAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <FeedbackForm
                            memberId={teamMember.member.id}
                            memberName={
                              teamMember.member.fullName ||
                              teamMember.member.email
                            }
                            currentMemberId={currentMember?.id}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subteams Section */}
            {team.subTeams.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Subteams ({team.subTeams.length})
                  </CardTitle>
                  <CardDescription>
                    Teams that are part of this team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {team.subTeams.map((subTeam) => (
                      <Link
                        key={subTeam.id}
                        href={`/team/${subTeam.id}`}
                        className="block"
                      >
                        <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{subTeam.name}</h4>
                              {subTeam.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {subTeam.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {subTeam._count.members}
                              </div>
                              {subTeam._count.subTeams > 0 && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  {subTeam._count.subTeams}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Feedback */}
            {team.feedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Team Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {team.feedback.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="border-l-2 border-muted pl-4"
                      >
                        <p className="text-sm mb-2">{feedback.content}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{feedback.giver?.fullName || "Anonymous"}</span>
                          <span>
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {feedback.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${
                                  i < feedback.rating!
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link
                    href="/teams"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to All Teams
                  </Link>
                  {team.parentTeam && (
                    <Link
                      href={`/team/${team.parentTeam.id}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ↑ Parent Team: {team.parentTeam.name}
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
