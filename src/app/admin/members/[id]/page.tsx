import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { User, Calendar, MapPin, Building, Settings, BookOpen } from 'lucide-react';

async function getMemberWithSkills(id: string) {
  const member = await prisma.member.findUnique({
    where: { id: parseInt(id) },
    include: {
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
        orderBy: [
          { skill: { knowledgeArea: { name: 'asc' } } },
          { skill: { name: 'asc' } },
        ],
      },
    },
  });

  if (!member) {
    notFound();
  }

  return member;
}

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getMemberWithSkills(id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Starter: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      Builder: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      Solver: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      Wizard: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getExpertiseLevelLabel = (level: number) => {
    const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert' };
    return labels[level as keyof typeof labels] || `Level ${level}`;
  };

  const getExpertiseLevelColor = (level: number) => {
    const colors = { 
      1: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
      2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', 
      3: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
      4: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Group skills by knowledge area
  const skillsByKnowledgeArea = member.skills.reduce((acc, memberSkill) => {
    const kaName = memberSkill.skill.knowledgeArea?.name || 'Uncategorized';
    if (!acc[kaName]) acc[kaName] = [];
    acc[kaName].push(memberSkill);
    return acc;
  }, {} as Record<string, typeof member.skills>);

  return (
    <PermissionGuard permission="members.read">
      <SidebarLayout breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Team Members', href: '/members/talent-search' },
        { label: member.fullName || member.email }
      ]}>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{member.fullName || 'Unnamed Member'}</h1>
                <p className="text-muted-foreground mt-2">{member.email}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/admin/members/${member.id}/skills`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Skills
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/admin/members/${member.id}/profile`}>
                    <User className="h-4 w-4 mr-2" />
                    Manage Profile
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/members/talent-search`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Back to Members
                  </Link>
                </Button>
              </div>
            </div>

            {/* Member Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Member Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <Badge className={getCategoryColor(member.category)}>
                      {member.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Hire Date:
                    </span>
                    <span className="text-sm">{formatDate(member.hireDate)}</span>
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

                  {member.currentClient && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        Current Client:
                      </span>
                      <span className="text-sm">{member.currentClient}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Profile Status:</span>
                    <Badge variant={member.profile ? "default" : "secondary"}>
                      {member.profile ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Skills Summary
                  </CardTitle>
                  <CardDescription>
                    Overview of member's skills and expertise
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{member.skills.length}</div>
                      <div className="text-sm text-muted-foreground">Total Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Object.keys(skillsByKnowledgeArea).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Knowledge Areas</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {member.skills.filter(ms => ms.expertiseLevel === 4).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Expert Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {member.skills.filter(ms => ms.expertiseLevel === 3).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Advanced Level</div>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/admin/members/${member.id}/skills`}>
                      View & Manage All Skills
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Skills by Knowledge Area */}
            {member.skills.length > 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Skills by Knowledge Area</h2>
                  <Button asChild variant="outline">
                    <Link href={`/admin/members/${member.id}/skills`}>
                      Manage Skills
                    </Link>
                  </Button>
                </div>

                {Object.entries(skillsByKnowledgeArea).map(([knowledgeAreaName, skills]) => (
                  <Card key={knowledgeAreaName}>
                    <CardHeader>
                      <CardTitle>{knowledgeAreaName}</CardTitle>
                      <CardDescription>
                        {skills.length} skill{skills.length !== 1 ? 's' : ''} in this area
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {skills.slice(0, 6).map(memberSkill => (
                          <div key={memberSkill.id} className="border rounded-lg p-3 space-y-2">
                            <div>
                              <h4 className="font-medium text-sm">{memberSkill.skill.name}</h4>
                              {memberSkill.skill.category && (
                                <p className="text-xs text-muted-foreground">
                                  {memberSkill.skill.category.name}
                                </p>
                              )}
                            </div>
                            
                            {memberSkill.expertiseLevel && (
                              <Badge 
                                size="sm" 
                                className={getExpertiseLevelColor(memberSkill.expertiseLevel)}
                              >
                                {getExpertiseLevelLabel(memberSkill.expertiseLevel)}
                              </Badge>
                            )}
                            
                            {memberSkill.expertiseDescription && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {memberSkill.expertiseDescription}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {skills.length > 6 && (
                        <div className="mt-4 text-center">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/members/${member.id}/skills`}>
                              View {skills.length - 6} more skills in {knowledgeAreaName}
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Profile Information */}
            {member.profile && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Profile Information</h2>
                  <Button asChild variant="outline">
                    <Link href={`/admin/members/${member.id}/profile`}>
                      Edit Profile
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {member.profile.assignments && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Project Assignments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {member.profile.assignments}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {member.profile.teamRoles && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Team Roles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {member.profile.teamRoles}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {member.profile.clientAppreciations && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Client Appreciations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {member.profile.clientAppreciations}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {member.profile.feedback && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Internal Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {member.profile.feedback}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {member.profile.talentPoolPeriods && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Talent Pool Periods</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {member.profile.talentPoolPeriods}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* No Skills State */}
            {member.skills.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium">No Skills Assigned</h3>
                      <p className="text-muted-foreground">
                        This member doesn't have any skills assigned yet.
                      </p>
                    </div>
                    <Button asChild>
                      <Link href={`/admin/members/${member.id}/skills`}>
                        Assign First Skill
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </Suspense>
      </SidebarLayout>
    </PermissionGuard>
  );
}