'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Users, 
  FileText, 
  Database,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ImportStats {
  totalMembers: number;
  membersWithProfiles: number;
  membersWithoutProfiles: number;
  totalSkills: number;
  memberSkillsCount: number;
}

interface ImportsClientProps {
  importStats: ImportStats;
}

export default function ImportsClient({ importStats }: ImportsClientProps) {
  const profileCompletionRate = importStats.totalMembers > 0 
    ? Math.round((importStats.membersWithProfiles / importStats.totalMembers) * 100)
    : 0;

  const avgSkillsPerMember = importStats.totalMembers > 0
    ? Math.round(importStats.memberSkillsCount / importStats.totalMembers)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Data Imports</h1>
        <p className="text-muted-foreground mt-2">
          Centralized hub for importing member data, profiles, and skills
        </p>
      </div>

      {/* Current Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{profileCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {importStats.membersWithProfiles} of {importStats.totalMembers} complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Total Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importStats.totalSkills}</div>
            <p className="text-xs text-muted-foreground">
              Available in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Skills/Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgSkillsPerMember}</div>
            <p className="text-xs text-muted-foreground">
              {importStats.memberSkillsCount} total assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Import Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member Import */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Import Members
            </CardTitle>
            <CardDescription>
              Bulk import team member information from CSV files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Basic member information (name, email, hire date)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Categories and locations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Client assignments</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <Badge variant="secondary" className="text-xs">
                {importStats.membersWithoutProfiles > 0 && (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {importStats.membersWithoutProfiles} incomplete profiles
              </Badge>
              <Button asChild>
                <Link href="/admin/members/import">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Members
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Import */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-600" />
              Import Profiles
            </CardTitle>
            <CardDescription>
              Bulk import detailed member profiles and career information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Project assignments and roles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Client appreciations and feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Talent pool periods</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <Badge variant="secondary" className="text-xs">
                {profileCompletionRate}% completion rate
              </Badge>
              <Button asChild>
                <Link href="/admin/members/import-profiles">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Profiles
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and navigation shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <Link href="/members/talent-search">
                <Users className="h-4 w-4 mr-2" />
                View All Members
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/skills">
                <Database className="h-4 w-4 mr-2" />
                Manage Skills
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/knowledge-areas">
                <TrendingUp className="h-4 w-4 mr-2" />
                Knowledge Areas
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}