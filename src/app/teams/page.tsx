import { PrismaClient } from "@/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamCard } from "@/components/team-card";
import { PublicHeader } from "@/components/layout/public-header";
import { Users, Building2 } from "lucide-react";

const prisma = new PrismaClient();

async function getTeamsWithHierarchy() {
  const teams = await prisma.team.findMany({
    include: {
      parentTeam: true,
      subTeams: {
        include: {
          members: {
            include: {
              member: true,
            },
          },
        },
      },
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
    orderBy: [{ parentTeamId: "asc" }, { name: "asc" }],
  });

  // Organize teams by hierarchy
  const rootTeams = teams.filter((team) => !team.parentTeamId);
  const teamsByParent = teams.reduce((acc, team) => {
    if (team.parentTeamId) {
      if (!acc[team.parentTeamId]) acc[team.parentTeamId] = [];
      acc[team.parentTeamId].push(team);
    }
    return acc;
  }, {} as Record<number, typeof teams>);

  return { rootTeams, teamsByParent, allTeams: teams };
}

function TeamHierarchy({
  team,
  subTeams,
  teamsByParent,
  level = 0,
}: {
  team: Awaited<ReturnType<typeof getTeamsWithHierarchy>>["rootTeams"][number];
  subTeams: Awaited<ReturnType<typeof getTeamsWithHierarchy>>["rootTeams"];
  teamsByParent: Awaited<ReturnType<typeof getTeamsWithHierarchy>>["teamsByParent"];
  level?: number;
}) {
  const indent = level * 24;

  return (
    <div style={{ marginLeft: `${indent}px` }}>
      <div className="mb-4">
        <TeamCard team={team} showMembers={true} showFeedbackButton={true} />
      </div>

      {subTeams.map((subTeam) => (
        <TeamHierarchy
          key={subTeam.id}
          team={subTeam}
          subTeams={teamsByParent[subTeam.id] || []}
          teamsByParent={teamsByParent}
          level={level + 1}
        />
      ))}
    </div>
  );
}

export default async function TeamsPage() {
  const { rootTeams, teamsByParent, allTeams } = await getTeamsWithHierarchy();

  const totalMembers = allTeams.reduce(
    (sum, team) => sum + team._count.members,
    0
  );
  const totalTeams = allTeams.length;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Teams</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Explore our team structure and connect with team members
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeams}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Root Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rootTeams.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMembers}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Teams Hierarchy */}
        <div className="space-y-8">
          {rootTeams.length > 0 ? (
            rootTeams.map((rootTeam) => (
              <div key={rootTeam.id} className="space-y-4">
                <TeamHierarchy
                  team={rootTeam}
                  subTeams={teamsByParent[rootTeam.id] || []}
                  teamsByParent={teamsByParent}
                />
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Teams Found</h3>
                <p className="text-muted-foreground">
                  Teams will appear here once they are created.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
