'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Users, Edit, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { CreateTeamDialog } from '@/components/create-team-dialog'

interface TeamMember {
  id: number
  member: {
    id: number
    fullName: string | null
    email: string
  }
  role: string | null
}

interface SubTeam {
  id: number
  name: string
  _count: {
    members: number
  }
}

interface Team {
  id: number
  name: string
  description: string | null
  parentTeamId: number | null
  createdAt: string
  parentTeam: {
    id: number
    name: string
  } | null
  members: TeamMember[]
  subTeams: SubTeam[]
  _count: {
    members: number
    subTeams: number
    feedback: number
  }
}

interface TeamsAdminClientProps {
  teams: Team[]
  rootTeams: Team[]
  subTeams: Team[]
  totalMembers: number
}

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TeamsAdminClient({ teams, rootTeams, subTeams, totalMembers }: TeamsAdminClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Teams Management</h1>
          <p className="text-muted-foreground">
            Manage teams, team members, and organizational structure
          </p>
        </div>
        <CreateTeamDialog teams={teams} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Root Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rootTeams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sub Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subTeams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            All Teams
          </CardTitle>
          <CardDescription>
            Manage team structure and member assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {team.parentTeam && (
                        <Badge variant="outline" className="text-xs">
                          {team.parentTeam.name}
                        </Badge>
                      )}
                      <h3 className="font-semibold text-lg">{team.name}</h3>
                      {team._count.subTeams > 0 && (
                        <Badge variant="secondary">
                          {team._count.subTeams} sub-teams
                        </Badge>
                      )}
                    </div>
                    {team.description && (
                      <p className="text-muted-foreground mb-2">{team.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{team._count.members} members</span>
                      <span>{team._count.feedback} feedback items</span>
                      <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/teams" target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Public
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Team Members */}
                {team.members.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Members ({team.members.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {team.members.map((teamMember) => (
                        <div key={teamMember.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(teamMember.member.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium truncate">
                                {teamMember.member.fullName || teamMember.member.email}
                              </span>
                              {teamMember.role && (
                                <Badge variant="outline" className="text-xs">
                                  {teamMember.role}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub Teams */}
                {team.subTeams.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Sub Teams ({team.subTeams.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {team.subTeams.map((subTeam) => (
                        <div key={subTeam.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="font-medium">{subTeam.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {subTeam._count.members} members
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {teams.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Teams Found</h3>
                <p>Create your first team to get started with team management.</p>
                <div className="mt-4">
                  <CreateTeamDialog teams={teams} trigger={
                    <Button>
                      <Building2 className="h-4 w-4 mr-2" />
                      Create First Team
                    </Button>
                  } />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}