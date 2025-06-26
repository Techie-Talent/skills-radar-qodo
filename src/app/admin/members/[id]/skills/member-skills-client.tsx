'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Edit, Search, Filter } from 'lucide-react';

interface Member {
  id: number;
  email: string;
  fullName: string | null;
  category: string | null;
  skills: Array<{
    id: number;
    expertiseLevel: number | null;
    expertiseDescription: string | null;
    assessmentDate: Date | null;
    skill: {
      id: number;
      name: string;
      purpose: string | null;
      knowledgeArea: { id: number; name: string } | null;
      category: { id: number; name: string } | null;
      scale: { id: number; name: string; type: string; values: string } | null;
    };
  }>;
}

interface Skill {
  id: number;
  name: string;
  purpose: string | null;
  knowledgeArea: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
  scale: { id: number; name: string; type: string; values: string } | null;
}

interface KnowledgeArea {
  id: number;
  name: string;
}

interface SkillCategory {
  id: number;
  name: string;
}

interface MemberSkillsClientProps {
  member: Member;
  availableSkills: Skill[];
  knowledgeAreas: KnowledgeArea[];
  skillCategories: SkillCategory[];
}

export default function MemberSkillsClient({
  member,
  availableSkills,
  knowledgeAreas,
  skillCategories,
}: MemberSkillsClientProps) {
  const [memberSkills, setMemberSkills] = useState(member.skills);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [knowledgeAreaFilter, setKnowledgeAreaFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Add skill form
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [expertiseLevel, setExpertiseLevel] = useState('');
  const [expertiseDescription, setExpertiseDescription] = useState('');

  // Get skills that are not yet assigned to this member
  const assignedSkillIds = new Set(memberSkills.map(ms => ms.skill.id));
  const unassignedSkills = availableSkills.filter(skill => !assignedSkillIds.has(skill.id));

  // Filter member skills
  const filteredMemberSkills = memberSkills.filter(memberSkill => {
    const matchesSearch = !searchTerm || 
      memberSkill.skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberSkill.skill.knowledgeArea?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesKnowledgeArea = knowledgeAreaFilter === 'all' || 
      memberSkill.skill.knowledgeArea?.id.toString() === knowledgeAreaFilter;
    
    const matchesCategory = categoryFilter === 'all' || 
      memberSkill.skill.category?.id.toString() === categoryFilter;

    return matchesSearch && matchesKnowledgeArea && matchesCategory;
  });

  // Group skills by knowledge area
  const skillsByKnowledgeArea = filteredMemberSkills.reduce((acc, memberSkill) => {
    const kaName = memberSkill.skill.knowledgeArea?.name || 'Uncategorized';
    if (!acc[kaName]) acc[kaName] = [];
    acc[kaName].push(memberSkill);
    return acc;
  }, {} as Record<string, typeof filteredMemberSkills>);

  const addSkill = async () => {
    if (!selectedSkillId || !expertiseLevel) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/members/${member.id}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: parseInt(selectedSkillId),
          expertiseLevel: parseInt(expertiseLevel),
          expertiseDescription: expertiseDescription || null,
          assessmentDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const newMemberSkill = await response.json();
        setMemberSkills(prev => [...prev, newMemberSkill]);
        setShowAddDialog(false);
        setSelectedSkillId('');
        setExpertiseLevel('');
        setExpertiseDescription('');
        alert('Skill added successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add skill');
      }
    } catch (error) {
      alert('Error adding skill');
    } finally {
      setLoading(false);
    }
  };

  const updateSkill = async () => {
    if (!editingSkill || !expertiseLevel) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/members/${member.id}/skills/${editingSkill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertiseLevel: parseInt(expertiseLevel),
          expertiseDescription: expertiseDescription || null,
          assessmentDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const updatedMemberSkill = await response.json();
        setMemberSkills(prev => prev.map(ms => 
          ms.id === editingSkill.id ? updatedMemberSkill : ms
        ));
        setShowEditDialog(false);
        setEditingSkill(null);
        setExpertiseLevel('');
        setExpertiseDescription('');
        alert('Skill updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update skill');
      }
    } catch (error) {
      alert('Error updating skill');
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = async (memberSkillId: number) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/members/${member.id}/skills/${memberSkillId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMemberSkills(prev => prev.filter(ms => ms.id !== memberSkillId));
        alert('Skill removed successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove skill');
      }
    } catch (error) {
      alert('Error removing skill');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (memberSkill: any) => {
    setEditingSkill(memberSkill);
    setExpertiseLevel(memberSkill.expertiseLevel?.toString() || '');
    setExpertiseDescription(memberSkill.expertiseDescription || '');
    setShowEditDialog(true);
  };

  const getExpertiseLevelLabel = (level: number) => {
    const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert' };
    return labels[level as keyof typeof labels] || `Level ${level}`;
  };

  const getExpertiseLevelColor = (level: number) => {
    const colors = { 1: 'bg-red-100 text-red-800', 2: 'bg-yellow-100 text-yellow-800', 3: 'bg-blue-100 text-blue-800', 4: 'bg-green-100 text-green-800' };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Skills Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage skills for {member.fullName || member.email}
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
              <DialogDescription>
                Assign a new skill to {member.fullName || member.email}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="skill">Skill</Label>
                <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedSkills.map(skill => (
                      <SelectItem key={skill.id} value={skill.id.toString()}>
                        {skill.name} {skill.knowledgeArea && `(${skill.knowledgeArea.name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="expertise">Expertise Level</Label>
                <Select value={expertiseLevel} onValueChange={setExpertiseLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expertise level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Beginner</SelectItem>
                    <SelectItem value="2">2 - Intermediate</SelectItem>
                    <SelectItem value="3">3 - Advanced</SelectItem>
                    <SelectItem value="4">4 - Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Describe the expertise level..."
                  value={expertiseDescription}
                  onChange={(e) => setExpertiseDescription(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={addSkill} disabled={loading || !selectedSkillId || !expertiseLevel}>
                {loading ? 'Adding...' : 'Add Skill'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Skills</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by skill name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Knowledge Area</Label>
              <Select value={knowledgeAreaFilter} onValueChange={setKnowledgeAreaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {knowledgeAreas.map(ka => (
                    <SelectItem key={ka.id} value={ka.id.toString()}>
                      {ka.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {skillCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberSkills.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(memberSkills.map(ms => ms.skill.knowledgeArea?.name).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expert Level Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memberSkills.filter(ms => ms.expertiseLevel === 4).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills by Knowledge Area */}
      <div className="space-y-6">
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
                {skills.map(memberSkill => (
                  <div key={memberSkill.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{memberSkill.skill.name}</h4>
                        {memberSkill.skill.category && (
                          <p className="text-sm text-muted-foreground">
                            {memberSkill.skill.category.name}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(memberSkill)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeSkill(memberSkill.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {memberSkill.expertiseLevel && (
                      <Badge className={getExpertiseLevelColor(memberSkill.expertiseLevel)}>
                        {getExpertiseLevelLabel(memberSkill.expertiseLevel)}
                      </Badge>
                    )}
                    
                    {memberSkill.expertiseDescription && (
                      <p className="text-sm text-muted-foreground">
                        {memberSkill.expertiseDescription}
                      </p>
                    )}
                    
                    {memberSkill.assessmentDate && (
                      <p className="text-xs text-muted-foreground">
                        Assessed: {new Date(memberSkill.assessmentDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {Object.keys(skillsByKnowledgeArea).length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                No skills found matching the current filters.
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Skill Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>
              Update expertise level for {editingSkill?.skill.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-expertise">Expertise Level</Label>
              <Select value={expertiseLevel} onValueChange={setExpertiseLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expertise level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Beginner</SelectItem>
                  <SelectItem value="2">2 - Intermediate</SelectItem>
                  <SelectItem value="3">3 - Advanced</SelectItem>
                  <SelectItem value="4">4 - Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                placeholder="Describe the expertise level..."
                value={expertiseDescription}
                onChange={(e) => setExpertiseDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={updateSkill} disabled={loading || !expertiseLevel}>
              {loading ? 'Updating...' : 'Update Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}