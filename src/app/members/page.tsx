import { PrismaClient } from '@/generated/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PublicHeader } from '@/components/layout/public-header'
import { Users, MapPin, Calendar, Building2 } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

async function getPublicMembers() {
  const members = await prisma.member.findMany({
    where: {
      profile: {
        isPublic: true
      },
      username: {
        not: null
      }
    },
    include: {
      profile: true,
      teamMembers: {
        include: {
          team: true
        }
      },
      _count: {
        select: {
          skills: true
        }
      }
    },
    orderBy: {
      fullName: 'asc'
    }
  })

  return members
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

function getCategoryColor(category: string | null): string {
  if (!category) return "bg-muted text-muted-foreground";
  const colors = {
    Starter: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    Builder: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    Solver: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    Wizard: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  };
  return (
    colors[category as keyof typeof colors] || "bg-muted text-muted-foreground"
  );
}

export default async function PublicMembersPage() {
  const members = await getPublicMembers()

  const totalMembers = members.length
  const categories = [...new Set(members.map(m => m.category).filter(Boolean))]
  const locations = [...new Set(members.map(m => m.location).filter(Boolean))]

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Team Members</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Meet our talented team members and explore their skills and expertise
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Public Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMembers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{locations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {members.reduce((sum, member) => sum + member._count.skills, 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Link key={member.id} href={`/member/${member.username}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.profile?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-lg">
                        {getInitials(member.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {member.fullName || "No Name"}
                      </CardTitle>
                      <CardDescription>
                        {member.profile?.bio || "Professional at Techie Talent"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <Badge className={getCategoryColor(member.category)}>
                        {member.category || "Unknown"}
                      </Badge>
                    </div>
                    
                    {member.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Location:
                        </span>
                        <span className="text-sm">{member.location}</span>
                      </div>
                    )}
                    
                    {member.hireDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined:
                        </span>
                        <span className="text-sm">
                          {new Date(member.hireDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Skills:</span>
                      <span className="text-sm font-medium">{member._count.skills}</span>
                    </div>
                    
                    {member.teamMembers.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Teams:
                        </span>
                        <span className="text-sm">{member.teamMembers.length}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {members.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Public Profiles</h3>
              <p className="text-muted-foreground">
                No team members have made their profiles public yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}