'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface SkillCategory {
  id: number;
  name: string;
}

interface Skill {
  id: number;
  name: string;
  knowledgeArea: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
}

export default function TalentSearchPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    category: '',
    client: '',
    location: '',
    knowledgeArea: '',
    skillCategory: '',
    skill: '',
    hireDateFrom: '',
    hireDateTo: '',
    availableOnly: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, knowledgeAreasRes, skillCategoriesRes, skillsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/knowledge-areas'),
        fetch('/api/skill-categories'),
        fetch('/api/skills'),
      ]);

      if (!membersRes.ok || !knowledgeAreasRes.ok || !skillCategoriesRes.ok || !skillsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [membersData, knowledgeAreasData, skillCategoriesData, skillsData] = await Promise.all([
        membersRes.json(),
        knowledgeAreasRes.json(),
        skillCategoriesRes.json(),
        skillsRes.json(),
      ]);

      setMembers(membersData);
      setKnowledgeAreas(knowledgeAreasData);
      setSkillCategories(skillCategoriesData);
      setSkills(skillsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesName = !searchFilters.name || 
      member.fullName.toLowerCase().includes(searchFilters.name.toLowerCase());
    
    const matchesCategory = !searchFilters.category || 
      member.category === searchFilters.category;
    
    const matchesClient = !searchFilters.client || 
      (member.currentClient && member.currentClient.toLowerCase().includes(searchFilters.client.toLowerCase()));
    
    const matchesLocation = !searchFilters.location || 
      (member.location && member.location.toLowerCase().includes(searchFilters.location.toLowerCase()));
    
    const matchesAvailability = !searchFilters.availableOnly || 
      !member.currentClient;
    
    const hireDate = new Date(member.hireDate);
    const matchesHireDateFrom = !searchFilters.hireDateFrom || 
      hireDate >= new Date(searchFilters.hireDateFrom);
    
    const matchesHireDateTo = !searchFilters.hireDateTo || 
      hireDate <= new Date(searchFilters.hireDateTo);

    return matchesName && matchesCategory && matchesClient && matchesLocation && 
           matchesAvailability && matchesHireDateFrom && matchesHireDateTo;
  });

  const uniqueCategories = [...new Set(members.map(m => m.category))];
  const uniqueClients = [...new Set(members.map(m => m.currentClient).filter(Boolean))];
  const uniqueLocations = [...new Set(members.map(m => m.location).filter(Boolean))];

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

  const clearFilters = () => {
    setSearchFilters({
      name: '',
      category: '',
      client: '',
      location: '',
      knowledgeArea: '',
      skillCategory: '',
      skill: '',
      hireDateFrom: '',
      hireDateTo: '',
      availableOnly: false,
    });
  };

  const updateFilter = (key: string, value: string | boolean) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <PermissionGuard permission="dashboard.read">
        <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Talent Search' }]}>
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">Loading...</div>
          </div>
        </SidebarLayout>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="dashboard.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Talent Search' }]}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Talent Search</h1>
              <p className="text-gray-600 mt-2">Advanced search and filtering for team members</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Advanced Search Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
              <CardDescription>Use multiple criteria to find the right talent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Basic Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={searchFilters.name}
                    onChange={(e) => updateFilter('name', e.target.value)}
                    placeholder="Search by name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={searchFilters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={searchFilters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input
                    type="text"
                    value={searchFilters.client}
                    onChange={(e) => updateFilter('client', e.target.value)}
                    placeholder="Search by client..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Skill-based Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Knowledge Area</label>
                  <select
                    value={searchFilters.knowledgeArea}
                    onChange={(e) => updateFilter('knowledgeArea', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Knowledge Areas</option>
                    {knowledgeAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Category</label>
                  <select
                    value={searchFilters.skillCategory}
                    onChange={(e) => updateFilter('skillCategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Skill Categories</option>
                    {skillCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specific Skill</label>
                  <select
                    value={searchFilters.skill}
                    onChange={(e) => updateFilter('skill', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Skills</option>
                    {skills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hired From</label>
                  <input
                    type="date"
                    value={searchFilters.hireDateFrom}
                    onChange={(e) => updateFilter('hireDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hired To</label>
                  <input
                    type="date"
                    value={searchFilters.hireDateTo}
                    onChange={(e) => updateFilter('hireDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Availability Filter */}
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={searchFilters.availableOnly}
                    onChange={(e) => updateFilter('availableOnly', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Show only available talent (not assigned to clients)
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4 items-center">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Clear All Filters
                </button>
                <span className="text-sm text-gray-600">
                  Showing {filteredMembers.length} of {members.length} members
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {member.fullName}
                    {!member.currentClient && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Available
                      </span>
                    )}
                  </CardTitle>
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
                {members.length === 0 ? 'No team members found.' : 'No members match the current search criteria.'}
              </p>
              {members.length === 0 && (
                <Link
                  href="/admin/members"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Team Members
                </Link>
              )}
            </div>
          )}
        </div>
      </SidebarLayout>
    </PermissionGuard>
  );
}