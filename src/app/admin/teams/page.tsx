import { PrismaClient } from '@/generated/prisma'
import SidebarLayout from '@/components/layout/sidebar-layout'
import PermissionGuard from '@/components/auth/permission-guard'
import { TeamsAdminClient } from '@/components/teams-admin-client'

const prisma = new PrismaClient()

async function getTeamsWithDetails() {
  const teams = await prisma.team.findMany({
    include: {
      parentTeam: true,
      subTeams: {
        include: {
          _count: {
            select: {
              members: true
            }
          }
        }
      },
      members: {
        include: {
          member: true
        }
      },
      _count: {
        select: {
          members: true,
          subTeams: true,
          feedback: true
        }
      }
    },
    orderBy: [
      { parentTeamId: 'asc' },
      { name: 'asc' }
    ]
  })

  // Convert Date objects to strings for client component compatibility
  return teams.map(team => ({
    ...team,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    subTeams: team.subTeams.map(subTeam => ({
      ...subTeam,
      createdAt: subTeam.createdAt.toISOString(),
      updatedAt: subTeam.updatedAt.toISOString()
    }))
  }))
}

export default async function TeamsAdminPage() {
  const teams = await getTeamsWithDetails()

  const rootTeams = teams.filter(team => !team.parentTeamId)
  const subTeams = teams.filter(team => team.parentTeamId)
  const totalMembers = teams.reduce((sum, team) => sum + team._count.members, 0)

  return (
    <SidebarLayout>
      <PermissionGuard permission="members.write">
        <TeamsAdminClient 
          teams={teams}
          rootTeams={rootTeams}
          subTeams={subTeams}
          totalMembers={totalMembers}
        />
      </PermissionGuard>
    </SidebarLayout>
  )
}