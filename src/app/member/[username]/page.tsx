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
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, MapPin, Calendar, Users } from "lucide-react";
import { FeedbackForm } from "@/components/feedback-form";
import { TeamCard } from "@/components/team-card";
import { PublicOnlyHeader } from "@/components/layout/public-only-header";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

async function getMemberByUsername(username: string) {
  const member = await prisma.member.findUnique({
    where: { username },
    include: {
      profile: true,
      skills: {
        include: {
          skill: {
            include: {
              knowledgeArea: true,
              category: true,
              scale: true,
            },
          },
        },
      },
      teamMembers: {
        include: {
          team: {
            include: {
              parentTeam: true,
              members: {
                include: {
                  member: true,
                },
              },
            },
          },
        },
      },
      feedbackReceived: {
        where: {
          isAnonymous: false,
        },
        include: {
          giver: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });

  return member;
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

function getExpertiseColor(level: number): string {
  switch (level) {
    case 1:
      return "bg-red-500";
    case 2:
      return "bg-yellow-500";
    case 3:
      return "bg-blue-500";
    case 4:
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

function getExpertiseLabel(level: number): string {
  switch (level) {
    case 1:
      return "Beginner";
    case 2:
      return "Intermediate";
    case 3:
      return "Advanced";
    case 4:
      return "Expert";
    default:
      return "Unknown";
  }
}

async function getCurrentMember(email?: string) {
  if (!email) return null;

  return await prisma.member.findUnique({
    where: { email },
  });
}

export default async function PublicMemberProfile({ params }: PageProps) {
  const { username } = await params;
  const member = await getMemberByUsername(username);
  const session = await getServerSession();
  const currentMember = await getCurrentMember(
    session?.user?.email || undefined
  );

  if (!member || !member.profile?.isPublic) {
    notFound();
  }

  const profile = member.profile;
  const isAuthenticated = !!session;
  const canGivePoints =
    isAuthenticated && currentMember && currentMember.id !== member.id;

  return (
    <div className="min-h-screen bg-background">
      <PublicOnlyHeader />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.profileImageUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(member.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">
                    {member.fullName}
                  </CardTitle>
                  <CardDescription className="text-lg mb-4">
                    {profile.bio || "Professional at Techie Talent"}
                  </CardDescription>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {member.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {member.location}
                      </div>
                    )}
                    {member.hireDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(member.hireDate).toLocaleDateString()}
                      </div>
                    )}
                    {member.category && (
                      <Badge variant="secondary">{member.category}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <FeedbackForm
                    memberId={member.id}
                    memberName={member.fullName || "Member"}
                    currentMemberId={currentMember?.id}
                    showPointsButton={canGivePoints} // Show points button only if authenticated and different user
                  />
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Section */}
            {profile.showSkills && member.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                  <CardDescription>
                    Technical skills and proficiency levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(
                      member.skills.reduce((acc, memberSkill) => {
                        const category =
                          memberSkill.skill.category?.name || "Other";
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(memberSkill);
                        return acc;
                      }, {} as Record<string, typeof member.skills>)
                    ).map(([category, skills]) => (
                      <div key={category}>
                        <h4 className="font-semibold mb-3">{category}</h4>
                        <div className="grid gap-3">
                          {skills.map((memberSkill) => (
                            <div
                              key={memberSkill.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    {memberSkill.skill.name}
                                  </span>
                                  {memberSkill.expertiseLevel && (
                                    <Badge
                                      variant="secondary"
                                      className={`text-white ${getExpertiseColor(
                                        memberSkill.expertiseLevel
                                      )}`}
                                    >
                                      {getExpertiseLabel(
                                        memberSkill.expertiseLevel
                                      )}
                                    </Badge>
                                  )}
                                </div>
                                {memberSkill.expertiseLevel && (
                                  <Progress
                                    value={
                                      (memberSkill.expertiseLevel / 4) * 100
                                    }
                                    className="h-2"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teams Section */}
            {profile.showTeamRoles && member.teamMembers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Teams
                  </CardTitle>
                  <CardDescription>
                    Current team memberships and roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {member.teamMembers.map((teamMember) => (
                      <TeamCard
                        key={teamMember.id}
                        team={teamMember.team}
                        memberRole={teamMember.role}
                        showMembers={true}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assignments Section */}
            {profile.showAssignments && profile.assignments && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">{profile.assignments}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Appreciations */}
            {profile.showAppreciations && profile.clientAppreciations && (
              <Card>
                <CardHeader>
                  <CardTitle>Client Appreciations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none text-sm">
                    {profile.clientAppreciations}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Feedback */}
            {profile.showFeedback && member.feedbackReceived.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recent Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {member.feedbackReceived.map((feedback) => (
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

            {/* Talent Pool Periods */}
            {profile.showTalentPool && profile.talentPoolPeriods && (
              <Card>
                <CardHeader>
                  <CardTitle>Talent Pool History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none text-sm">
                    {profile.talentPoolPeriods}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
