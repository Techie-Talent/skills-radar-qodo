'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Member {
  id: number;
  email: string;
  fullName: string;
  hireDate: string;
  currentClient: string | null;
  category: string;
  location: string | null;
  profile: { id: number } | null;
}

const MEMBER_CATEGORIES = ['Starter', 'Builder', 'Solver', 'Wizard'];

interface MembersClientProps {
  initialMembers: Member[];
}

export default function MembersClient({ initialMembers }: MembersClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    hireDate: '',
    currentClient: '',
    category: 'Starter',
    location: '',
  });

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMember 
        ? `/api/members/${editingMember.id}`
        : '/api/members';
      
      const method = editingMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save member');

      await fetchMembers();
      setShowForm(false);
      setEditingMember(null);
      setFormData({ email: '', fullName: '', hireDate: '', currentClient: '', category: 'Starter', location: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      email: member.email,
      fullName: member.fullName,
      hireDate: member.hireDate.split('T')[0], // Format for date input
      currentClient: member.currentClient || '',
      category: member.category,
      location: member.location || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete member');

      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMember(null);
    setFormData({ email: '', fullName: '', hireDate: '', currentClient: '', category: 'Starter', location: '' });
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground mt-2">Manage team members and their information</p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="secondary">
            <Link href="/admin/members/import">
              Import Members
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/members/import-profiles">
              Import Profiles
            </Link>
          </Button>
          <Button onClick={() => setShowForm(true)}>
            Add Member
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date *</Label>
                  <Input
                    type="date"
                    id="hireDate"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBER_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentClient">Current Client</Label>
                <Input
                  id="currentClient"
                  value={formData.currentClient}
                  onChange={(e) => setFormData({ ...formData, currentClient: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingMember ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{member.fullName}</CardTitle>
              <CardDescription>{member.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(member.category)}`}>
                    {member.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hired:</span>
                  <span className="text-sm">{formatDate(member.hireDate)}</span>
                </div>
                {member.currentClient && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Client:</span>
                    <span className="text-sm">{member.currentClient}</span>
                  </div>
                )}
                {member.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="text-sm">{member.location}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {member.profile ? 'Has profile' : 'No profile'}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    asChild
                  >
                    <Link href={`/admin/members/${member.id}`}>
                      View
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(member)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(member.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No team members found.</p>
          <div className="mt-4 flex gap-4 justify-center">
            <Button onClick={() => setShowForm(true)}>
              Add Your First Member
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/members/import">
                Import from Excel
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}