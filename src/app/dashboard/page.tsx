'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';

interface Member {
  id: number;
  email: string;
  fullName: string;
  hireDate: string;
  currentClient: string | null;
  category: string;
  location: string | null;
  profile: any | null;
}

interface KnowledgeArea {
  id: number;
  name: string;
}

interface Skill {
  id: number;
  name: string;
  knowledgeArea: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
}

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [knowledgeAreaFilter, setKnowledgeAreaFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, knowledgeAreasRes, skillsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/knowledge-areas'),
        fetch('/api/skills'),
      ]);

      if (!membersRes.ok || !knowledgeAreasRes.ok || !skillsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [membersData, knowledgeAreasData, skillsData] = await Promise.all([
        membersRes.json(),
        knowledgeAreasRes.json(),
        skillsRes.json(),
      ]);

      setMembers(membersData);
      setKnowledgeAreas(knowledgeAreasData);
      setSkills(skillsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesName = member.fullName.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesCategory = !categoryFilter || member.category === categoryFilter;
    const matchesClient = !clientFilter || (member.currentClient && member.currentClient.toLowerCase().includes(clientFilter.toLowerCase()));
    
    return matchesName && matchesCategory && matchesClient;
  });

  const uniqueCategories = [...new Set(members.map(m => m.category))];
  const uniqueClients = [...new Set(members.map(m => m.currentClient).filter(Boolean))];

  const getCategoryColor = (category: string) => {
    const colors = {
      Starter: 'bg-green-100 text-green-800',
      Builder: 'bg-blue-100 text-blue-800',
      Solver: 'bg-purple-100 text-purple-800',
      Wizard: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <PermissionGuard permission="dashboard.read">
        <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}>
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">Loading...</div>
          </div>
        </SidebarLayout>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="dashboard.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">View and filter team member information</p>
            </div>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/dashboard/talent-search">
                  Advanced Search
                </Link>
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Knowledge Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{knowledgeAreas.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skills.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueClients.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter team members by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameFilter">Name</Label>
                  <Input
                    id="nameFilter"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Search by name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryFilter">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {uniqueCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientFilter">Client</Label>
                  <Input
                    id="clientFilter"
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    placeholder="Search by client..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="knowledgeAreaFilter">Knowledge Area</Label>
                  <Select value={knowledgeAreaFilter} onValueChange={setKnowledgeAreaFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Knowledge Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Knowledge Areas</SelectItem>
                      {knowledgeAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex gap-2 items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNameFilter('');
                    setCategoryFilter('');
                    setClientFilter('');
                    setKnowledgeAreaFilter('');
                  }}
                >
                  Clear Filters
                </Button>
                <span className="text-sm text-muted-foreground">
                  Showing {filteredMembers.length} of {members.length} members
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{member.fullName}</CardTitle>
                  <CardDescription>{member.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(member.category)}`}>
                        {member.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Hired:</span>
                      <span className="text-sm">{formatDate(member.hireDate)}</span>
                    </div>
                    {member.currentClient && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Client:</span>
                        <span className="text-sm">{member.currentClient}</span>
                      </div>
                    )}
                    {member.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="text-sm">{member.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profile:</span>
                      <span className="text-xs text-gray-500">
                        {member.profile ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {members.length === 0 ? 'No team members found.' : 'No members match the current filters.'}
              </p>
              {members.length === 0 && (
                <Button asChild className="mt-4">
                  <Link href="/admin/members">
                    Add Team Members
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </SidebarLayout>
    </PermissionGuard>
  );
}