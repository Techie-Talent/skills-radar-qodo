'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Scale {
  id: number;
  name: string;
  type: string;
  values: string;
  skills: any[];
}

interface ScalesClientProps {
  initialScales: Scale[];
}

export default function ScalesClient({ initialScales }: ScalesClientProps) {
  const [scales, setScales] = useState<Scale[]>(initialScales);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingScale, setEditingScale] = useState<Scale | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'numeric',
    values: '',
  });

  const fetchScales = async () => {
    try {
      const response = await fetch('/api/scales');
      if (!response.ok) throw new Error('Failed to fetch scales');
      const data = await response.json();
      setScales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingScale 
        ? `/api/scales/${editingScale.id}`
        : '/api/scales';
      
      const method = editingScale ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save scale');

      await fetchScales();
      setShowForm(false);
      setEditingScale(null);
      setFormData({ name: '', type: 'numeric', values: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (scale: Scale) => {
    setEditingScale(scale);
    setFormData({
      name: scale.name,
      type: scale.type,
      values: scale.values,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scale?')) return;

    try {
      const response = await fetch(`/api/scales/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete scale');

      await fetchScales();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingScale(null);
    setFormData({ name: '', type: 'numeric', values: '' });
  };

  const formatValues = (values: string) => {
    return values.split(',').map(v => v.trim()).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scales</h1>
          <p className="text-muted-foreground mt-2">Define rating scales for skill assessment</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setShowForm(true)}>
            Add Scale
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
              {editingScale ? 'Edit Scale' : 'Add New Scale'}
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
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numeric">Numeric</SelectItem>
                    <SelectItem value="qualitative">Qualitative</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="values">Values * (comma-separated)</Label>
                <Input
                  id="values"
                  value={formData.values}
                  onChange={(e) => setFormData({ ...formData, values: e.target.value })}
                  placeholder="e.g., 1,2,3,4,5 or Beginner,Intermediate,Advanced or Yes,No"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Examples: "1,2,3,4,5" for numeric, "A,B,C,D,F" for qualitative, "Yes,No" for boolean
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingScale ? 'Update' : 'Create'}
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
        {scales.map((scale) => (
          <Card key={scale.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{scale.name}</CardTitle>
              <CardDescription>
                <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full mb-2">
                  {scale.type}
                </span>
                <br />
                Values: {formatValues(scale.values)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {scale.skills.length} skill{scale.skills.length !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(scale)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(scale.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scales.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No scales found.</p>
          <Button
            onClick={() => setShowForm(true)}
            className="mt-4"
          >
            Add Your First Scale
          </Button>
        </div>
      )}
    </div>
  );
}