import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { FeedbackForm } from './feedback-form'

interface TeamMember {
  id: number
  member: {
    id: number
    fullName: string | null
    username: string | null
    email: string
  }
  role: string | null
}

interface Team {
  id: number
  name: string
  description: string | null
  parentTeam: {
    id: number
    name: string
  } | null
  members: TeamMember[]
}

interface TeamCardProps {
  team: Team
  memberRole?: string | null
  showMembers?: boolean
  showFeedbackButton?: boolean
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

export function TeamCard({ team, memberRole, showMembers = false, showFeedbackButton = true }: TeamCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
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
              <Link href={`/team/${team.id}`}>
                <CardTitle className="text-lg hover:underline cursor-pointer">{team.name}</CardTitle>
              </Link>
            </div>
            {team.description && (
              <CardDescription>{team.description}</CardDescription>
            )}
            {memberRole && (
              <Badge variant="secondary" className="mt-2">
                {memberRole}
              </Badge>
            )}
          </div>
          {showFeedbackButton && (
            <FeedbackForm 
              memberId={0} // Not used for team feedback
              memberName=""
              teamId={team.id}
              teamName={team.name}
            />
          )}
        </div>
      </CardHeader>
      
      {showMembers && team.members.length > 0 && (
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Team Members ({team.members.length})
            </div>
            <div className="grid gap-2">
              {team.members.map((teamMember) => (
                <div key={teamMember.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
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
                            {teamMember.member.fullName || teamMember.member.email}
                          </Link>
                        ) : (
                          <span className="font-medium">
                            {teamMember.member.fullName || teamMember.member.email}
                          </span>
                        )}
                        {teamMember.role && (
                          <Badge variant="outline" className="text-xs">
                            {teamMember.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <FeedbackForm 
                    memberId={teamMember.member.id}
                    memberName={teamMember.member.fullName || teamMember.member.email}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}