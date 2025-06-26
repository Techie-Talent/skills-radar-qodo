'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, User, Briefcase, Heart, MessageSquare, Clock, ArrowLeft } from 'lucide-react';

interface Member {
  id: number;
  email: string;
  fullName: string | null;
  category: string | null;
  profile: {
    id: number;
    assignments: string | null;
    teamRoles: string | null;
    clientAppreciations: string | null;
    feedback: string | null;
    talentPoolPeriods: string | null;
  } | null;
}

interface MemberProfileClientProps {
  member: Member;
}

export default function MemberProfileClient({ member }: MemberProfileClientProps) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    assignments: member.profile?.assignments || '',
    teamRoles: member.profile?.teamRoles || '',
    clientAppreciations: member.profile?.clientAppreciations || '',
    feedback: member.profile?.feedback || '',
    talentPoolPeriods: member.profile?.talentPoolPeriods || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/members/${member.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update profile');
      }
    } catch {
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-muted text-muted-foreground';
    const colors = {
      Starter: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      Builder: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      Solver: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      Wizard: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const hasChanges = () => {
    const original = {
      assignments: member.profile?.assignments || '',
      teamRoles: member.profile?.teamRoles || '',
      clientAppreciations: member.profile?.clientAppreciations || '',
      feedback: member.profile?.feedback || '',
      talentPoolPeriods: member.profile?.talentPoolPeriods || '',
    };
    
    return JSON.stringify(profileData) !== JSON.stringify(original);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Member Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage detailed profile information for {member.fullName || member.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/members/${member.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Member
            </Link>
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !hasChanges()}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      {/* Member Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Member Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Name</Label>
              <p className="font-medium">{member.fullName || 'No Name'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium">{member.email}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Category</Label>
              <div className="mt-1">
                <Badge className={getCategoryColor(member.category)}>
                  {member.category || 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Profile Status</h3>
              <p className="text-sm text-muted-foreground">
                Current profile completion status
              </p>
            </div>
            <Badge variant={member.profile ? "default" : "secondary"}>
              {member.profile ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Profile Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Project Assignments
            </CardTitle>
            <CardDescription>
              Track project assignments and responsibilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter project assignments, roles, and responsibilities..."
              value={profileData.assignments}
              onChange={(e) => updateField('assignments', e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              You can use JSON format or plain text to describe assignments
            </p>
          </CardContent>
        </Card>

        {/* Team Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Team Roles
            </CardTitle>
            <CardDescription>
              Document team roles and leadership positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter team roles, leadership positions, and team contributions..."
              value={profileData.teamRoles}
              onChange={(e) => updateField('teamRoles', e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Include roles like Tech Lead, Scrum Master, Mentor, etc.
            </p>
          </CardContent>
        </Card>

        {/* Client Appreciations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Client Appreciations
            </CardTitle>
            <CardDescription>
              Record client feedback and appreciations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter client appreciations, testimonials, and positive feedback..."
              value={profileData.clientAppreciations}
              onChange={(e) => updateField('clientAppreciations', e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Include client names, project context, and specific appreciations
            </p>
          </CardContent>
        </Card>

        {/* General Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              General Feedback
            </CardTitle>
            <CardDescription>
              Internal feedback and performance notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter internal feedback, performance reviews, and development notes..."
              value={profileData.feedback}
              onChange={(e) => updateField('feedback', e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Include performance reviews, growth areas, and achievements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Talent Pool Periods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Talent Pool Periods
          </CardTitle>
          <CardDescription>
            Track periods when the member was available in the talent pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter talent pool periods, availability windows, and bench time..."
            value={profileData.talentPoolPeriods}
            onChange={(e) => updateField('talentPoolPeriods', e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Include dates, duration, and reasons for talent pool periods
          </p>
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={loading || !hasChanges()}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving Profile...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}