'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SkillCategory {
  id: number;
  name: string;
  groupingCriteria: string | null;
  skills: any[];
}

interface SkillCategoriesClientProps {
  initialSkillCategories: SkillCategory[];
}

export default function SkillCategoriesClient({ initialSkillCategories }: SkillCategoriesClientProps) {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(initialSkillCategories);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    groupingCriteria: '',
  });

  const fetchSkillCategories = async () => {
    try {
      const response = await fetch('/api/skill-categories');
      if (!response.ok) throw new Error('Failed to fetch skill categories');
      const data = await response.json();
      setSkillCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory 
        ? `/api/skill-categories/${editingCategory.id}`
        : '/api/skill-categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save skill category');

      await fetchSkillCategories();
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', groupingCriteria: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (category: SkillCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      groupingCriteria: category.groupingCriteria || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this skill category?')) return;

    try {
      const response = await fetch(`/api/skill-categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete skill category');

      await fetchSkillCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', groupingCriteria: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Skill Categories</h1>
          <p className="text-muted-foreground mt-2">Organize skills into meaningful categories</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setShowForm(true)}>
            Add Skill Category
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
              {editingCategory ? 'Edit Skill Category' : 'Add New Skill Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupingCriteria">Grouping Criteria</Label>
                <Textarea
                  id="groupingCriteria"
                  value={formData.groupingCriteria}
                  onChange={(e) => setFormData({ ...formData, groupingCriteria: e.target.value })}
                  rows={3}
                  placeholder="Describe how skills in this category are grouped or related..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'}
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
        {skillCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              {category.groupingCriteria && (
                <CardDescription>{category.groupingCriteria}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {category.skills.length} skill{category.skills.length !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(category.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {skillCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No skill categories found.</p>
          <Button
            onClick={() => setShowForm(true)}
            className="mt-4"
          >
            Add Your First Skill Category
          </Button>
        </div>
      )}
    </div>
  );
}