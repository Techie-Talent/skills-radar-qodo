'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface KnowledgeArea {
  id: number;
  name: string;
  description: string | null;
  skills: any[];
}

interface KnowledgeAreasClientProps {
  initialKnowledgeAreas: KnowledgeArea[];
}

export default function KnowledgeAreasClient({ initialKnowledgeAreas }: KnowledgeAreasClientProps) {
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>(initialKnowledgeAreas);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<KnowledgeArea | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const fetchKnowledgeAreas = async () => {
    try {
      const response = await fetch('/api/knowledge-areas');
      if (!response.ok) throw new Error('Failed to fetch knowledge areas');
      const data = await response.json();
      setKnowledgeAreas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingArea 
        ? `/api/knowledge-areas/${editingArea.id}`
        : '/api/knowledge-areas';
      
      const method = editingArea ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save knowledge area');

      await fetchKnowledgeAreas();
      setShowForm(false);
      setEditingArea(null);
      setFormData({ name: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (area: KnowledgeArea) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      description: area.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this knowledge area?')) return;

    try {
      const response = await fetch(`/api/knowledge-areas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete knowledge area');

      await fetchKnowledgeAreas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingArea(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Areas</h1>
          <p className="text-muted-foreground">
            Manage knowledge domains and areas of expertise
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Knowledge Area
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingArea ? 'Edit Knowledge Area' : 'Add New Knowledge Area'}
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingArea ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {knowledgeAreas.map((area) => (
          <Card key={area.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{area.name}</CardTitle>
                  {area.description && (
                    <CardDescription>{area.description}</CardDescription>
                  )}
                </div>
                <Badge variant="secondary">
                  {area.skills.length} skill{area.skills.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(area)}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(area.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {knowledgeAreas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-4xl">🧠</div>
              <div>
                <h3 className="text-lg font-semibold">No knowledge areas found</h3>
                <p className="text-muted-foreground">
                  Get started by creating your first knowledge area
                </p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Knowledge Area
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}