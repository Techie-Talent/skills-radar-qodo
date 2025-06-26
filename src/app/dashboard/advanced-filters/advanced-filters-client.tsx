'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, Users, History, Target } from 'lucide-react';

interface FilterData {
  knowledgeAreas: Array<{ id: number; name: string; description?: string }>;
  skillCategories: Array<{ id: number; name: string; groupingCriteria?: string }>;
  skills: Array<{ 
    id: number; 
    name: string; 
    knowledgeArea?: { name: string }; 
    category?: { name: string } 
  }>;
  clients: string[];
  memberCategories: string[];
}

interface Member {
  id: number;
  email: string;
  fullName: string;
  hireDate: string;
  currentClient?: string;
  category?: string;
  location?: string;
  skills?: Array<{
    skill: { name: string; knowledgeArea?: { name: string } };
    expertiseLevel?: number;
    expertiseDescription?: string;
  }>;
}

interface AdvancedFiltersClientProps {
  filterData: FilterData;
}

export default function AdvancedFiltersClient({ filterData }: AdvancedFiltersClientProps) {
  const [filters, setFilters] = useState({
    name: '',
    knowledgeAreaId: 'all',
    skillCategoryId: 'all',
    skillId: 'all',
    currentClient: 'all',
    memberCategory: 'all',
    minExpertiseLevel: 'all',
    location: ''
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'members' | 'client-history' | 'skills-by-category'>('members');

  // Filter members based on current filters
  const fetchFilteredMembers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.set(key, value);
        }
      });

      queryParams.set('include_skills', 'true');
      queryParams.set('include_profile', 'true');

      const response = await fetch(`/api/members?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredMembers();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      knowledgeAreaId: 'all',
      skillCategoryId: 'all',
      skillId: 'all',
      currentClient: 'all',
      memberCategory: 'all',
      minExpertiseLevel: 'all',
      location: ''
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '' && value !== 'all').length;
  };

  const renderMemberCard = (member: Member) => (
    <Card key={member.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{member.fullName || 'No Name'}</CardTitle>
            <CardDescription>{member.email}</CardDescription>
          </div>
          <div className="flex gap-2">
            {member.category && (
              <Badge variant="secondary">{member.category}</Badge>
            )}
            {member.currentClient && (
              <Badge variant="outline">{member.currentClient}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Hire Date:</span> {new Date(member.hireDate).toLocaleDateString()}
            </div>
            {member.location && (
              <div>
                <span className="font-medium">Location:</span> {member.location}
              </div>
            )}
          </div>
          
          {member.skills && member.skills.length > 0 && (
            <div>
              <span className="font-medium text-sm">Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {member.skills.slice(0, 5).map((memberSkill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {memberSkill.skill.name}
                    {memberSkill.expertiseLevel && ` (${memberSkill.expertiseLevel})`}
                  </Badge>
                ))}
                {member.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{member.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderClientHistoryView = () => {
    // Group members by client (including historical - for now just current)
    const membersByClient = members.reduce((acc, member) => {
      const client = member.currentClient || 'Unassigned';
      if (!acc[client]) acc[client] = [];
      acc[client].push(member);
      return acc;
    }, {} as Record<string, Member[]>);

    return (
      <div className="space-y-6">
        {Object.entries(membersByClient).map(([client, clientMembers]) => (
          <Card key={client}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {client}
                <Badge variant="secondary">{clientMembers.length} members</Badge>
              </CardTitle>
              <CardDescription>
                Team members currently or previously assigned to this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientMembers.map(member => (
                  <div key={member.id} className="border rounded-lg p-3">
                    <div className="font-medium">{member.fullName}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                    <div className="text-sm text-muted-foreground">{member.category}</div>
                    {member.skills && (
                      <div className="mt-2">
                        <div className="text-xs font-medium">Top Skills:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill.skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderSkillsByCategoryView = () => {
    // Group members by their category and show their skills
    const membersByCategory = members.reduce((acc, member) => {
      const category = member.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(member);
      return acc;
    }, {} as Record<string, Member[]>);

    return (
      <div className="space-y-6">
        {Object.entries(membersByCategory).map(([category, categoryMembers]) => {
          // Collect all skills for this category
          const allSkills = categoryMembers.flatMap(member => 
            member.skills?.map(skill => ({
              name: skill.skill.name,
              knowledgeArea: skill.skill.knowledgeArea?.name,
              level: skill.expertiseLevel,
              member: member.fullName
            })) || []
          );

          // Group skills by name
          const skillGroups = allSkills.reduce((acc, skill) => {
            if (!acc[skill.name]) acc[skill.name] = [];
            acc[skill.name].push(skill);
            return acc;
          }, {} as Record<string, typeof allSkills>);

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {category} Skills
                  <Badge variant="secondary">{categoryMembers.length} members</Badge>
                </CardTitle>
                <CardDescription>
                  Skills distribution among {category} team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(skillGroups)
                    .sort(([, a], [, b]) => b.length - a.length)
                    .slice(0, 10)
                    .map(([skillName, skillInstances]) => (
                      <div key={skillName} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{skillName}</div>
                          <Badge variant="outline">{skillInstances.length} members</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Knowledge Area: {skillInstances[0]?.knowledgeArea || 'N/A'}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {skillInstances.map((instance, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {instance.member} {instance.level && `(${instance.level})`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Filters & Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive filtering and analysis of team members and skills
          </p>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'members' ? 'default' : 'outline'}
          onClick={() => setActiveView('members')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Members
        </Button>
        <Button
          variant={activeView === 'client-history' ? 'default' : 'outline'}
          onClick={() => setActiveView('client-history')}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          Client History
        </Button>
        <Button
          variant={activeView === 'skills-by-category' ? 'default' : 'outline'}
          onClick={() => setActiveView('skills-by-category')}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Skills by Category
        </Button>
      </div>

      {/* Filters Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()} active</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Filter team members by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Name Filter */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>

            {/* Knowledge Area Filter */}
            <div className="space-y-2">
              <Label>Knowledge Area</Label>
              <Select value={filters.knowledgeAreaId} onValueChange={(value) => handleFilterChange('knowledgeAreaId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select knowledge area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {filterData.knowledgeAreas.map(area => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skill Category Filter */}
            <div className="space-y-2">
              <Label>Skill Category</Label>
              <Select value={filters.skillCategoryId} onValueChange={(value) => handleFilterChange('skillCategoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skill category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filterData.skillCategories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skill Filter */}
            <div className="space-y-2">
              <Label>Specific Skill</Label>
              <Select value={filters.skillId} onValueChange={(value) => handleFilterChange('skillId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {filterData.skills.map(skill => (
                    <SelectItem key={skill.id} value={skill.id.toString()}>
                      {skill.name} {skill.knowledgeArea && `(${skill.knowledgeArea.name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Client Filter */}
            <div className="space-y-2">
              <Label>Current Client</Label>
              <Select value={filters.currentClient} onValueChange={(value) => handleFilterChange('currentClient', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {filterData.clients.map(client => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Member Category Filter */}
            <div className="space-y-2">
              <Label>Member Category</Label>
              <Select value={filters.memberCategory} onValueChange={(value) => handleFilterChange('memberCategory', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filterData.memberCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Expertise Level Filter */}
            <div className="space-y-2">
              <Label>Min Expertise Level</Label>
              <Select value={filters.minExpertiseLevel} onValueChange={(value) => handleFilterChange('minExpertiseLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Level</SelectItem>
                  <SelectItem value="1">1 - Beginner</SelectItem>
                  <SelectItem value="2">2 - Intermediate</SelectItem>
                  <SelectItem value="3">3 - Advanced</SelectItem>
                  <SelectItem value="4">4 - Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Search by location..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex gap-2">
            <Button onClick={fetchFilteredMembers} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Apply Filters'}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Results ({members.length} {activeView === 'members' ? 'members' : 'items'} found)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div>
              {activeView === 'members' && (
                <div className="space-y-4">
                  {members.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No members found matching the current filters.
                    </div>
                  ) : (
                    members.map(renderMemberCard)
                  )}
                </div>
              )}

              {activeView === 'client-history' && renderClientHistoryView()}

              {activeView === 'skills-by-category' && renderSkillsByCategoryView()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}