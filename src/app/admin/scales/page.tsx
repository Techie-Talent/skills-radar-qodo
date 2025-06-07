'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Scale {
  id: number;
  name: string;
  type: string;
  values: string;
  skills: any[];
}

export default function ScalesPage() {
  const [scales, setScales] = useState<Scale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingScale, setEditingScale] = useState<Scale | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'numeric',
    values: '',
  });

  useEffect(() => {
    fetchScales();
  }, []);

  const fetchScales = async () => {
    try {
      const response = await fetch('/api/scales');
      if (!response.ok) throw new Error('Failed to fetch scales');
      const data = await response.json();
      setScales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scales</h1>
            <p className="text-gray-600 mt-2">Define rating scales for skill assessment</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Add Scale
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingScale ? 'Edit Scale' : 'Add New Scale'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="numeric">Numeric</option>
                    <option value="qualitative">Qualitative</option>
                    <option value="boolean">Boolean</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="values" className="block text-sm font-medium text-gray-700 mb-1">
                    Values * (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="values"
                    value={formData.values}
                    onChange={(e) => setFormData({ ...formData, values: e.target.value })}
                    placeholder="e.g., 1,2,3,4,5 or Beginner,Intermediate,Advanced or Yes,No"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Examples: "1,2,3,4,5" for numeric, "A,B,C,D,F" for qualitative, "Yes,No" for boolean
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    {editingScale ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
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
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mb-2">
                    {scale.type}
                  </span>
                  <br />
                  Values: {formatValues(scale.values)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {scale.skills.length} skill{scale.skills.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(scale)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(scale.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {scales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No scales found.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Add Your First Scale
            </button>
          </div>
        )}
      </div>
    </div>
  );
}